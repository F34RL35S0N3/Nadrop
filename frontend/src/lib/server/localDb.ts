import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Address, Hex } from "viem";
import { MARKET_RESET_ID } from "@/lib/server/reset";
import { getSupabaseAdmin } from "@/lib/server/supabase";

type Statement = {
  all: (...params: unknown[]) => unknown[];
  get: (...params: unknown[]) => unknown;
  run: (...params: unknown[]) => unknown;
};

type SqliteDb = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
};

type DatabaseSyncCtor = new (filename: string) => SqliteDb;

export type StakeRecord = {
  marketId: number;
  userAddress: Address;
  side: boolean;
  amount: bigint;
  txHash: Hex | null;
  createdAt: number;
};

let db: SqliteDb | null = null;

async function loadDatabaseSync() {
  const dynamicImport = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<{ DatabaseSync: DatabaseSyncCtor }>;

  const sqlite = await dynamicImport("node:sqlite");
  return sqlite.DatabaseSync;
}

export async function getLocalDb() {
  if (db) return db;

  const dataDir = path.join(process.cwd(), ".data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const DatabaseSync = await loadDatabaseSync();
  db = new DatabaseSync(path.join(dataDir, "swipepredict.sqlite"));
  db.exec(`
    CREATE TABLE IF NOT EXISTS claim_txs (
      market_id INTEGER NOT NULL,
      user_address TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (market_id, user_address)
    );

    CREATE TABLE IF NOT EXISTS stake_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_id INTEGER NOT NULL,
      user_address TEXT NOT NULL,
      side INTEGER NOT NULL,
      amount TEXT NOT NULL,
      tx_hash TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS stake_records_user_idx
      ON stake_records (user_address);

    CREATE INDEX IF NOT EXISTS stake_records_market_idx
      ON stake_records (market_id);
  `);

  return db;
}

export async function getClaimTxHash(marketId: number, user: Address) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("claim_txs")
      .select("tx_hash")
      .eq("market_id", marketId)
      .eq("user_address", user.toLowerCase())
      .maybeSingle();

    if (!error) return (data?.tx_hash as Hex | undefined) ?? null;
    console.error("Supabase read claim tx failed", error);
  }

  const localDb = await getLocalDb();
  const row = localDb
    .prepare(
      "SELECT tx_hash AS txHash FROM claim_txs WHERE market_id = ? AND user_address = ?",
    )
    .get(marketId, user.toLowerCase()) as { txHash?: Hex } | undefined;

  return row?.txHash ?? null;
}

export async function saveClaimTxHash(
  marketId: number,
  user: Address,
  txHash: Hex,
) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("claim_txs").upsert({
      market_id: marketId,
      user_address: user.toLowerCase(),
      tx_hash: txHash,
      created_at: new Date().toISOString(),
    });

    if (!error) return;
    console.error("Supabase save claim tx failed", error);
  }

  const localDb = await getLocalDb();
  localDb
    .prepare(
      `INSERT INTO claim_txs (market_id, user_address, tx_hash, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(market_id, user_address)
       DO UPDATE SET tx_hash = excluded.tx_hash`,
    )
    .run(marketId, user.toLowerCase(), txHash, Date.now());
}

export async function saveStakeRecord(record: StakeRecord) {
  const supabase = getSupabaseAdmin();
  if (supabase && record.txHash) {
    const { error } = await supabase.from("stake_records").upsert(
      {
        market_id: record.marketId,
        user_address: record.userAddress.toLowerCase(),
        side: record.side,
        amount: record.amount.toString(),
        tx_hash: record.txHash,
        created_at: new Date(record.createdAt).toISOString(),
      },
      { onConflict: "tx_hash" },
    );

    if (!error) return;
    console.error("Supabase save stake failed", error);
  }

  const localDb = await getLocalDb();
  localDb
    .prepare(
      `INSERT OR IGNORE INTO stake_records
       (market_id, user_address, side, amount, tx_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.marketId,
      record.userAddress.toLowerCase(),
      record.side ? 1 : 0,
      record.amount.toString(),
      record.txHash,
      record.createdAt,
    );
}

export async function readStakeRecords() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("stake_records")
      .select("market_id,user_address,side,amount,tx_hash,created_at")
      .gte("market_id", MARKET_RESET_ID)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((row) => ({
        marketId: Number(row.market_id),
        userAddress: row.user_address as Address,
        side: Boolean(row.side),
        amount: BigInt(String(row.amount)),
        txHash: row.tx_hash as Hex,
        createdAt: new Date(String(row.created_at)).getTime(),
      }));
    }

    console.error("Supabase read stakes failed", error);
  }

  const localDb = await getLocalDb();
  const rows = localDb
    .prepare(
      `SELECT
        market_id AS marketId,
        user_address AS userAddress,
        side,
        amount,
       tx_hash AS txHash,
       created_at AS createdAt
       FROM stake_records
       WHERE market_id >= ?
       ORDER BY created_at DESC`,
    )
    .all(MARKET_RESET_ID) as Array<{
    marketId: number;
    userAddress: Address;
    side: number;
    amount: string;
    txHash: Hex | null;
    createdAt: number;
  }>;

  return rows.map((row) => ({
    marketId: row.marketId,
    userAddress: row.userAddress,
    side: row.side === 1,
    amount: BigInt(row.amount),
    txHash: row.txHash,
    createdAt: row.createdAt,
  }));
}

export async function readStakeRecordsByUser(user: Address) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("stake_records")
      .select("market_id,user_address,side,amount,tx_hash,created_at")
      .eq("user_address", user.toLowerCase())
      .gte("market_id", MARKET_RESET_ID)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((row) => ({
        marketId: Number(row.market_id),
        userAddress: row.user_address as Address,
        side: Boolean(row.side),
        amount: BigInt(String(row.amount)),
        txHash: row.tx_hash as Hex,
        createdAt: new Date(String(row.created_at)).getTime(),
      }));
    }

    console.error("Supabase read user stakes failed", error);
  }

  const localDb = await getLocalDb();
  const rows = localDb
    .prepare(
      `SELECT
        market_id AS marketId,
        user_address AS userAddress,
        side,
        amount,
        tx_hash AS txHash,
       created_at AS createdAt
       FROM stake_records
       WHERE user_address = ?
       AND market_id >= ?
       ORDER BY created_at DESC`,
    )
    .all(user.toLowerCase(), MARKET_RESET_ID) as Array<{
    marketId: number;
    userAddress: Address;
    side: number;
    amount: string;
    txHash: Hex | null;
    createdAt: number;
  }>;

  return rows.map((row) => ({
    marketId: row.marketId,
    userAddress: row.userAddress,
    side: row.side === 1,
    amount: BigInt(row.amount),
    txHash: row.txHash,
    createdAt: row.createdAt,
  }));
}

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Address, Hex } from "viem";

type Statement = {
  get: (...params: unknown[]) => unknown;
  run: (...params: unknown[]) => unknown;
};

type SqliteDb = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
};

type DatabaseSyncCtor = new (filename: string) => SqliteDb;

let db: SqliteDb | null = null;

async function loadDatabaseSync() {
  const dynamicImport = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<{ DatabaseSync: DatabaseSyncCtor }>;

  const sqlite = await dynamicImport("node:sqlite");
  return sqlite.DatabaseSync;
}

export async function getClaimTxDb() {
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
    )
  `);

  return db;
}

export async function getClaimTxHash(marketId: number, user: Address) {
  const claimDb = await getClaimTxDb();
  const row = claimDb
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
  const claimDb = await getClaimTxDb();
  claimDb
    .prepare(
      `INSERT INTO claim_txs (market_id, user_address, tx_hash, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(market_id, user_address)
       DO UPDATE SET tx_hash = excluded.tx_hash`,
    )
    .run(marketId, user.toLowerCase(), txHash, Date.now());
}

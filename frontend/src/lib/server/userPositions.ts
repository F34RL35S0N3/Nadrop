import type { Address } from "viem";
import { readStake } from "@/lib/contract";
import { readRecentMarketSnapshots } from "@/lib/server/marketSnapshots";
import type { StakeRecord } from "@/lib/server/localDb";

const cacheTtlMs = 10_000;
const chunkSize = 4;

const cache = new Map<string, { expiresAt: number; data: StakeRecord[] }>();
const inFlight = new Map<string, Promise<StakeRecord[]>>();

function recordKey(record: Pick<StakeRecord, "marketId" | "userAddress" | "side">) {
  return `${record.marketId}:${record.userAddress.toLowerCase()}:${record.side ? 1 : 0}`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    const chunk = items.slice(index, index + chunkSize);
    results.push(...(await Promise.all(chunk.map(mapper))));
  }

  return results;
}

export function mergeStakeRecords(
  primary: StakeRecord[],
  fallback: StakeRecord[],
) {
  const seen = new Set(primary.map(recordKey));
  const merged = [...primary];

  for (const record of fallback) {
    if (seen.has(recordKey(record))) continue;
    merged.push(record);
  }

  return merged;
}

async function loadUserOnchainStakeRecords(user: Address) {
  const markets = await readRecentMarketSnapshots();
  const queries = markets.flatMap((market) => [
    { marketId: market.id, side: true },
    { marketId: market.id, side: false },
  ]);

  const rows = await mapWithConcurrency(queries, async (query) => ({
    ...query,
    amount: await readStake(query.marketId, user, query.side),
  }));

  return rows
    .filter((row) => row.amount > BigInt(0))
    .map(
      (row) =>
        ({
          marketId: row.marketId,
          userAddress: user,
          side: row.side,
          amount: row.amount,
          txHash: null,
          createdAt: 0,
        }) satisfies StakeRecord,
    );
}

export async function readUserOnchainStakeRecords(user: Address) {
  const key = user.toLowerCase();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const activeRequest =
    inFlight.get(key) ??
    loadUserOnchainStakeRecords(user).finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, activeRequest);

  try {
    const data = await activeRequest;
    cache.set(key, {
      expiresAt: Date.now() + cacheTtlMs,
      data,
    });
    return data;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

import { readMarket, readNextMarketId } from "@/lib/contract";

export type MarketSnapshot = {
  id: number;
  deadline: string;
  resolved: boolean;
  outcome: boolean;
  totalYes: string;
  totalNo: string;
};

const marketLimit = 12;
const cacheTtlMs = 8_000;
const chunkSize = 4;

let cache: { expiresAt: number; data: MarketSnapshot[] } | null = null;
let inFlight: Promise<MarketSnapshot[]> | null = null;

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

async function loadSnapshots() {
  const nextId = await readNextMarketId();
  const startId = Math.max(0, nextId - marketLimit);
  const ids = Array.from(
    { length: nextId - startId },
    (_, index) => startId + index,
  ).reverse();

  const snapshots = await mapWithConcurrency(ids, async (id) => {
    const market = await readMarket(id);

    return {
      id,
      deadline: market.deadline.toString(),
      resolved: market.resolved,
      outcome: market.outcome,
      totalYes: market.totalYes.toString(),
      totalNo: market.totalNo.toString(),
    } satisfies MarketSnapshot;
  });

  cache = {
    expiresAt: Date.now() + cacheTtlMs,
    data: snapshots,
  };

  return snapshots;
}

export async function readRecentMarketSnapshots() {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  if (!inFlight) {
    inFlight = loadSnapshots().finally(() => {
      inFlight = null;
    });
  }

  try {
    return await inFlight;
  } catch (error) {
    if (cache) return cache.data;
    throw error;
  }
}

export async function readMarketSnapshotMap() {
  const snapshots = await readRecentMarketSnapshots();

  return new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
}

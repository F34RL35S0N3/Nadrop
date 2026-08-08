import type { Address } from "viem";
import { readNextMarketId, readStake } from "@/lib/contract";
import type { StakeRecord } from "@/lib/server/localDb";

const marketScanLimit = 12;
const rpcDelayMs = 120;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function recordKey(record: Pick<StakeRecord, "marketId" | "userAddress" | "side">) {
  return `${record.marketId}:${record.userAddress.toLowerCase()}:${record.side ? 1 : 0}`;
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

export async function readUserOnchainStakeRecords(user: Address) {
  const nextMarketId = await readNextMarketId();
  const startId = Math.max(0, nextMarketId - marketScanLimit);
  const records: StakeRecord[] = [];

  for (let marketId = startId; marketId < nextMarketId; marketId += 1) {
    const yesStake = await readStake(marketId, user, true);
    if (yesStake > BigInt(0)) {
      records.push({
        marketId,
        userAddress: user,
        side: true,
        amount: yesStake,
        txHash: null,
        createdAt: 0,
      });
    }

    await sleep(rpcDelayMs);

    const noStake = await readStake(marketId, user, false);
    if (noStake > BigInt(0)) {
      records.push({
        marketId,
        userAddress: user,
        side: false,
        amount: noStake,
        txHash: null,
        createdAt: 0,
      });
    }

    await sleep(rpcDelayMs);
  }

  return records;
}

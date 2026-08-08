import { NextRequest, NextResponse } from "next/server";
import { formatUnits, getAddress, isAddress, type Address } from "viem";
import { readMarketMetadataMap } from "@/lib/server/marketMetadata";
import { readStakeRecordsByUser } from "@/lib/server/localDb";
import { readMarketSnapshotMap } from "@/lib/server/marketSnapshots";
import type { Prediction } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HistoryStats = {
  wins: number;
  losses: number;
  pending: number;
  profit: number;
  winRate: number;
  total: number;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function toUsdc(amount: bigint) {
  return Number(formatUnits(amount, 6));
}

export async function GET(request: NextRequest) {
  try {
    const userAddressParam = request.nextUrl.searchParams.get("userAddress");
    if (!userAddressParam || !isAddress(userAddressParam)) {
      return NextResponse.json(
        { error: "Invalid userAddress" },
        { status: 400 },
      );
    }

    const userAddress = getAddress(userAddressParam) as Address;
    const records = await readStakeRecordsByUser(userAddress);
    const marketMap = await readMarketSnapshotMap();
    const metadataMap = await readMarketMetadataMap();
    const predictions: Prediction[] = [];
    const stats: HistoryStats = {
      wins: 0,
      losses: 0,
      pending: 0,
      profit: 0,
      winRate: 0,
      total: 0,
    };

    for (const record of records) {
      const market = marketMap.get(record.marketId);
      if (!market) continue;

      const meta = metadataMap[record.marketId] ?? {
        question: `Market #${record.marketId}`,
        category: "General",
      };
      const totalYes = BigInt(market.totalYes);
      const totalNo = BigInt(market.totalNo);
      const totalPool = totalYes + totalNo;
      const winningPool = market.outcome ? totalYes : totalNo;
      const stake = toUsdc(record.amount);
      let status: Prediction["status"] = "pending";
      let payout: number | null = null;

      if (market.resolved) {
        if (record.side === market.outcome && winningPool > BigInt(0)) {
          const fee = (totalPool * BigInt(500)) / BigInt(10_000);
          const rawPayout = (record.amount * (totalPool - fee)) / winningPool;
          payout = toUsdc(rawPayout);
          status = "won";
          stats.wins += 1;
          stats.profit += payout - stake;
        } else {
          payout = 0;
          status = "lost";
          stats.losses += 1;
          stats.profit -= stake;
        }
      } else {
        stats.pending += 1;
      }

      stats.total += 1;
      predictions.push({
        id: record.txHash ?? `${record.marketId}-${record.side ? "yes" : "no"}`,
        marketId: String(record.marketId),
        question: meta.question,
        choice: record.side ? "YA" : "TIDAK",
        stake,
        status,
        payout,
        txHash: record.txHash ?? "",
        settledAt: market.resolved ? record.createdAt || null : null,
        settlementTime: null,
      });
    }

    const resolvedTotal = stats.wins + stats.losses;
    stats.winRate =
      resolvedTotal === 0 ? 0 : Math.round((stats.wins / resolvedTotal) * 100);

    return NextResponse.json({ predictions, stats });
  } catch (error) {
    console.error("Read history failed", error);

    return NextResponse.json(
      { error: "Read history failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

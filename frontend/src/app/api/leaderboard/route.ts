import { NextRequest, NextResponse } from "next/server";
import { formatUnits, getAddress, isAddress, type Address } from "viem";
import { readMarket } from "@/lib/contract";
import { readStakeRecords } from "@/lib/server/localDb";
import {
  mergeStakeRecords,
  readUserOnchainStakeRecords,
} from "@/lib/server/userPositions";
import type { LeaderboardEntry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserStats = {
  address: Address;
  wins: number;
  losses: number;
  profit: bigint;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function toNumberUsdc(amount: bigint) {
  return Number(formatUnits(amount, 6));
}

export async function GET(request: NextRequest) {
  try {
    const userAddressParam = request.nextUrl.searchParams.get("userAddress");
    const userAddress =
      userAddressParam && isAddress(userAddressParam)
        ? (getAddress(userAddressParam) as Address)
        : null;
    const dbRecords = await readStakeRecords();
    const records = userAddress
      ? mergeStakeRecords(
          dbRecords,
          await readUserOnchainStakeRecords(userAddress),
        )
      : dbRecords;
    const positionAmounts = new Map<string, bigint>();
    const marketIds = new Set<number>();

    for (const record of records) {
      marketIds.add(record.marketId);

      const key = `${record.marketId}:${record.userAddress.toLowerCase()}:${record.side ? 1 : 0}`;
      positionAmounts.set(key, (positionAmounts.get(key) ?? BigInt(0)) + record.amount);
    }

    const markets = new Map<number, Awaited<ReturnType<typeof readMarket>>>();
    for (const marketId of marketIds) {
      markets.set(marketId, await readMarket(marketId));
    }

    const users = new Map<string, UserStats>();

    for (const [key, amount] of positionAmounts.entries()) {
      const [marketIdRaw, userRaw, sideRaw] = key.split(":");
      const marketId = Number(marketIdRaw);
      const user = userRaw as Address;
      const side = sideRaw === "1";
      const market = markets.get(marketId);

      if (!market?.resolved) continue;

      const totalPool = market.totalYes + market.totalNo;
      const winningPool = market.outcome ? market.totalYes : market.totalNo;
      const stats =
        users.get(user) ??
        ({
          address: user,
          wins: 0,
          losses: 0,
          profit: BigInt(0),
        } satisfies UserStats);

      if (side === market.outcome && winningPool > BigInt(0)) {
        const fee = (totalPool * BigInt(500)) / BigInt(10_000);
        const payout = (amount * (totalPool - fee)) / winningPool;
        stats.wins += 1;
        stats.profit += payout - amount;
      } else {
        stats.losses += 1;
        stats.profit -= amount;
      }

      users.set(user, stats);
    }

    const entries: LeaderboardEntry[] = Array.from(users.values())
      .sort((a, b) => {
        const profitDiff = b.profit - a.profit;
        if (profitDiff !== BigInt(0)) return profitDiff > BigInt(0) ? 1 : -1;
        return b.wins - a.wins;
      })
      .map((stats, index) => {
        const totalResolved = stats.wins + stats.losses;

        return {
          rank: index + 1,
          address: stats.address,
          displayName: null,
          wins: stats.wins,
          losses: stats.losses,
          winRate:
            totalResolved === 0
              ? 0
              : Math.round((stats.wins / totalResolved) * 100),
          totalProfit: toNumberUsdc(stats.profit),
          isCurrentUser: false,
        };
      });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Read leaderboard failed", error);

    return NextResponse.json(
      { error: "Read leaderboard failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

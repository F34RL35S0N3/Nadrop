"use client";

import { useState, useEffect } from "react";
import { formatUnits, type Address } from "viem";
import { publicClient, PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contract";
import { LeaderboardEntry } from "@/lib/types";
import { useWallet } from "@/components/providers/WalletProvider";

export function useLeaderboard() {
  const { address: currentUser } = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchLeaderboard() {
      try {
        const stakedLogs = await publicClient.getLogs({
          address: PREDICTION_MARKET_ADDRESS,
          event: PREDICTION_MARKET_ABI[7], // Staked event
          fromBlock: 0n,
          toBlock: "latest",
        });

        const claimedLogs = await publicClient.getLogs({
          address: PREDICTION_MARKET_ADDRESS,
          event: PREDICTION_MARKET_ABI[6], // Claimed event
          fromBlock: 0n,
          toBlock: "latest",
        });

        const userStats: Record<Address, {
          stakedAmount: bigint;
          claimedAmount: bigint;
          uniqueMarkets: Set<bigint>;
          wins: number;
        }> = {};

        // Process Staked logs
        for (const log of stakedLogs) {
          const { user, amount, marketId } = log.args;
          if (!user || amount === undefined || marketId === undefined) continue;
          
          if (!userStats[user]) {
            userStats[user] = { stakedAmount: 0n, claimedAmount: 0n, uniqueMarkets: new Set(), wins: 0 };
          }
          userStats[user].stakedAmount += amount;
          userStats[user].uniqueMarkets.add(marketId);
        }

        // Process Claimed logs
        for (const log of claimedLogs) {
          const { user, payout, marketId } = log.args;
          if (!user || payout === undefined || marketId === undefined) continue;

          if (!userStats[user]) {
            userStats[user] = { stakedAmount: 0n, claimedAmount: 0n, uniqueMarkets: new Set(), wins: 0 };
          }
          userStats[user].claimedAmount += payout;
          userStats[user].wins += 1;
        }

        // Convert to LeaderboardEntry array
        const entries: LeaderboardEntry[] = Object.entries(userStats).map(([address, stats]) => {
          const staked = Number(formatUnits(stats.stakedAmount, 6));
          const claimed = Number(formatUnits(stats.claimedAmount, 6));
          const totalProfit = claimed - staked;
          const totalMarkets = stats.uniqueMarkets.size;
          const losses = Math.max(0, totalMarkets - stats.wins);
          const winRate = totalMarkets > 0 ? Math.round((stats.wins / totalMarkets) * 100) : 0;

          return {
            rank: 0, // Assigned later
            address: address as Address,
            displayName: null,
            wins: stats.wins,
            losses,
            winRate,
            totalProfit,
            isCurrentUser: currentUser ? address.toLowerCase() === currentUser.toLowerCase() : false,
          };
        });

        // Sort by total profit descending
        entries.sort((a, b) => b.totalProfit - a.totalProfit);

        // Assign ranks
        entries.forEach((entry, i) => {
          entry.rank = i + 1;
        });

        if (mounted) {
          setLeaderboard(entries);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  return { leaderboard, isLoading };
}

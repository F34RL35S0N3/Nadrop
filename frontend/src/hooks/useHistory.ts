"use client";

import { useState, useEffect } from "react";
import { formatUnits, type Address, type Hex } from "viem";
import { publicClient, PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, readMarket } from "@/lib/contract";
import { Prediction } from "@/lib/types";
import { useWallet } from "@/components/providers/WalletProvider";

export function useHistory() {
  const { address: currentUser } = useWallet();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPredictions([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchHistory() {
      try {
        setIsLoading(true);
        // Fetch Staked logs for current user
        const stakedLogs = await publicClient.getLogs({
          address: PREDICTION_MARKET_ADDRESS,
          event: PREDICTION_MARKET_ABI[7], // Staked event
          args: { user: currentUser as Address },
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Group by market ID to get total stake per market
        const marketStakes = new Map<bigint, { amount: bigint, side: boolean, txHash: Hex, timestamp: number }>();
        for (const log of stakedLogs) {
          const { marketId, side, amount } = log.args;
          if (marketId === undefined || side === undefined || amount === undefined) continue;

          // Simple block timestamp estimation or placeholder (since getting each block is slow)
          // For a robust app, we'd fetch block timestamp. Here we just use a fallback.
          const timestamp = Date.now(); 

          if (marketStakes.has(marketId)) {
            marketStakes.get(marketId)!.amount += amount;
          } else {
            marketStakes.set(marketId, { amount, side, txHash: log.transactionHash as Hex, timestamp });
          }
        }

        // Fetch Claimed logs to determine wins
        const claimedLogs = await publicClient.getLogs({
          address: PREDICTION_MARKET_ADDRESS,
          event: PREDICTION_MARKET_ABI[6], // Claimed event
          args: { user: currentUser as Address },
          fromBlock: 0n,
          toBlock: "latest",
        });

        const claimedMarkets = new Map<bigint, bigint>();
        for (const log of claimedLogs) {
          const { marketId, payout } = log.args;
          if (marketId !== undefined && payout !== undefined) {
            claimedMarkets.set(marketId, payout);
          }
        }

        // Fetch market metadata for all staked markets
        const fetchedPredictions: Prediction[] = [];
        for (const [marketId, data] of marketStakes.entries()) {
          const market = await readMarket(Number(marketId));
          const payout = claimedMarkets.get(marketId);
          
          let status: Prediction["status"] = "pending";
          if (market.resolved) {
            if (payout !== undefined) {
              status = "won";
            } else if (market.outcome !== data.side) {
              status = "lost";
            } else {
              // They won but haven't claimed yet
              status = "won"; 
            }
          }

          fetchedPredictions.push({
            id: `pred-${marketId}-${data.txHash}`,
            marketId: String(marketId),
            question: market.question,
            choice: data.side ? "YES" : "NO",
            stake: Number(formatUnits(data.amount, 6)),
            status,
            payout: payout ? Number(formatUnits(payout, 6)) : null,
            txHash: data.txHash,
            settledAt: market.resolved ? Number(market.deadline) * 1000 : null,
            settlementTime: 0, // Placeholder
          });
        }

        // Sort by newest first (highest market ID)
        fetchedPredictions.sort((a, b) => Number(b.marketId) - Number(a.marketId));

        if (mounted) {
          setPredictions(fetchedPredictions);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  return { predictions, isLoading };
}

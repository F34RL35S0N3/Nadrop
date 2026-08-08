"use client";

import { useState, useCallback, useEffect } from "react";
import { Market } from "@/lib/types";
import {
  PREDICTION_MARKET_ADDRESS,
  readMarket,
  readNextMarketId,
} from "@/lib/contract";
import { getResolvedMarketMeta } from "@/lib/markets";

const marketLimit = 12;
const rpcDelayMs = 140;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function toUiMarket(id: number, market: Awaited<ReturnType<typeof readMarket>>): Market {
  const totalYes = Number(market.totalYes) / 1_000_000;
  const totalNo = Number(market.totalNo) / 1_000_000;
  const totalStake = totalYes + totalNo;
  const yesPercentage =
    totalStake === 0 ? 50 : Math.round((totalYes / totalStake) * 100);
  const meta = getResolvedMarketMeta(id);

  return {
    id: String(id),
    category: meta.category,
    question: meta.question,
    deadline: Number(market.deadline) * 1000,
    yesPercentage,
    noPercentage: 100 - yesPercentage,
    totalStake,
    participants: Math.round(totalStake),
    contractAddress: PREDICTION_MARKET_ADDRESS,
    resolveDescription: market.resolved
      ? `Market sudah di-resolve dengan hasil ${market.outcome ? "YA" : "TIDAK"}.`
      : "Admin akan memverifikasi jawaban setelah deadline.",
    status: market.resolved
      ? "resolved"
      : Date.now() >= Number(market.deadline) * 1000
        ? "expired"
        : "active",
  };
}

type UseMarketsOptions = {
  status?: "active" | "closed" | "all";
};

export function useMarkets(options: UseMarketsOptions = {}) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const statusFilter = options.status ?? "active";

  useEffect(() => {
    let cancelled = false;

    async function loadMarkets() {
      const nextId = await readNextMarketId();
      const startId = Math.max(0, nextId - marketLimit);
      const ids = Array.from(
        { length: nextId - startId },
        (_, index) => startId + index,
      ).reverse();
      const nextMarkets: Market[] = [];

      for (const id of ids) {
        const market = await readMarket(id);
        const uiMarket = toUiMarket(id, market);

        if (
          statusFilter === "all" ||
          (statusFilter === "active" && uiMarket.status === "active") ||
          (statusFilter === "closed" && uiMarket.status !== "active")
        ) {
          nextMarkets.push(uiMarket);
        }

        await sleep(rpcDelayMs);
      }

      if (!cancelled) {
        setMarkets(nextMarkets);
        setCurrentIndex((index) => Math.min(index, nextMarkets.length));
      }
    }

    loadMarkets().catch(console.error);
    const interval = window.setInterval(() => {
      loadMarkets().catch(console.error);
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [statusFilter]);

  const currentMarket = markets[currentIndex] || null;
  const nextMarket = markets[currentIndex + 1] || null;
  const remainingCount = markets.length - currentIndex;

  const advanceToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, markets.length));
  }, [markets.length]);

  const hasMore = currentIndex < markets.length;

  return {
    markets,
    currentMarket,
    nextMarket,
    currentIndex,
    remainingCount,
    advanceToNext,
    hasMore,
  };
}

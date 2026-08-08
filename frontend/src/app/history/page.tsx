"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClaimPanel } from "@/components/market/ClaimPanel";
import { useMarkets } from "@/hooks/useMarkets";
import { useHistory } from "@/hooks/useHistory";
import { truncateAddress, MONAD_TESTNET_EXPLORER } from "@/lib/mockData";
import { Prediction } from "@/lib/types";

type FilterTab = "all" | "won" | "lost" | "pending";

const FILTERS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Accurate", value: "won" },
  { label: "Inaccurate", value: "lost" },
  { label: "Pending", value: "pending" },
];

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const statusConfig = {
    won: {
      icon: "✓",
      label: "Accurate",
      color: "text-[var(--color-yes)]",
      bg: "bg-[var(--color-yes-light)]",
      border: "border-[var(--color-yes-mid)]",
    },
    lost: {
      icon: "✗",
      label: "Inaccurate",
      color: "text-[var(--color-no)]",
      bg: "bg-[var(--color-no-light)]",
      border: "border-[var(--color-no-mid)]",
    },
    pending: {
      icon: "⏳",
      label: "Pending",
      color: "text-[var(--color-live)]",
      bg: "bg-[var(--color-live-light)]",
      border: "border-[var(--color-chrome-border)]",
    },
  };

  const config = statusConfig[prediction.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-[var(--color-surface)] rounded-[var(--radius-card)] border ${config.border} p-4 shadow-[var(--shadow-stack)]`}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${config.bg} ${config.color}`}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Question */}
          <p className="text-sm font-medium text-[var(--color-ink)] mb-1 line-clamp-2">
            {prediction.question}
          </p>

          {/* Choice + Status */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] text-xs font-bold ${
                prediction.choice === "YES"
                  ? "bg-[var(--color-yes-light)] text-[var(--color-yes)]"
                  : "bg-[var(--color-no-light)] text-[var(--color-no)]"
              }`}
            >
              {prediction.choice}
            </span>
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {prediction.status === "won" && prediction.payout && (
              <span className="font-data text-xs text-[var(--color-yes)]">
                +{prediction.payout.toFixed(1)} MON
              </span>
            )}
          </div>

          {/* Tx Hash + Settlement Time */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`${MONAD_TESTNET_EXPLORER}/tx/${prediction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-[11px] text-[var(--color-chrome)] hover:text-[var(--color-yes)] transition-colors"
            >
              tx: {truncateAddress(prediction.txHash)}
            </a>
            {prediction.settlementTime && (
              <span className="font-data text-[11px] text-[var(--color-chrome)]">
                settled {prediction.settlementTime}s
              </span>
            )}
            <span className="font-data text-[11px] text-[var(--color-chrome)]">
              contribution: {prediction.stake} MON
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const { markets: closedMarkets } = useMarkets({ status: "closed" });
  const { predictions, isLoading } = useHistory();

  const filteredPredictions = predictions.filter((p) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "won") return p.status === "won";
    if (activeFilter === "lost") return p.status === "lost";
    if (activeFilter === "pending") return p.status === "pending";
    return true;
  });

  // Summary stats
  const totalWins = predictions.filter((p) => p.status === "won").length;
  const totalLosses = predictions.filter((p) => p.status === "lost").length;
  const totalPending = predictions.filter((p) => p.status === "pending").length;
  const totalProfit = predictions.reduce(
    (sum, p) => sum + (p.payout || 0) - (p.payout ? p.stake : 0),
    0
  );
  const winRate =
    totalWins + totalLosses > 0
      ? Math.round((totalWins / (totalWins + totalLosses)) * 100)
      : 0;

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-1">
          Analysis History
        </h1>
        <p className="text-sm text-[var(--color-chrome)]">
          All your sentiment analysis and outcomes
        </p>
      </div>

      <section className="mb-6">
        <div className="mb-3">
          <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
            Claim Reward
          </h2>
          <p className="text-sm text-[var(--color-chrome)]">
            Markets that have ended or resolved appear here.
          </p>
        </div>

        {closedMarkets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {closedMarkets.map((market) => (
              <div key={market.id}>
                <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-stack)]">
                  <div className="mb-2 flex items-center justify-between font-data text-xs text-[var(--color-chrome)]">
                    <span>
                      [{market.category}] market #{market.id}
                    </span>
                    <span>{market.status}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    {market.question}
                  </h3>
                </div>
                <ClaimPanel market={market} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-chrome)] shadow-[var(--shadow-stack)]">
            No completed markets to claim yet.
          </div>
        )}
      </section>

      <div className="flex flex-col lg:flex-row lg:gap-8 w-full">
        {/* ── Left: Stats Panel (Desktop sidebar / Mobile top) ── */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 mb-6 lg:mb-0">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 mb-4">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between lg:mb-1">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Accurate</span>
                <span className="font-data text-xl lg:text-2xl font-bold text-[var(--color-yes)]">
                  {totalWins}
                </span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between lg:mb-1">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Inaccurate</span>
                <span className="font-data text-xl lg:text-2xl font-bold text-[var(--color-no)]">
                  {totalLosses}
                </span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between lg:mb-1">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Reputation (MON)</span>
                <span
                  className={`font-data text-xl lg:text-2xl font-bold ${
                    totalProfit >= 0
                      ? "text-[var(--color-yes)]"
                      : "text-[var(--color-no)]"
                  }`}
                >
                  {totalProfit >= 0 ? "+" : ""}
                  {totalProfit.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Extra stats for desktop */}
          <div className="hidden lg:block space-y-3">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Accuracy Rate</span>
                <span className="font-data text-lg font-bold text-[var(--color-ink)]">
                  {winRate}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-[var(--color-chrome-light)]">
                <div
                  className="h-full rounded-full bg-[var(--color-yes)] transition-all duration-500"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Pending</span>
                <span className="font-data text-lg font-bold text-[var(--color-live)]">
                  {totalPending}
                </span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Total Analysis</span>
                <span className="font-data text-lg font-bold text-[var(--color-ink)]">
                  {predictions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Predictions List ── */}
        <div className="flex-1 min-w-0">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-4 p-1 bg-[var(--color-surface)] rounded-[var(--radius-chip)] shadow-[var(--shadow-stack)]">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                id={`filter-${filter.value}`}
                className={`flex-1 px-3 py-2 rounded-[var(--radius-badge)] text-xs font-medium transition-all duration-200 ${
                  activeFilter === filter.value
                    ? "bg-[var(--color-ink)] text-[var(--color-base)] shadow-sm"
                    : "text-[var(--color-chrome)] hover:text-[var(--color-ink)]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Predictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <p className="text-sm text-[var(--color-chrome)]">Loading your history...</p>
                </motion.div>
              ) : filteredPredictions.length > 0 ? (
                filteredPredictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-chrome-light)] flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="var(--color-chrome)" strokeWidth="1.5" fill="none" />
                      <path d="M10 7V10" stroke="var(--color-chrome)" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="10" cy="13" r="0.5" fill="var(--color-chrome)" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--color-chrome)]">
                    No analysis found with this filter.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

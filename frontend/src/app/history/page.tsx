"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClaimPanel } from "@/components/market/ClaimPanel";
import { useWallet } from "@/components/providers/WalletProvider";
import { truncateAddress, MONAD_TESTNET_EXPLORER } from "@/lib/mockData";
import { Market, Prediction } from "@/lib/types";

type FilterTab = "semua" | "menang" | "kalah" | "pending";

const FILTERS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "semua" },
  { label: "Won", value: "menang" },
  { label: "Lost", value: "kalah" },
  { label: "Pending", value: "pending" },
];

type HistoryStats = {
  wins: number;
  losses: number;
  pending: number;
  profit: number;
  winRate: number;
  total: number;
};

type HistoryResponse = {
  predictions?: Prediction[];
  stats?: HistoryStats;
  error?: string;
  details?: string;
};

const emptyStats: HistoryStats = {
  wins: 0,
  losses: 0,
  pending: 0,
  profit: 0,
  winRate: 0,
  total: 0,
};

function predictionToMarket(prediction: Prediction): Market {
  return {
    id: prediction.marketId,
    category: "History",
    question: prediction.question,
    deadline: Date.now(),
    yesPercentage: 0,
    noPercentage: 0,
    totalStake: prediction.stake,
    participants: 1,
    contractAddress: "",
    resolveDescription: "Claim eligibility is checked directly from the contract.",
    status: prediction.status === "pending" ? "active" : "resolved",
  };
}

function displayChoice(choice: Prediction["choice"]) {
  return choice === "YA" ? "YES" : "NO";
}

function PredictionCard({
  prediction,
  isSelected,
  onSelect,
}: {
  prediction: Prediction;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusConfig = {
    won: {
      icon: "✓",
      label: "Won",
      color: "text-[var(--color-yes)]",
      bg: "bg-[var(--color-yes-light)]",
      border: "border-[var(--color-yes-mid)]",
    },
    lost: {
      icon: "✗",
      label: "Lost",
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
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`cursor-pointer bg-[var(--color-surface)] rounded-[var(--radius-card)] border ${config.border} p-4 shadow-[var(--shadow-stack)] outline-none transition-colors focus:border-[var(--color-ink)] ${
        isSelected ? "ring-2 ring-[var(--color-yes)]" : ""
      }`}
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
                prediction.choice === "YA"
                  ? "bg-[var(--color-yes-light)] text-[var(--color-yes)]"
                  : "bg-[var(--color-no-light)] text-[var(--color-no)]"
              }`}
            >
              {displayChoice(prediction.choice)}
            </span>
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {prediction.status === "won" && prediction.payout && (
              <span className="font-data text-xs text-[var(--color-yes)]">
                payout {prediction.payout.toFixed(1)} mUSDC
              </span>
            )}
          </div>

          {/* Tx Hash + Settlement Time */}
          <div className="flex items-center gap-3 flex-wrap">
            {prediction.txHash ? (
              <a
                href={`${MONAD_TESTNET_EXPLORER}/tx/${prediction.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="font-data text-[11px] text-[var(--color-chrome)] hover:text-[var(--color-yes)] transition-colors"
              >
                tx: {truncateAddress(prediction.txHash)}
              </a>
            ) : (
              <span className="font-data text-[11px] text-[var(--color-chrome)]">
                position detected on-chain
              </span>
            )}
            {prediction.settlementTime && (
              <span className="font-data text-[11px] text-[var(--color-chrome)]">
                settled {prediction.settlementTime}s
              </span>
            )}
            <span className="font-data text-[11px] text-[var(--color-chrome)]">
              stake: {prediction.stake} mUSDC
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { address, isConnected } = useWallet();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("semua");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] =
    useState<Prediction | null>(null);
  const [stats, setStats] = useState<HistoryStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!address) {
      setPredictions([]);
      setStats(emptyStats);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({ userAddress: address });
      const response = await fetch(`/api/history?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as HistoryResponse;

      if (!response.ok) {
        throw new Error(data.details ?? data.error ?? "Failed to load history");
      }

      setPredictions(data.predictions ?? []);
      setSelectedPrediction((current) => {
        if (!current) return null;
        return (data.predictions ?? []).find((item) => item.id === current.id) ?? null;
      });
      setStats(data.stats ?? emptyStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadHistory();
    const interval = window.setInterval(loadHistory, 15000);

    return () => window.clearInterval(interval);
  }, [loadHistory]);

  const filteredPredictions = predictions.filter((p) => {
    if (activeFilter === "semua") return true;
    if (activeFilter === "menang") return p.status === "won";
    if (activeFilter === "kalah") return p.status === "lost";
    if (activeFilter === "pending") return p.status === "pending";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-1">
          Prediction History
        </h1>
        <p className="text-sm text-[var(--color-chrome)]">
          All your predictions and outcomes
        </p>
        {!isConnected ? (
          <p className="mt-2 text-sm text-[var(--color-no)]">
            Log in to view real history for your wallet.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 w-full">
        {/* ── Left: Stats Panel (Desktop sidebar / Mobile top) ── */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 mb-6 lg:mb-0">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 mb-4">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between lg:mb-1">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Won</span>
                <span className="font-data text-xl lg:text-2xl font-bold text-[var(--color-yes)]">
                  {stats.wins}
                </span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between lg:mb-1">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Lost</span>
                <span className="font-data text-xl lg:text-2xl font-bold text-[var(--color-no)]">
                  {stats.losses}
                </span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between lg:mb-1">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Profit</span>
                <span
                  className={`font-data text-xl lg:text-2xl font-bold ${
                    stats.profit >= 0
                      ? "text-[var(--color-yes)]"
                      : "text-[var(--color-no)]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {stats.profit.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Extra stats for desktop */}
          <div className="hidden lg:block space-y-3">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Win Rate</span>
                <span className="font-data text-lg font-bold text-[var(--color-ink)]">
                  {stats.winRate}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-[var(--color-chrome-light)]">
                <div
                  className="h-full rounded-full bg-[var(--color-yes)] transition-all duration-500"
                  style={{ width: `${stats.winRate}%` }}
                />
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Pending</span>
                <span className="font-data text-lg font-bold text-[var(--color-live)]">
                  {stats.pending}
                </span>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-chip)] p-4 shadow-[var(--shadow-stack)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-chrome)] font-medium">Total Predictions</span>
                <span className="font-data text-lg font-bold text-[var(--color-ink)]">
                  {stats.total}
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
          {selectedPrediction ? (
            <div className="mb-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-stack)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    Claim Reward
                  </h2>
                  <p className="text-sm text-[var(--color-chrome)]">
                    {selectedPrediction.question}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPrediction(null)}
                  className="rounded-[var(--radius-button)] border border-[var(--color-chrome-border)] px-3 py-2 font-data text-xs text-[var(--color-chrome)]"
                >
                  Close
                </button>
              </div>
              <ClaimPanel
                market={predictionToMarket(selectedPrediction)}
                prediction={selectedPrediction}
              />
            </div>
          ) : null}

          {error ? (
            <pre className="mb-4 whitespace-pre-wrap break-words font-data text-xs text-[var(--color-no)]">
              {error}
            </pre>
          ) : null}

          {isLoading ? (
            <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 text-center font-data text-xs text-[var(--color-chrome)] shadow-[var(--shadow-stack)]">
              Loading real history...
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredPredictions.length > 0 ? (
                filteredPredictions.map((prediction) => (
                  <PredictionCard
                    key={prediction.id}
                    prediction={prediction}
                    isSelected={selectedPrediction?.id === prediction.id}
                    onSelect={() => setSelectedPrediction(prediction)}
                  />
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
                    No predictions match this filter yet.
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

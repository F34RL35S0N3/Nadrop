"use client";

import { useCallback, useEffect, useState } from "react";
import { CardStack } from "@/components/market/CardStack";
import { SettlementToast } from "@/components/settlement/SettlementToast";
import { useWallet } from "@/components/providers/WalletProvider";
import { useMarkets } from "@/hooks/useMarkets";
import { useSwipePredict } from "@/hooks/useSwipePredict";
import { truncateAddress } from "@/lib/mockData";
import type { LeaderboardEntry } from "@/lib/types";

type LeaderboardResponse = {
  entries?: LeaderboardEntry[];
};

function formatScore(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}`;
}

export default function MarketPage() {
  const { address, connect, isConnected, ready } = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const {
    currentMarket,
    nextMarket,
    advanceToNext,
    hasMore,
    remainingCount,
  } = useMarkets();

  const {
    predictions,
    activeSwipe,
    showOverlay,
    settlementState,
    onSwipe,
    dismissOverlay,
  } = useSwipePredict();

  const loadLeaderboard = useCallback(async () => {
    const params = address
      ? `?${new URLSearchParams({ userAddress: address }).toString()}`
      : "";
    const response = await fetch(`/api/leaderboard${params}`, {
      cache: "no-store",
    });
    if (!response.ok) return;

    const data = (await response.json()) as LeaderboardResponse;
    const currentAddress = address?.toLowerCase();

    setLeaderboard(
      (data.entries ?? []).map((entry) => ({
        ...entry,
        isCurrentUser:
          Boolean(currentAddress) &&
          entry.address.toLowerCase() === currentAddress,
      })),
    );
  }, [address]);

  useEffect(() => {
    loadLeaderboard().catch(console.error);
    const interval = window.setInterval(() => {
      loadLeaderboard().catch(console.error);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [loadLeaderboard]);

  // Keyboard navigation for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMore || !currentMarket || activeSwipe || !isConnected) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onSwipe(currentMarket, "left");
          setTimeout(advanceToNext, 300);
          break;
        case "ArrowRight":
          e.preventDefault();
          onSwipe(currentMarket, "right");
          setTimeout(advanceToNext, 300);
          break;
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          onSwipe(currentMarket, "up");
          setTimeout(advanceToNext, 300);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMore, currentMarket, activeSwipe, isConnected, onSwipe, advanceToNext]);

  const totalPredictions = predictions.length;
  const wins = predictions.filter((prediction) => prediction.status === "won").length;

  if (!isConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="font-data text-xs uppercase tracking-wider text-[var(--color-chrome)] mb-3">
            Login required
          </p>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-3">
            Log in to start swiping.
          </h1>
          <p className="text-sm text-[var(--color-chrome)] mb-6">
            Choose Privy email or MetaMask in the login modal.
          </p>
          <button
            type="button"
            onClick={connect}
            disabled={!ready}
            className="w-full rounded-[var(--radius-button)] bg-[var(--color-ink)] px-5 py-3 font-semibold text-[var(--color-base)] disabled:opacity-50"
          >
            Login with Privy / MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* Desktop: Two-column layout | Mobile: Single column */}
      <div className="flex flex-col lg:flex-row lg:gap-8 w-full">
        {/* ── Left Sidebar (Desktop only) ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 flex-shrink-0 gap-4">
          {/* Market Stats */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-3">
              Market Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Active Markets</span>
                <span className="font-data text-sm font-medium text-[var(--color-yes)]">
                  {remainingCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Total Predictions</span>
                <span className="font-data text-sm font-medium text-[var(--color-ink)]">
                  {totalPredictions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Win Rate</span>
                <span className="font-data text-sm font-medium text-[var(--color-yes)]">
                  {totalPredictions > 0
                    ? Math.round((wins / totalPredictions) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Mini Leaderboard */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-3">
              Top Predictors
            </h3>
            <div className="space-y-2.5">
              {leaderboard.length === 0 ? (
                <p className="py-4 text-center font-data text-xs text-[var(--color-chrome)]">
                  No real rankings yet.
                </p>
              ) : null}
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.address}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-badge)] ${
                    entry.isCurrentUser
                      ? "bg-[var(--color-yes-light)]"
                      : "hover:bg-[var(--color-surface-elevated)]"
                  } transition-colors`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      entry.rank === 1
                        ? "bg-[#F5A623] text-white"
                        : entry.rank === 2
                        ? "bg-[var(--color-chrome)] text-white"
                        : entry.rank === 3
                        ? "bg-[#CD7F32] text-white"
                        : "bg-[var(--color-chrome-light)] text-[var(--color-ink)]"
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[var(--color-ink)] truncate block">
                      {entry.displayName || truncateAddress(entry.address)}
                    </span>
                  </div>
                  <span className="font-data text-xs text-[var(--color-yes)]">
                    {formatScore(entry.totalProfit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Center: Card Stack (Main) ── */}
        <div className="flex-1 flex flex-col items-center">
          {/* Market counter */}
          {hasMore && (
            <div className="mb-4 text-center">
              <span className="text-xs text-[var(--color-chrome)]">
                <span className="font-data">{remainingCount}</span> markets available
              </span>
            </div>
          )}

          {/* Card Stack */}
          <div className="w-full max-w-xl">
            <CardStack
              currentMarket={currentMarket}
              nextMarket={nextMarket}
              onSwipe={onSwipe}
              onSwipeComplete={advanceToNext}
              hasMore={hasMore}
            />
          </div>

          {/* Quick action buttons for desktop and mobile fallback */}
          {hasMore && currentMarket && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  onSwipe(currentMarket, "left");
                  setTimeout(advanceToNext, 300);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-button)] border border-[var(--color-no-mid)] text-[var(--color-no)] text-sm font-medium hover:bg-[var(--color-no-light)] transition-colors duration-200"
                id="desktop-btn-no"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                NO
              </button>
              <button
                onClick={() => {
                  onSwipe(currentMarket, "up");
                  setTimeout(advanceToNext, 300);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-button)] border border-[var(--color-chrome-border)] text-[var(--color-chrome)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors duration-200"
                id="desktop-btn-skip"
              >
                SKIP
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 12V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4.5 7.5L8 4L11.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => {
                  onSwipe(currentMarket, "right");
                  setTimeout(advanceToNext, 300);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-button)] border border-[var(--color-yes-mid)] text-[var(--color-yes)] text-sm font-medium hover:bg-[var(--color-yes-light)] transition-colors duration-200"
                id="desktop-btn-yes"
              >
                YES
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ── Right Sidebar (Desktop only) ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 flex-shrink-0 gap-4">
          {/* Recent Predictions */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-3">
              Latest Predictions
            </h3>
            {predictions.length > 0 ? (
              <div className="space-y-2.5">
                {predictions.slice(0, 5).map((pred) => (
                  <div
                    key={pred.id}
                    className="flex items-start gap-2.5 px-2.5 py-2 rounded-[var(--radius-badge)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        pred.status === "won"
                          ? "bg-[var(--color-yes-light)] text-[var(--color-yes)]"
                          : pred.status === "lost"
                          ? "bg-[var(--color-no-light)] text-[var(--color-no)]"
                          : "bg-[var(--color-live-light)] text-[var(--color-live)]"
                      }`}
                    >
                      {pred.status === "won"
                        ? "✓"
                        : pred.status === "lost"
                        ? "✗"
                        : "⏳"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-ink)] line-clamp-2 leading-relaxed">
                        {pred.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold ${
                            pred.choice === "YA"
                              ? "text-[var(--color-yes)]"
                              : "text-[var(--color-no)]"
                          }`}
                        >
                          {pred.choice === "YA" ? "YES" : "NO"}
                        </span>
                        {pred.settlementTime && (
                          <span className="font-data text-[10px] text-[var(--color-chrome)]">
                            {pred.settlementTime}s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-chrome)] py-4 text-center">
                Swipe a market to start predicting.
              </p>
            )}
          </div>

          {/* How it works */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-3">
              How It Works
            </h3>
            <div className="space-y-3">
              {[
                { step: "1", label: "Swipe right YES, left NO, up SKIP" },
                { step: "2", label: "Automatically stake 1 mUSDC per prediction" },
                { step: "3", label: "Instant settlement via x402 protocol" },
                { step: "4", label: "Win? Claim your profit instantly" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-yes-light)] text-[var(--color-yes)] flex items-center justify-center text-[10px] font-bold">
                    {item.step}
                  </span>
                  <span className="text-xs text-[var(--color-ink)] leading-relaxed">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Settlement Toast */}
      {showOverlay && activeSwipe && (
        <SettlementToast
          state={settlementState}
          choice={activeSwipe.direction === "right" ? "YA" : "TIDAK"}
          question={activeSwipe.market.question}
          onDismiss={dismissOverlay}
        />
      )}
    </div>
  );
}

"use client";

import { CardStack } from "@/components/market/CardStack";
import { SettlementToast } from "@/components/settlement/SettlementToast";
import { useMarkets } from "@/hooks/useMarkets";
import { useSwipePredict } from "@/hooks/useSwipePredict";
import { MOCK_LEADERBOARD, MOCK_PREDICTIONS, truncateAddress, MONAD_TESTNET_EXPLORER } from "@/lib/mockData";

export default function MarketPage() {
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

  const allPredictions = [...predictions, ...MOCK_PREDICTIONS];

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* Desktop: Two-column layout | Mobile: Single column */}
      <div className="flex flex-col lg:flex-row lg:gap-8 w-full">
        {/* ── Left Sidebar (Desktop only) ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 flex-shrink-0 gap-4">
          {/* Market Stats */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-3">
              Statistik Market
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Market Aktif</span>
                <span className="font-data text-sm font-medium text-[var(--color-yes)]">
                  {remainingCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Total Prediksi</span>
                <span className="font-data text-sm font-medium text-[var(--color-ink)]">
                  {allPredictions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Win Rate</span>
                <span className="font-data text-sm font-medium text-[var(--color-yes)]">
                  {allPredictions.length > 0
                    ? Math.round(
                        (allPredictions.filter((p) => p.status === "won").length /
                          allPredictions.length) *
                          100
                      )
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
              {MOCK_LEADERBOARD.slice(0, 5).map((entry) => (
                <div
                  key={entry.rank}
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
                    +{entry.totalProfit.toFixed(0)}
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
                <span className="font-data">{remainingCount}</span> market tersedia
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

          {/* Quick action buttons for desktop */}
          {hasMore && currentMarket && (
            <div className="hidden md:flex items-center gap-4 mt-6">
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
                TIDAK
              </button>
              <button
                onClick={() => {
                  onSwipe(currentMarket, "right");
                  setTimeout(advanceToNext, 300);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-button)] border border-[var(--color-yes-mid)] text-[var(--color-yes)] text-sm font-medium hover:bg-[var(--color-yes-light)] transition-colors duration-200"
                id="desktop-btn-yes"
              >
                YA
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
              Prediksi Terbaru
            </h3>
            {allPredictions.length > 0 ? (
              <div className="space-y-2.5">
                {allPredictions.slice(0, 5).map((pred) => (
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
                          {pred.choice}
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
                Swipe market untuk mulai prediksi.
              </p>
            )}
          </div>

          {/* How it works */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-3">
              Cara Kerja
            </h3>
            <div className="space-y-3">
              {[
                { step: "1", label: "Swipe kanan untuk YA, kiri untuk TIDAK" },
                { step: "2", label: "Stake otomatis 10 MON per prediksi" },
                { step: "3", label: "Settlement instan via x402 protocol" },
                { step: "4", label: "Menang? Klaim profit langsung" },
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

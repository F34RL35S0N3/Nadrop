"use client";

import { useState } from "react";
import { Market } from "@/lib/types";
import { formatCountdown } from "@/lib/mockData";
import { OddsBar } from "./OddsBar";
import { PulseLine } from "./PulseLine";
import { TransparencyPanel } from "@/components/transparency/TransparencyPanel";
import { useCountdown } from "@/hooks/useCountdown";

interface MarketCardProps {
  market: Market;
  isTop?: boolean;
}

export function MarketCard({ market, isTop = false }: MarketCardProps) {
  const [showTransparency, setShowTransparency] = useState(false);
  const countdown = useCountdown(market.deadline);

  return (
    <div
      className={`relative w-full bg-[var(--color-surface)] rounded-[var(--radius-card)] overflow-hidden select-none ${
        isTop ? "shadow-[var(--shadow-card)]" : "shadow-[var(--shadow-stack)]"
      }`}
    >
      {/* Card Content */}
      <div className="p-5 pb-4">
        {/* Header: Category + Deadline */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-badge)] bg-[var(--color-chrome-light)] text-[var(--color-ink)] text-xs font-medium">
            {market.category}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-live)] animate-live-pulse" />
            <span className="font-data text-xs text-[var(--color-chrome)]">
              Berakhir {countdown}
            </span>
          </div>
        </div>

        {/* Question Headline */}
        <h2 className="font-display text-xl font-bold text-[var(--color-ink)] leading-tight mb-3">
          {market.question}
        </h2>

        {/* Pulse Line */}
        <div className="mb-4">
          <PulseLine yesPercentage={market.yesPercentage} active={isTop} />
        </div>

        {/* Odds Bar */}
        <OddsBar
          yesPercentage={market.yesPercentage}
          noPercentage={market.noPercentage}
        />

        {/* Market Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-chrome-border)]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-chrome)]">
              <span className="font-data">{market.participants}</span> peserta
            </span>
            <span className="text-xs text-[var(--color-chrome)]">
              <span className="font-data">{market.totalStake}</span> mUSDC staked
            </span>
          </div>
          <button
            onClick={() => setShowTransparency(!showTransparency)}
            id={`transparency-toggle-${market.id}`}
            className="text-xs text-[var(--color-chrome)] hover:text-[var(--color-ink)] transition-colors duration-200 flex items-center gap-1"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: showTransparency ? "rotate(180deg)" : "rotate(0deg)",
                  transformOrigin: "center",
                  transition: "transform 0.2s ease",
                }}
              />
            </svg>
            kontrak & riwayat
          </button>
        </div>
      </div>

      {/* Transparency Panel */}
      {showTransparency && (
        <TransparencyPanel market={market} />
      )}

      {/* Swipe Hints */}
      {isTop && (
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-chrome-border)] bg-[var(--color-surface-elevated)]">
          <span className="text-xs text-[var(--color-no)] font-medium flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            TIDAK
          </span>
          <span className="text-[10px] text-[var(--color-chrome)]">
            atas untuk skip
          </span>
          <span className="text-xs text-[var(--color-yes)] font-medium flex items-center gap-1">
            YA
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

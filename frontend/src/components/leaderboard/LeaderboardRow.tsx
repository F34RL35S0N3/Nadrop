"use client";

import { truncateAddress } from "@/lib/mockData";
import { LeaderboardEntry } from "@/lib/types";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

export function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const isTop3 = entry.rank <= 3;
  const rankColors: Record<number, string> = {
    1: "bg-[#F5A623] text-white",
    2: "bg-[var(--color-chrome)] text-white",
    3: "bg-[#CD7F32] text-white",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-chip)] transition-colors duration-200 ${
        entry.isCurrentUser
          ? "bg-[var(--color-yes-light)] border border-[var(--color-yes-mid)]"
          : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]"
      }`}
      id={`leaderboard-row-${entry.rank}`}
    >
      {/* Rank */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isTop3
            ? rankColors[entry.rank]
            : "bg-[var(--color-chrome-light)] text-[var(--color-ink)]"
        }`}
      >
        {entry.rank}
      </div>

      {/* Address / Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {entry.displayName ? (
            <span className="text-sm font-medium text-[var(--color-ink)] truncate">
              {entry.displayName}
            </span>
          ) : null}
          <span className="font-data text-xs text-[var(--color-chrome)] truncate">
            {truncateAddress(entry.address)}
          </span>
          {entry.isCurrentUser && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--color-yes)] bg-[var(--color-yes-mid)]">
              KAMU
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-[var(--color-chrome)]">
            <span className="font-data text-[var(--color-yes)]">{entry.wins}W</span>
            {" / "}
            <span className="font-data text-[var(--color-no)]">{entry.losses}L</span>
          </span>
        </div>
      </div>

      {/* Win Rate */}
      <div className="flex-shrink-0 text-right">
        <div className="font-data text-sm font-medium text-[var(--color-ink)]">
          {entry.winRate}%
        </div>
        <div className="text-[10px] text-[var(--color-chrome)]">win rate</div>
      </div>

      {/* Profit */}
      <div className="flex-shrink-0 text-right min-w-[64px]">
        <div
          className={`font-data text-sm font-medium ${
            entry.totalProfit >= 0
              ? "text-[var(--color-yes)]"
              : "text-[var(--color-no)]"
          }`}
        >
          {entry.totalProfit >= 0 ? "+" : ""}
          {entry.totalProfit.toFixed(1)}
        </div>
        <div className="text-[10px] text-[var(--color-chrome)]">mUSDC</div>
      </div>
    </div>
  );
}

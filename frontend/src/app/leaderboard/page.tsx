"use client";

import { truncateAddress } from "@/lib/mockData";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function LeaderboardPage() {
  const { leaderboard, isLoading } = useLeaderboard();
  const currentUser = leaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-1">
          Top Analysts
        </h1>
        <p className="text-sm text-[var(--color-chrome)]">
          Best analysts in the ecosystem
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 w-full">
        {/* ── Left: Podium + Your Stats ── */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0 mb-6 lg:mb-0">
          {/* Top 3 Podium */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] p-6 mb-4">
            <h3 className="text-xs font-medium text-[var(--color-chrome)] uppercase tracking-wider mb-6 text-center">
              Top 3
            </h3>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-chrome)] flex items-center justify-center text-white font-bold text-lg mb-2">
                  2
                </div>
                <div className="font-data text-[11px] text-[var(--color-chrome)] text-center truncate max-w-[80px]">
                  {leaderboard[1]?.displayName ||
                    truncateAddress(leaderboard[1]?.address || "")}
                </div>
                <div className="font-data text-sm font-bold text-[var(--color-yes)] mt-0.5">
                  +{leaderboard[1]?.totalProfit.toFixed(1) || 0}
                </div>
                <div className="w-16 h-16 rounded-t-lg bg-[var(--color-chrome)] opacity-15 mt-2" />
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center -mb-2">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                      <path d="M8 0L16 12H0L8 0Z" fill="#F5A623" />
                    </svg>
                  </div>
                </div>
                <div className="font-data text-[11px] text-[var(--color-ink)] font-medium text-center truncate max-w-[80px]">
                  {leaderboard[0]?.displayName ||
                    truncateAddress(leaderboard[0]?.address || "")}
                </div>
                <div className="font-data text-sm font-bold text-[var(--color-yes)] mt-0.5">
                  +{leaderboard[0]?.totalProfit.toFixed(1) || 0}
                </div>
                <div className="w-16 h-24 rounded-t-lg bg-[#F5A623] opacity-15 mt-2" />
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#CD7F32] flex items-center justify-center text-white font-bold text-lg mb-2">
                  3
                </div>
                <div className="font-data text-[11px] text-[var(--color-chrome)] text-center truncate max-w-[80px]">
                  {leaderboard[2]?.displayName ||
                    truncateAddress(leaderboard[2]?.address || "")}
                </div>
                <div className="font-data text-sm font-bold text-[var(--color-yes)] mt-0.5">
                  +{leaderboard[2]?.totalProfit.toFixed(1) || 0}
                </div>
                <div className="w-16 h-12 rounded-t-lg bg-[#CD7F32] opacity-15 mt-2" />
              </div>
            </div>
          </div>

          {/* Your Position (Desktop sidebar) */}
          {currentUser && (
            <div className="hidden lg:block bg-[var(--color-yes-light)] border border-[var(--color-yes-mid)] rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-stack)]">
              <h3 className="text-xs font-medium text-[var(--color-yes)] uppercase tracking-wider mb-3">
                Your Position
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Rank</span>
                  <span className="font-data text-xl font-bold text-[var(--color-ink)]">
                    #{currentUser.rank}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Accuracy Rate</span>
                  <span className="font-data text-lg font-bold text-[var(--color-yes)]">
                    {currentUser.winRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Track Record</span>
                  <span className="font-data text-sm text-[var(--color-ink)]">
                    <span className="text-[var(--color-yes)]">{currentUser.wins}W</span>
                    {" / "}
                    <span className="text-[var(--color-no)]">{currentUser.losses}L</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Reputation (MON)</span>
                  <span className="font-data text-lg font-bold text-[var(--color-yes)]">
                    +{currentUser.totalProfit.toFixed(1)} MON
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Full Ranking List ── */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center text-sm text-[var(--color-chrome)] py-8">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-sm text-[var(--color-chrome)] py-8">No ranked analysts yet.</div>
            ) : (
              leaderboard.map((entry) => (
                <LeaderboardRow key={entry.address} entry={entry} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

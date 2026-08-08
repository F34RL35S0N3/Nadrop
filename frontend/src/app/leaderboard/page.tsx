"use client";

import { useCallback, useEffect, useState } from "react";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { useWallet } from "@/components/providers/WalletProvider";
import { truncateAddress } from "@/lib/mockData";
import type { LeaderboardEntry } from "@/lib/types";

type LeaderboardResponse = {
  entries?: LeaderboardEntry[];
  error?: string;
  details?: string;
};

function scoreLabel(entry?: LeaderboardEntry) {
  if (!entry) return "-";

  return `${entry.totalProfit >= 0 ? "+" : ""}${entry.totalProfit.toFixed(1)}`;
}

function nameLabel(entry?: LeaderboardEntry) {
  if (!entry) return "-";

  return entry.displayName ?? truncateAddress(entry.address);
}

export default function LeaderboardPage() {
  const { address } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      const data = (await response.json()) as LeaderboardResponse;

      if (!response.ok) {
        throw new Error(data.details ?? data.error ?? "Leaderboard gagal dibaca");
      }

      const currentAddress = address?.toLowerCase();
      setEntries(
        (data.entries ?? []).map((entry) => ({
          ...entry,
          isCurrentUser:
            Boolean(currentAddress) &&
            entry.address.toLowerCase() === currentAddress,
        })),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadLeaderboard();
    const interval = window.setInterval(loadLeaderboard, 15000);

    return () => window.clearInterval(interval);
  }, [loadLeaderboard]);

  const currentUser = entries.find((entry) => entry.isCurrentUser);
  const topEntries = entries.slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-24 pt-6 md:px-6 md:pb-8">
      <div className="mb-6">
        <h1 className="mb-1 font-display text-2xl font-bold text-[var(--color-ink)]">
          Peringkat
        </h1>
        <p className="text-sm text-[var(--color-chrome)]">
          Predictor terbaik berdasarkan profit real dari market resolved.
        </p>
      </div>

      <div className="flex w-full flex-col lg:flex-row lg:gap-8">
        <div className="mb-6 flex-shrink-0 lg:mb-0 lg:w-80 xl:w-96">
          <div className="mb-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-stack)]">
            <h3 className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-chrome)]">
              Top 3
            </h3>

            {isLoading ? (
              <div className="text-center font-data text-xs text-[var(--color-chrome)]">
                Loading leaderboard...
              </div>
            ) : topEntries.length === 0 ? (
              <div className="text-center font-data text-xs text-[var(--color-chrome)]">
                Belum ada stake resolved yang tercatat.
              </div>
            ) : (
              <div className="flex items-end justify-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-chrome)] text-lg font-bold text-white">
                    2
                  </div>
                  <div className="max-w-[80px] truncate text-center font-data text-[11px] text-[var(--color-chrome)]">
                    {nameLabel(topEntries[1])}
                  </div>
                  <div className="mt-0.5 font-data text-sm font-bold text-[var(--color-yes)]">
                    {scoreLabel(topEntries[1])}
                  </div>
                  <div className="mt-2 h-16 w-16 rounded-t-lg bg-[var(--color-chrome)] opacity-15" />
                </div>

                <div className="-mb-2 flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5A623] text-xl font-bold text-white">
                      1
                    </div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M8 0L16 12H0L8 0Z" fill="#F5A623" />
                      </svg>
                    </div>
                  </div>
                  <div className="max-w-[80px] truncate text-center font-data text-[11px] font-medium text-[var(--color-ink)]">
                    {nameLabel(topEntries[0])}
                  </div>
                  <div className="mt-0.5 font-data text-sm font-bold text-[var(--color-yes)]">
                    {scoreLabel(topEntries[0])}
                  </div>
                  <div className="mt-2 h-24 w-16 rounded-t-lg bg-[#F5A623] opacity-15" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#CD7F32] text-lg font-bold text-white">
                    3
                  </div>
                  <div className="max-w-[80px] truncate text-center font-data text-[11px] text-[var(--color-chrome)]">
                    {nameLabel(topEntries[2])}
                  </div>
                  <div className="mt-0.5 font-data text-sm font-bold text-[var(--color-yes)]">
                    {scoreLabel(topEntries[2])}
                  </div>
                  <div className="mt-2 h-12 w-16 rounded-t-lg bg-[#CD7F32] opacity-15" />
                </div>
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="hidden rounded-[var(--radius-card)] border border-[var(--color-yes-mid)] bg-[var(--color-yes-light)] p-4 shadow-[var(--shadow-stack)] lg:block">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-yes)]">
                Posisi Kamu
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Peringkat</span>
                  <span className="font-data text-xl font-bold text-[var(--color-ink)]">
                    #{currentUser.rank}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Win Rate</span>
                  <span className="font-data text-lg font-bold text-[var(--color-yes)]">
                    {currentUser.winRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Rekam Jejak</span>
                  <span className="font-data text-sm text-[var(--color-ink)]">
                    <span className="text-[var(--color-yes)]">{currentUser.wins}W</span>
                    {" / "}
                    <span className="text-[var(--color-no)]">{currentUser.losses}L</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-ink)]">Profit</span>
                  <span className="font-data text-lg font-bold text-[var(--color-yes)]">
                    {scoreLabel(currentUser)} mUSDC
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-stack)] md:p-6">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-[var(--color-chrome)]">
              Top Predictors
            </h2>

            {error ? (
              <pre className="whitespace-pre-wrap break-words font-data text-xs text-[var(--color-no)]">
                {error}
              </pre>
            ) : null}

            {!error && isLoading ? (
              <div className="font-data text-xs text-[var(--color-chrome)]">
                Loading leaderboard...
              </div>
            ) : null}

            {!error && !isLoading && entries.length === 0 ? (
              <div className="font-data text-xs text-[var(--color-chrome)]">
                Belum ada ranking. Stake dan resolve market dulu.
              </div>
            ) : null}

            <div className="space-y-2">
              {entries.map((entry) => (
                <LeaderboardRow key={entry.address} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

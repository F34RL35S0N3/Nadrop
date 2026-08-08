"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { NetworkBadge, WalletChip } from "@/components/shared/WalletChip";
import type { Market } from "@/lib/contract";
import { getResolvedMarketMeta, saveCustomMarketMeta } from "@/lib/markets";

const explorerTxUrl = "https://testnet.monadvision.com/tx/";
const marketListLimit = 8;

type Status = {
  text: string;
  txHash?: string;
  error?: string;
};

type MarketRow = {
  id: number;
  market: Market;
};

type MarketSnapshot = {
  id: number;
  deadline: string;
  resolved: boolean;
  outcome: boolean;
  totalYes: string;
  totalNo: string;
};

function formatCountdown(deadline: bigint) {
  const remaining = Math.max(0, Number(deadline) * 1000 - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatUsdc(amount: bigint) {
  return `${formatUnits(amount, 6)} mUSDC`;
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text };
  }
}

function bodyError(response: Response, body: Record<string, unknown>) {
  const message =
    typeof body.details === "string"
      ? body.details
      : typeof body.error === "string"
        ? body.error
        : JSON.stringify(body);

  return `HTTP ${response.status} ${response.statusText}: ${message}`;
}

export default function AdminPage() {
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [status, setStatus] = useState<Status>({ text: "idle" });
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Kripto");
  const [minutes, setMinutes] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refresh() {
    const response = await fetch("/api/markets", { cache: "no-store" });
    const body = await readJson(response);

    if (!response.ok) {
      throw new Error(bodyError(response, body));
    }

    const snapshots = (body.markets ?? []) as MarketSnapshot[];
    setRows(
      snapshots.slice(0, marketListLimit).map((snapshot) => ({
        id: snapshot.id,
        market: {
          deadline: BigInt(snapshot.deadline),
          resolved: snapshot.resolved,
          outcome: snapshot.outcome,
          totalYes: BigInt(snapshot.totalYes),
          totalNo: BigInt(snapshot.totalNo),
        },
      })),
    );
  }

  useEffect(() => {
    refresh().catch((error) => {
      setStatus({
        text: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    });

    const interval = window.setInterval(() => {
      refresh().catch(console.error);
    }, 20_000);

    return () => window.clearInterval(interval);
  }, []);

  async function createMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ text: "creating market" });

    try {
      const deadline = Math.floor(Date.now() / 1000) + minutes * 60;
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
        },
        body: JSON.stringify({ deadline }),
      });
      const body = await readJson(response);

      if (!response.ok) {
        setStatus({ text: "error", error: bodyError(response, body) });
        return;
      }

      const marketId = Number(body.marketId);
      saveCustomMarketMeta(marketId, {
        question: question.trim() || `Market #${marketId}`,
        category: category.trim() || "Umum",
      });

      setQuestion("");
      setStatus({
        text: `market #${marketId} created`,
        txHash: String(body.txHash),
      });
      await refresh();
    } catch (error) {
      setStatus({
        text: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resolveMarket(marketId: number, outcome: boolean) {
    setIsSubmitting(true);
    setStatus({
      text: outcome ? `resolve #${marketId} YA` : `resolve #${marketId} TIDAK`,
    });

    try {
      const response = await fetch("/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
        },
        body: JSON.stringify({ marketId, outcome }),
      });
      const body = await readJson(response);

      if (!response.ok) {
        setStatus({ text: "error", error: bodyError(response, body) });
        return;
      }

      setStatus({
        text: `market #${marketId} resolved`,
        txHash: String(body.txHash),
      });
      await refresh();
    } catch (error) {
      setStatus({
        text: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-1">
            Admin
          </h1>
          <p className="text-sm text-[var(--color-chrome)]">
            Verifikasi jawaban bid dan tambah soal market baru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkBadge />
          <WalletChip />
        </div>
      </div>

      <section className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-stack)] font-data text-sm">
        <div>Status: {status.text}</div>
        {status.txHash ? (
          <a
            href={`${explorerTxUrl}${status.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="break-all text-[var(--color-yes)] underline"
          >
            {status.txHash}
          </a>
        ) : null}
        {status.error ? (
          <pre className="mt-3 whitespace-pre-wrap break-words text-[var(--color-no)]">
            {status.error}
          </pre>
        ) : null}
      </section>

      <form
        onSubmit={createMarket}
        className="mb-6 grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-stack)]"
      >
        <h2 className="font-data text-sm uppercase tracking-wider text-[var(--color-chrome)]">
          Tambah Soal
        </h2>
        <label className="grid gap-1">
          <span className="font-data text-xs text-[var(--color-chrome)]">
            Question
          </span>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="rounded-[var(--radius-chip)] border border-[var(--color-chrome-border)] bg-[var(--color-base)] px-3 py-2 outline-none focus:border-[var(--color-ink)]"
            placeholder="Akankah MON naik dalam 1 jam ke depan?"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="font-data text-xs text-[var(--color-chrome)]">
              Category
            </span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-[var(--radius-chip)] border border-[var(--color-chrome-border)] bg-[var(--color-base)] px-3 py-2 outline-none focus:border-[var(--color-ink)]"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-data text-xs text-[var(--color-chrome)]">
              Durasi menit
            </span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="rounded-[var(--radius-chip)] border border-[var(--color-chrome-border)] bg-[var(--color-base)] px-3 py-2 font-data outline-none focus:border-[var(--color-ink)]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[var(--radius-button)] bg-[var(--color-ink)] px-4 py-3 font-semibold text-[var(--color-base)] disabled:opacity-50"
        >
          Create market
        </button>
      </form>

      <section className="grid gap-3">
        <h2 className="font-data text-sm uppercase tracking-wider text-[var(--color-chrome)]">
          Market List
        </h2>
        {rows.map(({ id, market }) => {
          const meta = getResolvedMarketMeta(id);
          const expired = Date.now() >= Number(market.deadline) * 1000;
          const canResolve = expired && !market.resolved;

          return (
            <article
              key={id}
              className="rounded-[var(--radius-card)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-stack)]"
            >
              <div className="mb-2 flex flex-wrap justify-between gap-3 font-data text-xs text-[var(--color-chrome)]">
                <span>
                  [{meta.category}] market #{id}
                </span>
                <span>
                  {market.resolved
                    ? `resolved: ${market.outcome ? "YA" : "TIDAK"}`
                    : expired
                      ? "menunggu resolve"
                      : `berakhir ${formatCountdown(market.deadline)}`}
                </span>
              </div>
              <h3 className="mb-4 font-display text-xl font-bold text-[var(--color-ink)]">
                {meta.question}
              </h3>
              <div className="mb-4 grid gap-2 font-data text-sm sm:grid-cols-2">
                <div className="rounded-[var(--radius-chip)] border border-[var(--color-yes-mid)] bg-[var(--color-yes-light)] p-3 text-[var(--color-yes)]">
                  YA pool: {formatUsdc(market.totalYes)}
                </div>
                <div className="rounded-[var(--radius-chip)] border border-[var(--color-no-mid)] bg-[var(--color-no-light)] p-3 text-[var(--color-no)]">
                  TIDAK pool: {formatUsdc(market.totalNo)}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => resolveMarket(id, true)}
                  disabled={isSubmitting || !canResolve}
                  className="rounded-[var(--radius-button)] border border-[var(--color-yes-mid)] px-4 py-2 font-data text-sm text-[var(--color-yes)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Verifikasi jawaban: YA
                </button>
                <button
                  type="button"
                  onClick={() => resolveMarket(id, false)}
                  disabled={isSubmitting || !canResolve}
                  className="rounded-[var(--radius-button)] border border-[var(--color-no-mid)] px-4 py-2 font-data text-sm text-[var(--color-no)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Verifikasi jawaban: TIDAK
                </button>
              </div>
              {!canResolve && !market.resolved ? (
                <div className="mt-3 font-data text-xs text-[var(--color-chrome)]">
                  aktif setelah deadline
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

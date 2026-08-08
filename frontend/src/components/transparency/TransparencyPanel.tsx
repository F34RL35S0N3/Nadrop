"use client";

import { Market } from "@/lib/types";
import { MONAD_TESTNET_EXPLORER } from "@/lib/mockData";

interface TransparencyPanelProps {
  market: Market;
}

export function TransparencyPanel({ market }: TransparencyPanelProps) {
  return (
    <div className="border-t border-[var(--color-chrome-border)] bg-[var(--color-surface-elevated)] px-5 py-4 animate-settle-appear">
      {/* Contract Address */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-chrome)] font-medium block mb-1">
          Contract Address
        </span>
        <a
          href={`${MONAD_TESTNET_EXPLORER}/address/${market.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          id={`contract-link-${market.id}`}
          className="font-data text-xs text-[var(--color-yes)] hover:underline break-all"
        >
          {market.contractAddress}
        </a>
      </div>

      {/* Resolve Mechanism */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-chrome)] font-medium block mb-1">
          Resolution Mechanism
        </span>
        <p className="text-xs text-[var(--color-ink)] leading-relaxed">
          {market.resolveDescription}
        </p>
      </div>

      {/* Public Goods Fund */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-chrome)] font-medium block mb-1">
          Public Goods Fund
        </span>
        <p className="text-xs text-[var(--color-ink)] leading-relaxed">
          5% (500 BPS) of total contributions is allocated as donations to open-source developers in the Monad ecosystem.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-chrome)] font-medium block mb-0.5">
            Chain
          </span>
          <span className="font-data text-xs text-[var(--color-ink)]">
            Monad Testnet (10143)
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-chrome)] font-medium block mb-0.5">
            Settlement
          </span>
          <span className="font-data text-xs text-[var(--color-ink)]">
            x402 Protocol
          </span>
        </div>
      </div>

      {/* Explorer Link */}
      <a
        href={`${MONAD_TESTNET_EXPLORER}/address/${market.contractAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-chrome)] hover:text-[var(--color-ink)] transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2H2V10H10V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 6L11 1M11 1H8M11 1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        View on Monadscan
      </a>
    </div>
  );
}

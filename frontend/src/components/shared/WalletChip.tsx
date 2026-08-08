"use client";

import { truncateAddress } from "@/lib/mockData";
import { useWallet } from "@/components/providers/WalletProvider";

export function NetworkBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-badge)] bg-[var(--color-yes-light)] text-[var(--color-yes)] text-xs font-medium font-data">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-yes)] animate-live-pulse" />
      Monad Testnet
    </span>
  );
}

export function WalletChip() {
  const { isConnected, address, connect, disconnect, ready } = useWallet();

  if (!isConnected || !address) {
    return (
      <button
        onClick={connect}
        disabled={!ready}
        id="connect-wallet-header"
        className="px-4 py-2 rounded-[var(--radius-button)] bg-[var(--color-ink)] text-[var(--color-base)] text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
      >
        Login
      </button>
    );
  }

  return (
    <button
      onClick={disconnect}
      id="wallet-chip"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-chip)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] text-sm transition-all duration-200 hover:border-[var(--color-chrome)]"
    >
      <span className="w-2 h-2 rounded-full bg-[var(--color-yes)]" />
      <span className="font-data text-[var(--color-ink)]">
        {truncateAddress(address)}
      </span>
    </button>
  );
}

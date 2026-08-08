"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  createWalletClient,
  custom,
  formatUnits,
  getAddress,
  type Address,
  type EIP1193Provider,
} from "viem";
import { useWallet } from "@/components/providers/WalletProvider";
import {
  monadTestnet,
  PREDICTION_MARKET_ABI,
  PREDICTION_MARKET_ADDRESS,
  publicClient,
  readClaimed,
  readMarket,
  readStake,
  readUsdcBalance,
} from "@/lib/contract";
import { getSavedClaimTxHash, saveClaimTxHash } from "@/lib/claimTxStore";
import { Market } from "@/lib/types";

const explorerTxUrl = "https://testnet.monadvision.com/tx/";
const explorerAddressUrl = "https://testnet.monadvision.com/address/";

type ClaimState = {
  yesStake: bigint;
  noStake: bigint;
  balance: string;
  resolved: boolean;
  outcome: boolean;
  claimed: boolean;
};

type Status = {
  text: string;
  txHash?: string;
  detailUrl?: string;
  notice?: string;
  error?: string;
};

function formatUsdc(amount: bigint) {
  return `${formatUnits(amount, 6)} mUSDC`;
}

function extractError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);

  const value = error as {
    shortMessage?: string;
    details?: string;
    message?: string;
    cause?: unknown;
  };

  return (
    value.shortMessage ??
    value.details ??
    value.message ??
    (value.cause ? extractError(value.cause) : String(error))
  );
}

function marketIdToNumber(id: string) {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ClaimPanel({ market }: { market: Market | null }) {
  const { address } = useWallet();
  const { wallets } = useWallets();
  const [claimState, setClaimState] = useState<ClaimState>({
    yesStake: BigInt(0),
    noStake: BigInt(0),
    balance: "0",
    resolved: false,
    outcome: false,
    claimed: false,
  });
  const [status, setStatus] = useState<Status>({ text: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const userAddress = address ? getAddress(address) : undefined;
  const marketId = market ? marketIdToNumber(market.id) : 0;
  const winningStake = claimState.outcome
    ? claimState.yesStake
    : claimState.noStake;
  const canClaim =
    claimState.resolved && winningStake > BigInt(0) && !claimState.claimed;

  const refresh = useCallback(async () => {
    if (!market || !userAddress) return;

    const rawMarket = await readMarket(marketId);
    const yesStake = await readStake(marketId, userAddress, true);
    const noStake = await readStake(marketId, userAddress, false);
    const claimed = await readClaimed(marketId, userAddress);
    const balance = await readUsdcBalance(userAddress);

    setClaimState({
      yesStake,
      noStake,
      balance: balance.formatted,
      resolved: rawMarket.resolved,
      outcome: rawMarket.outcome,
      claimed,
    });
    setHasLoaded(true);

    if (claimed) {
      const savedTxHash = await getSavedClaimTxHash(marketId, userAddress);

      setStatus({
        text: "diklaim",
        txHash: savedTxHash ?? undefined,
        detailUrl: savedTxHash ? undefined : `${explorerAddressUrl}${userAddress}`,
        notice: savedTxHash
          ? undefined
          : "Claim sudah tercatat on-chain. Tx hash lama belum ada di cache lokal.",
      });
    } else {
      setStatus((current) =>
        current.text === "diklaim" ? { text: "idle" } : current,
      );
    }
  }, [market, marketId, userAddress]);

  useEffect(() => {
    if (!isOpen) return;

    refresh().catch((error) => {
      setHasLoaded(true);
      setStatus({ text: "error", error: extractError(error) });
    });

    const interval = window.setInterval(() => {
      refresh().catch(console.error);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [isOpen, refresh]);

  async function getWalletClient() {
    if (!userAddress) throw new Error("Wallet belum login");

    const wallet =
      wallets.find(
        (candidate) =>
          candidate.address.toLowerCase() === userAddress.toLowerCase(),
      ) ?? wallets[0];

    if (!wallet) throw new Error("Wallet tidak ditemukan");

    await wallet.switchChain(10143);
    const provider = (await wallet.getEthereumProvider()) as EIP1193Provider;

    return createWalletClient({
      account: userAddress as Address,
      chain: monadTestnet,
      transport: custom(provider),
    });
  }

  async function handleClaim() {
    setIsSubmitting(true);
    setStatus({ text: "claiming" });

    try {
      const walletClient = await getWalletClient();
      const txHash = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: "claim",
        args: [BigInt(marketId)],
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      await saveClaimTxHash(marketId, userAddress as Address, txHash).catch(
        console.error,
      );
      setStatus({ text: "diklaim", txHash });
      await refresh();
    } catch (error) {
      setStatus({ text: "error", error: extractError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!market || !userAddress) return null;

  return (
    <section className="mt-3 w-full rounded-[var(--radius-card)] border border-[var(--color-chrome-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-stack)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-data text-xs uppercase tracking-wider text-[var(--color-chrome)]">
          Claim
        </h3>
        <span className="font-data text-xs text-[var(--color-chrome)]">
          Balance {claimState.balance} mUSDC
        </span>
      </div>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full rounded-[var(--radius-button)] border border-[var(--color-chrome-border)] px-4 py-3 font-semibold text-[var(--color-ink)]"
        >
          Cek klaim
        </button>
      ) : null}

      {isOpen && !hasLoaded ? (
        <div className="font-data text-xs text-[var(--color-chrome)]">
          Loading claim data...
        </div>
      ) : null}

      {isOpen && hasLoaded ? (
        <>

      <div className="mb-3 grid grid-cols-2 gap-2 font-data text-xs">
        <div className="rounded-[var(--radius-badge)] bg-[var(--color-yes-light)] px-3 py-2 text-[var(--color-yes)]">
          YA stake: {formatUsdc(claimState.yesStake)}
        </div>
        <div className="rounded-[var(--radius-badge)] bg-[var(--color-no-light)] px-3 py-2 text-[var(--color-no)]">
          TIDAK stake: {formatUsdc(claimState.noStake)}
        </div>
      </div>

      <p className="mb-3 text-sm text-[var(--color-chrome)]">
        {!claimState.resolved
          ? "Klaim aktif setelah admin resolve market."
          : claimState.claimed
            ? "Reward untuk market ini sudah diklaim."
            : winningStake === BigInt(0)
              ? "Nothing to claim. Kamu tidak punya stake di sisi pemenang."
              : `Kamu menang di sisi ${claimState.outcome ? "YA" : "TIDAK"}.`}
      </p>

      <button
        type="button"
        onClick={handleClaim}
        disabled={!canClaim || isSubmitting}
        className="w-full rounded-[var(--radius-button)] bg-[var(--color-ink)] px-4 py-3 font-semibold text-[var(--color-base)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Klaim
      </button>

      <div className="mt-3 font-data text-xs text-[var(--color-chrome)]">
        Status: {status.text}
      </div>
      {status.txHash ? (
        <a
          href={`${explorerTxUrl}${status.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all font-data text-xs text-[var(--color-yes)] underline"
        >
          {status.txHash}
        </a>
      ) : null}
      {!status.txHash && status.detailUrl ? (
        <a
          href={status.detailUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all font-data text-xs text-[var(--color-yes)] underline"
        >
          Buka riwayat address di explorer
        </a>
      ) : null}
      {status.notice ? (
        <p className="mt-2 font-data text-xs text-[var(--color-chrome)]">
          {status.notice}
        </p>
      ) : null}
      {status.error ? (
        <pre className="mt-2 whitespace-pre-wrap break-words font-data text-xs text-[var(--color-no)]">
          {status.error}
        </pre>
      ) : null}
        </>
      ) : null}
    </section>
  );
}

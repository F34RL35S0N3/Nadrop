import type { Address, Hex } from "viem";

const CLAIM_TX_HASHES_KEY = "swipepredict.claimTxHashes";

function getClaimKey(marketId: number, user: Address) {
  return `${marketId}:${user.toLowerCase()}`;
}

function readStore() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CLAIM_TX_HASHES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Hex>) : {};
  } catch {
    return {};
  }
}

export function getSavedClaimTxHash(marketId: number, user: Address) {
  return readStore()[getClaimKey(marketId, user)] ?? null;
}

export function saveClaimTxHash(marketId: number, user: Address, txHash: Hex) {
  if (typeof window === "undefined") return;

  const store = readStore();
  store[getClaimKey(marketId, user)] = txHash;
  window.localStorage.setItem(CLAIM_TX_HASHES_KEY, JSON.stringify(store));
}

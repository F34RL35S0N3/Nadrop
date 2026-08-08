import type { Address, Hex } from "viem";

type ClaimTxResponse = {
  txHash: Hex | null;
};

export async function getSavedClaimTxHash(marketId: number, user: Address) {
  const params = new URLSearchParams({
    marketId: String(marketId),
    userAddress: user,
  });

  const response = await fetch(`/api/claim-tx?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as ClaimTxResponse;
  return data.txHash;
}

export async function saveClaimTxHash(
  marketId: number,
  user: Address,
  txHash: Hex,
) {
  const response = await fetch("/api/claim-tx", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      marketId,
      userAddress: user,
      txHash,
    }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string; details?: string }
      | null;
    throw new Error(data?.details ?? data?.error ?? "Save claim tx failed");
  }
}

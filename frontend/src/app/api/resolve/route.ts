import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  monadTestnet,
  PREDICTION_MARKET_ADDRESS,
} from "@/lib/contract";

const RESOLVE_MARKET_ABI = {
  name: "resolveMarket",
  type: "function",
  inputs: [
    { name: "marketId", type: "uint256" },
    { name: "outcome", type: "bool" },
  ],
  outputs: [],
  stateMutability: "nonpayable",
} as const;

type ResolveBody = {
  marketId: number;
  outcome: boolean;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isResolveBody(value: unknown): value is ResolveBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  return typeof body.marketId === "number" && typeof body.outcome === "boolean";
}

function getBackendPrivateKey() {
  const privateKey = process.env.BACKEND_PRIVATE_KEY;

  if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error("Missing or invalid BACKEND_PRIVATE_KEY");
  }

  return privateKey as Hex;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!isResolveBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const account = privateKeyToAccount(getBackendPrivateKey());
    const transport = http(process.env.NEXT_PUBLIC_RPC_URL);
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport,
    });
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport,
    });

    const txHash = await walletClient.writeContract({
      address: getAddress(PREDICTION_MARKET_ADDRESS),
      abi: [RESOLVE_MARKET_ABI],
      functionName: "resolveMarket",
      args: [BigInt(body.marketId), body.outcome],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      throw new Error(`Resolve transaction reverted: ${txHash}`);
    }

    return NextResponse.json({ txHash });
  } catch (error) {
    console.error("Resolve failed", error);

    return NextResponse.json(
      { error: "Resolve failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

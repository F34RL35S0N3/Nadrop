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
  readNextMarketId,
} from "@/lib/contract";

const CREATE_MARKET_ABI = {
  name: "createMarket",
  type: "function",
  inputs: [
    { name: "question", type: "string" },
    { name: "category", type: "string" },
    { name: "deadline", type: "uint64" }
  ],
  outputs: [{ name: "marketId", type: "uint256" }],
  stateMutability: "nonpayable",
} as const;

type CreateMarketBody = {
  question: string;
  category: string;
  deadline: number;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isCreateMarketBody(value: unknown): value is CreateMarketBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  return (
    typeof body.question === "string" &&
    typeof body.category === "string" &&
    typeof body.deadline === "number" &&
    Number.isFinite(body.deadline)
  );
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
    if (!isCreateMarketBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (body.deadline <= now) {
      return NextResponse.json(
        { error: "Deadline must be in the future" },
        { status: 400 },
      );
    }

    const marketId = await readNextMarketId();
    const account = privateKeyToAccount(getBackendPrivateKey());
    const transport = http(process.env.NEXT_PUBLIC_RPC_URL);
    const localPublicClient = createPublicClient({
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
      abi: [CREATE_MARKET_ABI],
      functionName: "createMarket",
      args: [body.question, body.category, BigInt(body.deadline)],
    });

    const receipt = await localPublicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    if (receipt.status !== "success") {
      throw new Error(`Create market transaction reverted: ${txHash}`);
    }

    return NextResponse.json({ marketId, txHash });
  } catch (error) {
    console.error("Create market failed", error);

    return NextResponse.json(
      { error: "Create market failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

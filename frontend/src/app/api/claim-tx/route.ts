import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress, isHex, type Address, type Hex } from "viem";
import { getClaimTxHash, saveClaimTxHash } from "@/lib/server/localDb";

export const runtime = "nodejs";

type ClaimTxBody = {
  marketId: number;
  userAddress: string;
  txHash: string;
};

function parseMarketId(value: string | null) {
  if (!value) return null;

  const marketId = Number(value);
  return Number.isInteger(marketId) && marketId >= 0 ? marketId : null;
}

function isClaimTxBody(value: unknown): value is ClaimTxBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  return (
    typeof body.marketId === "number" &&
    Number.isInteger(body.marketId) &&
    body.marketId >= 0 &&
    typeof body.userAddress === "string" &&
    isAddress(body.userAddress) &&
    typeof body.txHash === "string" &&
    isHex(body.txHash) &&
    body.txHash.length === 66
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(request: NextRequest) {
  try {
    const marketId = parseMarketId(request.nextUrl.searchParams.get("marketId"));
    const userAddress = request.nextUrl.searchParams.get("userAddress");

    if (marketId === null || !userAddress || !isAddress(userAddress)) {
      return NextResponse.json(
        { error: "Invalid query params" },
        { status: 400 },
      );
    }

    const txHash = await getClaimTxHash(
      marketId,
      getAddress(userAddress) as Address,
    );

    return NextResponse.json({ txHash });
  } catch (error) {
    console.error("Read claim tx failed", error);

    return NextResponse.json(
      { error: "Read claim tx failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isClaimTxBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    await saveClaimTxHash(
      body.marketId,
      getAddress(body.userAddress) as Address,
      body.txHash as Hex,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save claim tx failed", error);

    return NextResponse.json(
      { error: "Save claim tx failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

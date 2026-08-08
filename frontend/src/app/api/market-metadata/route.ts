import { NextRequest, NextResponse } from "next/server";
import { getMarketMeta } from "@/lib/markets";
import { getSupabaseAdmin } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MarketMetadataBody = {
  marketId: number;
  question: string;
  category: string;
};

function isMarketMetadataBody(value: unknown): value is MarketMetadataBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  return (
    typeof body.marketId === "number" &&
    Number.isInteger(body.marketId) &&
    body.marketId >= 0 &&
    typeof body.question === "string" &&
    body.question.trim().length > 0 &&
    typeof body.category === "string" &&
    body.category.trim().length > 0
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ metadata: [] });
  }

  const { data, error } = await supabase
    .from("market_metadata")
    .select("market_id,question,category");

  if (error) {
    console.error("Read market metadata failed", error);
    return NextResponse.json(
      { error: "Read market metadata failed", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    metadata: data.map((row) => ({
      marketId: Number(row.market_id),
      question: String(row.question),
      category: String(row.category),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (request.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!isMarketMetadataBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, mode: "local-only" });
    }

    const fallback = getMarketMeta(body.marketId);
    const { error } = await supabase.from("market_metadata").upsert({
      market_id: body.marketId,
      question: body.question.trim() || fallback.question,
      category: body.category.trim() || fallback.category,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save market metadata failed", error);

    return NextResponse.json(
      { error: "Save market metadata failed", details: errorMessage(error) },
      { status: 500 },
    );
  }
}

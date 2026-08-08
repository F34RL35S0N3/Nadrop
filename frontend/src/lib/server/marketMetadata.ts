import { getMarketMeta, normalizeMarketMeta } from "@/lib/markets";
import { getSupabaseAdmin } from "@/lib/server/supabase";

type MarketMeta = {
  question: string;
  category: string;
};

const cacheTtlMs = 10_000;
let cache: { expiresAt: number; data: Record<number, MarketMeta> } | null = null;

export async function readMarketMetadataMap() {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("market_metadata")
    .select("market_id,question,category");

  if (error) {
    console.error("Supabase read market metadata failed", error);
    return cache?.data ?? {};
  }

  const metadata = Object.fromEntries(
    data.map((row) => [
      Number(row.market_id),
      normalizeMarketMeta({
        question: String(row.question),
        category: String(row.category),
      }),
    ]),
  );

  cache = {
    expiresAt: Date.now() + cacheTtlMs,
    data: metadata,
  };

  return metadata;
}

export async function readMarketMetadata(id: number) {
  const metadata = await readMarketMetadataMap();
  return metadata[id] ?? getMarketMeta(id);
}

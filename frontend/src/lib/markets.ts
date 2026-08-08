type MarketMeta = {
  question: string;
  category: string;
};

const CUSTOM_MARKETS_KEY = "swipepredict.customMarkets";
let remoteMarketMeta: Record<number, MarketMeta> = {};

const QUESTION_TRANSLATIONS: Record<string, string> = {
  "Akankah MON naik dalam 1 jam ke depan?": "Will MON go up in the next hour?",
  "Akankah MON naik dalam 1 jam?": "Will MON go up in 1 hour?",
  "Akankah BTC menembus ATH minggu ini?": "Will BTC break its ATH this week?",
  "Akankah ada yang stake TIDAK di market ini?":
    "Will anyone stake NO on this market?",
  "Akankah market ini di-resolve dalam 5 menit?":
    "Will this market be resolved within 5 minutes?",
  "Timnas Indonesia menang di match berikutnya?":
    "Will Indonesia win their next match?",
  "Akankah swipe pertama di market ini memilih YA?":
    "Will the first swipe on this market choose YES?",
};

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  Kripto: "Crypto",
  Sport: "Sports",
  Umum: "General",
};

export const QUESTION_POOL: MarketMeta[] = [
  { question: "Will MON go up in the next hour?", category: "Crypto" },
  { question: "Will BTC break its ATH this week?", category: "Crypto" },
  { question: "Will anyone stake NO on this market?", category: "Meta" },
  {
    question: "Will this market be resolved within 5 minutes?",
    category: "Meta",
  },
  {
    question: "Will Indonesia win their next match?",
    category: "Sports",
  },
  {
    question: "Will the first swipe on this market choose YES?",
    category: "Meta",
  },
];

export const MARKET_META: Record<number, MarketMeta> = {
  0: { question: "Will MON go up in 1 hour?", category: "Crypto" },
  1: { question: "Will MON go up in 1 hour?", category: "Crypto" },
};

export function getMarketMeta(id: number) {
  return MARKET_META[id] ?? QUESTION_POOL[id % QUESTION_POOL.length];
}

export function normalizeMarketMeta(meta: MarketMeta): MarketMeta {
  return {
    question: QUESTION_TRANSLATIONS[meta.question] ?? meta.question,
    category: CATEGORY_TRANSLATIONS[meta.category] ?? meta.category,
  };
}

export function getCustomMarketMeta(id: number): MarketMeta | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOM_MARKETS_KEY);
    const markets = raw ? (JSON.parse(raw) as Record<string, MarketMeta>) : {};
    const meta = markets[String(id)];

    if (!meta?.question || !meta?.category) return null;
    return normalizeMarketMeta(meta);
  } catch {
    return null;
  }
}

export function getResolvedMarketMeta(id: number) {
  return normalizeMarketMeta(
    remoteMarketMeta[id] ?? getCustomMarketMeta(id) ?? getMarketMeta(id),
  );
}

export function saveCustomMarketMeta(id: number, meta: MarketMeta) {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem(CUSTOM_MARKETS_KEY);
  const markets = raw ? (JSON.parse(raw) as Record<string, MarketMeta>) : {};
  markets[String(id)] = meta;
  window.localStorage.setItem(CUSTOM_MARKETS_KEY, JSON.stringify(markets));
}

export async function loadRemoteMarketMeta() {
  if (typeof window === "undefined") return;

  const response = await fetch("/api/market-metadata", { cache: "no-store" });
  if (!response.ok) return;

  const data = (await response.json()) as {
    metadata?: Array<MarketMeta & { marketId: number }>;
  };

  remoteMarketMeta = Object.fromEntries(
    (data.metadata ?? []).map((meta) => [
      meta.marketId,
      {
        ...normalizeMarketMeta(meta),
      },
    ]),
  );
}

export async function saveMarketMeta(id: number, meta: MarketMeta) {
  saveCustomMarketMeta(id, meta);

  const response = await fetch("/api/market-metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
    },
    body: JSON.stringify({
      marketId: id,
      question: meta.question,
      category: meta.category,
    }),
  });

  if (response.ok) {
    remoteMarketMeta[id] = normalizeMarketMeta(meta);
  }
}

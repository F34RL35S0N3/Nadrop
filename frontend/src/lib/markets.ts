type MarketMeta = {
  question: string;
  category: string;
};

const CUSTOM_MARKETS_KEY = "swipepredict.customMarkets";
let remoteMarketMeta: Record<number, MarketMeta> = {};

export const QUESTION_POOL: MarketMeta[] = [
  { question: "Akankah MON naik dalam 1 jam ke depan?", category: "Kripto" },
  { question: "Akankah BTC menembus ATH minggu ini?", category: "Kripto" },
  { question: "Akankah ada yang stake TIDAK di market ini?", category: "Meta" },
  {
    question: "Akankah market ini di-resolve dalam 5 menit?",
    category: "Meta",
  },
  {
    question: "Timnas Indonesia menang di match berikutnya?",
    category: "Sport",
  },
  {
    question: "Akankah swipe pertama di market ini memilih YA?",
    category: "Meta",
  },
];

export const MARKET_META: Record<number, MarketMeta> = {
  0: { question: "Akankah MON naik dalam 1 jam?", category: "Kripto" },
  1: { question: "Akankah MON naik dalam 1 jam?", category: "Kripto" },
};

export function getMarketMeta(id: number) {
  return MARKET_META[id] ?? QUESTION_POOL[id % QUESTION_POOL.length];
}

export function getCustomMarketMeta(id: number): MarketMeta | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOM_MARKETS_KEY);
    const markets = raw ? (JSON.parse(raw) as Record<string, MarketMeta>) : {};
    const meta = markets[String(id)];

    if (!meta?.question || !meta?.category) return null;
    return meta;
  } catch {
    return null;
  }
}

export function getResolvedMarketMeta(id: number) {
  return remoteMarketMeta[id] ?? getCustomMarketMeta(id) ?? getMarketMeta(id);
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
        question: meta.question,
        category: meta.category,
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
    remoteMarketMeta[id] = meta;
  }
}

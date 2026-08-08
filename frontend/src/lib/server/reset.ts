export const MARKET_RESET_ID = Number(
  process.env.MARKET_RESET_ID ?? process.env.NEXT_PUBLIC_MARKET_RESET_ID ?? "15",
);

export function isAfterReset(marketId: number) {
  return marketId >= MARKET_RESET_ID;
}

import { Market } from "./types";

export const MOCK_MARKETS: Market[] = [
  {
    id: "market-1",
    category: "Crypto",
    question: "Will MON break $5 in the next hour?",
    deadline: Date.now() + 47 * 60 * 1000 + 12 * 1000,
    yesPercentage: 62,
    noPercentage: 38,
    totalStake: 2450,
    participants: 187,
    contractAddress: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    resolveDescription:
      "This market resolves based on the MON price on CoinGecko at the deadline. If price ≥ $5.00, outcome = YES.",
    status: "active",
  },
  {
    id: "market-2",
    category: "DeFi",
    question: "Will Monad TVL cross $100M this week?",
    deadline: Date.now() + 3 * 24 * 60 * 60 * 1000,
    yesPercentage: 45,
    noPercentage: 55,
    totalStake: 5200,
    participants: 312,
    contractAddress: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
    resolveDescription:
      "This market resolves based on DeFiLlama data for Monad TVL. If TVL ≥ $100M before Sunday 23:59 UTC, outcome = YES.",
    status: "active",
  },
  {
    id: "market-3",
    category: "Ecosystem",
    question: "Will Monad launch a new feature on testnet this month?",
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    yesPercentage: 78,
    noPercentage: 22,
    totalStake: 1890,
    participants: 95,
    contractAddress: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
    resolveDescription:
      "This market resolves based on official announcements from the Monad team on Twitter/Discord before the end of the month.",
    status: "active",
  },
  {
    id: "market-4",
    category: "Crypto",
    question: "Will ETH be above $4000 when this market ends?",
    deadline: Date.now() + 2 * 60 * 60 * 1000,
    yesPercentage: 33,
    noPercentage: 67,
    totalStake: 8900,
    participants: 521,
    contractAddress: "0x4d5e6f7890abcdef1234567890abcdef12345678",
    resolveDescription:
      "This market resolves based on the ETH/USD price on the Chainlink oracle at the deadline.",
    status: "active",
  },
  {
    id: "market-5",
    category: "NFT",
    question: "Will NFT trading volume on Monad increase by 50% today?",
    deadline: Date.now() + 12 * 60 * 60 * 1000,
    yesPercentage: 41,
    noPercentage: 59,
    totalStake: 670,
    participants: 43,
    contractAddress: "0x5e6f7890abcdef1234567890abcdef1234567890",
    resolveDescription:
      "Compared to yesterday's NFT trading volume (24h), if today's volume increases by ≥ 50%, outcome = YES.",
    status: "active",
  },
];

export const STAKE_AMOUNT = 10; // Fixed stake for MVP

export const MONAD_TESTNET_EXPLORER = "https://testnet.monadvision.com";

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCountdown(deadline: number): string {
  const diff = deadline - Date.now();
  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

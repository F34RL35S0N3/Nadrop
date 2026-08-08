import { Market, Prediction, LeaderboardEntry } from "./types";

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
      "This market resolves using the MON price on CoinGecko at the deadline. If price is at least $5.00, the outcome is YES.",
    status: "active",
  },
  {
    id: "market-2",
    category: "DeFi",
    question: "Will Monad TVL pass $100M this week?",
    deadline: Date.now() + 3 * 24 * 60 * 60 * 1000,
    yesPercentage: 45,
    noPercentage: 55,
    totalStake: 5200,
    participants: 312,
    contractAddress: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
    resolveDescription:
      "This market resolves using DeFiLlama data for Monad TVL. If TVL is at least $100M before Sunday 23:59 UTC, the outcome is YES.",
    status: "active",
  },
  {
    id: "market-3",
    category: "Ecosystem",
    question: "Will Monad launch a new testnet feature this month?",
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    yesPercentage: 78,
    noPercentage: 22,
    totalStake: 1890,
    participants: 95,
    contractAddress: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
    resolveDescription:
      "This market resolves using official Monad team announcements on Twitter/Discord before month-end.",
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
      "This market resolves using the ETH/USD Chainlink oracle price at the deadline.",
    status: "active",
  },
  {
    id: "market-5",
    category: "NFT",
    question: "Will Monad NFT trading volume rise 50% today?",
    deadline: Date.now() + 12 * 60 * 60 * 1000,
    yesPercentage: 41,
    noPercentage: 59,
    totalStake: 670,
    participants: 43,
    contractAddress: "0x5e6f7890abcdef1234567890abcdef1234567890",
    resolveDescription:
      "Compared with yesterday's NFT trading volume over 24h, if today's volume rises at least 50%, the outcome is YES.",
    status: "active",
  },
];

export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: "pred-1",
    marketId: "market-1",
    question: "Will MON break $5 in the next hour?",
    choice: "YA",
    stake: 10,
    status: "won",
    payout: 16.1,
    txHash: "0xabc123def456789012345678901234567890abcdef123456789012345678901234",
    settledAt: Date.now() - 2 * 60 * 60 * 1000,
    settlementTime: 0.4,
  },
  {
    id: "pred-2",
    marketId: "market-2",
    question: "Will Monad TVL pass $100M this week?",
    choice: "TIDAK",
    stake: 10,
    status: "lost",
    payout: 0,
    txHash: "0xdef789012345678901234567890abcdef1234567890abcdef12345678901234ab",
    settledAt: Date.now() - 24 * 60 * 60 * 1000,
    settlementTime: 0.3,
  },
  {
    id: "pred-3",
    marketId: "market-3",
    question: "Will Monad launch a new testnet feature this month?",
    choice: "YA",
    stake: 10,
    status: "pending",
    payout: null,
    txHash: "0x123456789abcdef012345678901234567890abcdef1234567890abcdef1234567",
    settledAt: null,
    settlementTime: null,
  },
  {
    id: "pred-4",
    marketId: "market-4",
    question: "Will ETH be above $4000 when this market ends?",
    choice: "TIDAK",
    stake: 10,
    status: "won",
    payout: 14.9,
    txHash: "0x456789abcdef0123456789012345678901234567890abcdef123456789012345cd",
    settledAt: Date.now() - 6 * 60 * 60 * 1000,
    settlementTime: 0.5,
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0xA1b2C3d4E5f67890aBcDeF1234567890AbCdEf12",
    displayName: "monad_whale",
    wins: 42,
    losses: 8,
    winRate: 84,
    totalProfit: 340.5,
    isCurrentUser: false,
  },
  {
    rank: 2,
    address: "0xB2c3D4e5F67890aBcDeF1234567890AbCdEf1234",
    displayName: null,
    wins: 38,
    losses: 12,
    winRate: 76,
    totalProfit: 260.2,
    isCurrentUser: false,
  },
  {
    rank: 3,
    address: "0xC3d4E5f67890aBcDeF1234567890AbCdEf123456",
    displayName: "degen_seer",
    wins: 35,
    losses: 15,
    winRate: 70,
    totalProfit: 200.0,
    isCurrentUser: false,
  },
  {
    rank: 4,
    address: "0x7f2a9B4c3D5e6F7890aBcDeF1234567890Ab3a21",
    displayName: null,
    wins: 29,
    losses: 11,
    winRate: 72.5,
    totalProfit: 180.3,
    isCurrentUser: true,
  },
  {
    rank: 5,
    address: "0xD4e5F67890aBcDeF1234567890AbCdEf12345678",
    displayName: "crystal_ball",
    wins: 27,
    losses: 13,
    winRate: 67.5,
    totalProfit: 140.8,
    isCurrentUser: false,
  },
  {
    rank: 6,
    address: "0xE5f67890aBcDeF1234567890AbCdEf1234567890",
    displayName: null,
    wins: 25,
    losses: 15,
    winRate: 62.5,
    totalProfit: 100.5,
    isCurrentUser: false,
  },
  {
    rank: 7,
    address: "0xF67890aBcDeF1234567890AbCdEf12345678901a",
    displayName: "predict_maxi",
    wins: 22,
    losses: 18,
    winRate: 55,
    totalProfit: 40.2,
    isCurrentUser: false,
  },
  {
    rank: 8,
    address: "0x7890aBcDeF1234567890AbCdEf12345678901a2b",
    displayName: null,
    wins: 20,
    losses: 20,
    winRate: 50,
    totalProfit: 10.0,
    isCurrentUser: false,
  },
];

export const STAKE_AMOUNT = 10;

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

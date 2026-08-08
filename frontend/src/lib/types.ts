export interface Market {
  id: string;
  category: string;
  question: string;
  deadline: number;
  yesPercentage: number;
  noPercentage: number;
  totalStake: number;
  participants: number;
  contractAddress: string;
  resolveDescription: string;
  status: "active" | "resolved" | "expired";
}

export interface Prediction {
  id: string;
  marketId: string;
  question: string;
  choice: "YES" | "NO";
  stake: number;
  status: "pending" | "won" | "lost";
  payout: number | null;
  txHash: string;
  settledAt: number | null;
  settlementTime: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string | null;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  isCurrentUser: boolean;
}

export type SwipeDirection = "left" | "right" | "up";

export interface SettlementState {
  phase: "idle" | "sending" | "facilitator" | "verified" | "settled" | "error";
  txHash: string | null;
  settlementTime: number | null;
  error?: string | null;
}

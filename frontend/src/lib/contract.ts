import {
  createPublicClient,
  defineChain,
  formatUnits,
  http,
  type Address,
  type Hex,
} from "viem";

export const PREDICTION_MARKET_ADDRESS =
  "0xc7b33889F8120bD719d48310Dd396855388fbd72" as const;
export const MOCK_USDC_ADDRESS =
  "0xF380657785bb52732DDA31A3cf14c248645594E5" as const;

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadVision",
      url: "https://testnet.monadvision.com",
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

const retryableRpcPatterns = [
  "requests limited",
  "rate limit",
  "too many requests",
  "429",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableRpcError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return retryableRpcPatterns.some((pattern) => message.includes(pattern));
}

async function withRpcRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableRpcError(error)) {
        throw error;
      }

      await sleep(500 * (attempt + 1));
    }
  }

  throw lastError;
}

export const PREDICTION_MARKET_ABI = [
  {
    name: "createMarket",
    type: "function",
    inputs: [
      { name: "question", type: "string" },
      { name: "category", type: "string" },
      { name: "deadline", type: "uint64" }
    ],
    outputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "getMarket",
    type: "function",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "deadline", type: "uint64" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "totalYes", type: "uint128" },
          { name: "totalNo", type: "uint128" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "stakes",
    type: "function",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
      { name: "", type: "bool" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "claim",
    type: "function",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "claimed",
    type: "function",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "nextMarketId",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "Claimed",
    type: "event",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "payout", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Staked",
    type: "event",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "side", type: "bool", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const MOCK_USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "mint",
    type: "function",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export type Market = {
  question: string;
  category: string;
  deadline: bigint;
  resolved: boolean;
  outcome: boolean;
  totalYes: bigint;
  totalNo: bigint;
};

export async function readMarket(id: number): Promise<Market> {
  const [question, category, deadline, resolved, outcome, totalYes, totalNo] =
    await withRpcRetry(() => publicClient.readContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getMarket",
      args: [BigInt(id)],
    }));

  return {
    question,
    category,
    deadline,
    resolved,
    outcome,
    totalYes,
    totalNo,
  };
}

export async function readStake(id: number, user: Address, side: boolean) {
  return withRpcRetry(() => publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "stakes",
    args: [BigInt(id), user, side],
  }));
}

export async function readClaimed(id: number, user: Address) {
  return withRpcRetry(() => publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "claimed",
    args: [BigInt(id), user],
  }));
}

export async function readNextMarketId() {
  const id = await withRpcRetry(() => publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "nextMarketId",
  }));

  return Number(id);
}

export async function readUsdcBalance(user: Address) {
  const balance = await withRpcRetry(() => publicClient.readContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [user],
  }));

  return {
    raw: balance,
    formatted: formatUnits(balance, 6),
  };
}

export async function readLatestClaimTxHash(id: number, user: Address) {
  const logs = await withRpcRetry(() =>
    publicClient.getLogs({
      address: PREDICTION_MARKET_ADDRESS,
      event: {
        name: "Claimed",
        type: "event",
        inputs: [
          { name: "marketId", type: "uint256", indexed: true },
          { name: "user", type: "address", indexed: true },
          { name: "payout", type: "uint256", indexed: false },
        ],
      },
      args: {
        marketId: BigInt(id),
        user,
      },
      fromBlock: BigInt(0),
      toBlock: "latest",
    }),
  );

  return (logs.at(-1)?.transactionHash ?? null) as Hex | null;
}

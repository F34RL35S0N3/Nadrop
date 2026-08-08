import {
  createPublicClient,
  defineChain,
  formatUnits,
  http,
  type Address,
} from "viem";

export const PREDICTION_MARKET_ADDRESS =
  "0x9FC2595F6493b939Db9E9116273129d650A55f86" as const;
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

export const PREDICTION_MARKET_ABI = [
  {
    name: "markets",
    type: "function",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "deadline", type: "uint64" },
      { name: "resolved", type: "bool" },
      { name: "outcome", type: "bool" },
      { name: "totalYes", type: "uint128" },
      { name: "totalNo", type: "uint128" },
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
  deadline: bigint;
  resolved: boolean;
  outcome: boolean;
  totalYes: bigint;
  totalNo: bigint;
};

export async function readMarket(id: number): Promise<Market> {
  const [deadline, resolved, outcome, totalYes, totalNo] =
    await publicClient.readContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "markets",
      args: [BigInt(id)],
    });

  return {
    deadline,
    resolved,
    outcome,
    totalYes,
    totalNo,
  };
}

export async function readStake(id: number, user: Address, side: boolean) {
  return publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "stakes",
    args: [BigInt(id), user, side],
  });
}

export async function readClaimed(id: number, user: Address) {
  return publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "claimed",
    args: [BigInt(id), user],
  });
}

export async function readNextMarketId() {
  const id = await publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "nextMarketId",
  });

  return Number(id);
}

export async function readUsdcBalance(user: Address) {
  const balance = await publicClient.readContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [user],
  });

  return {
    raw: balance,
    formatted: formatUnits(balance, 6),
  };
}

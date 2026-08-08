# SwipePredict — Backend & Deployment Architecture

## 1. Stack Decisions (FINAL — do not change)
- Frontend + API: **Vercel** (Next.js App Router, serverless functions)
- Database: **Supabase** (Postgres)
- Money & truth: **Monad Testnet** (`PredictionMarket.sol`)
- Payment rail: **x402**, official facilitator `https://x402-facilitator.molandak.org`
- Why Vercel over Netlify: Vercel is the maker of Next.js (zero-config App Router), all previous Monad Blitz winners deployed on Vercel, and `@x402/next` middleware (`withX402()`) runs out-of-the-box on Vercel serverless.

## 2. Architecture Diagram
```
┌─────────────────── VERCEL (Next.js) ───────────────────┐
│  FRONTEND (swipe UI, feed, leaderboard)                 │
│        │ POST /api/stake                                │
│        ▼                                                │
│  API ROUTES (serverless)                                │
│   ├─ withX402() middleware → verify via facilitator     │
│   ├─ write cache → Supabase                             │
│   └─ backend hot wallet → stake() on-chain              │
└──────────┬──────────────────────────────┬───────────────┘
           ▼                              ▼
     SUPABASE (Postgres)           MONAD TESTNET
     metadata, odds cache,         PredictionMarket.sol
     leaderboard (fast reads)      = source of truth (money)
```

## 3. Layer Roles
- **On-chain (Monad):** pools, stakes, payouts — everything money-related.
- **Supabase:** question texts, categories, odds cache, leaderboard, display names (millisecond reads, no RPC latency).
- **Vercel API routes:** x402 verification + serverless signer + Supabase writes.
- **x402 facilitator:** verifies each swipe payment.

## 4. Swipe Data Flow (end-to-end)
1. User swipes → POST `/api/stake {marketId, side}`
2. `withX402()` checks payment header → if missing, return HTTP 402
3. Client signs payment seamlessly (no wallet popup) → retry with `X-PAYMENT`
4. Facilitator verifies → 1 mUSDC settles to `PAY_TO_ADDRESS`
5. Serverless function: (a) insert row into Supabase `stakes`, (b) backend hot wallet calls `contract.stakeFor(user, marketId, side)`
6. Return `{success, txHash}` → frontend plays "💸 Staked!" animation

## 5. Signing Decision (MVP)
- On-chain stake tx is signed by the **backend hot wallet** (`BACKEND_PRIVATE_KEY` in Vercel env), because user funds already settled to the platform via x402.
- User wallet ONLY signs the x402 payment (seamless UX).
- Backend wallet holds testnet USDC only, for recycling into pools.
- Roadmap slide: user wallet signs directly + Chainlink/Pyth oracle resolution.

## 6. Supabase Schema (run this SQL in Supabase SQL Editor)
```sql
create table markets (
  id bigint primary key,
  question text not null,
  category text default 'crypto',
  deadline timestamptz not null,
  status text default 'active',
  outcome boolean,
  created_at timestamptz default now()
);

create table stakes (
  id bigint generated always as identity primary key,
  market_id bigint references markets(id),
  user_address text not null,
  side boolean not null,
  amount numeric not null,
  tx_hash text,
  created_at timestamptz default now()
);

create table leaderboard (
  user_address text primary key,
  display_name text,
  wins int default 0,
  losses int default 0,
  streak int default 0,
  profit numeric default 0
);
```

## 7. Vercel Environment Variables
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
BACKEND_PRIVATE_KEY=0x...          # burner hot wallet ONLY
PAY_TO_ADDRESS=0x...               # x402 payment recipient
X402_FACILITATOR_URL=https://x402-facilitator.molandak.org
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_CHAIN_ID=10143
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_USDC_ADDRESS=0xF380657785bb52732DDA31A3cf14c248645594E5
NEXT_PUBLIC_MARKET_ADDRESS=0xTODO  # fill after PredictionMarket.sol deploy
```

## 8. Vercel Constraints (MUST follow)
- Serverless = ephemeral: NEVER run persistent event listeners / WebSocket watchers on Vercel.
- Use ON-DEMAND SYNC: when leaderboard/feed loads, an API route fetches latest on-chain events via viem `getLogs` and updates Supabase.
- Optional: Vercel Cron for periodic sync.

## 9. Deployment Checklist
1. Supabase: create project → run schema SQL → copy URL + service role key
2. Vercel: import GitHub repo → set all env vars → deploy
3. Smoke test: open app → swipe → confirm 402 flow → stake on-chain → row appears in Supabase
4. Update README with live Vercel URL

## 10. Backend Coding Standards
- Contracts: Custom Errors only, no `require(string)`
- Frontend: Privy embedded wallets, NO MetaMask popups
- Money logic lives on-chain; Supabase is cache/metadata ONLY
- Never commit `.env`

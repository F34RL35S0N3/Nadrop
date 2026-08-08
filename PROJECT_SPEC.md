# SwipePredict Project Spec

## 1. PROJECT OVERVIEW

- Nama: SwipePredict
- One-liner: "Prediction market yang secepat swipe TikTok, dengan pembayaran on-chain instan via x402"
- Konsep: User swipe card (kanan = YA, kiri = TIDAK), stake 1 mUSDC, menang dapat payout dari pool
- Value prop: Micro-prediction market tanpa friction, settle dalam hitungan detik

## 2. DEPLOYED CONTRACTS (Monad Testnet, Chain ID 10143)

- MockUSDC: `0xF380657785bb52732DDA31A3cf14c248645594E5` (sudah deployed, REUSE untuk token stake)
- PredictionMarket: BELUM DEPLOYED (akan dibuat di Phase 2)
- Canonical Permit2: `0x000000000022d473030f116ddee9f6b43ac78ba3` (untuk x402)
- x402 ExactPermit2Proxy: `0x402085c248EeA27D92E8b30b2C58ed07f9E20001` (untuk x402)
- x402 Facilitator: `https://x402-facilitator.molandak.org` (official Monad)

## 3. SMART CONTRACT ARCHITECTURE

Kontrak utama: `PredictionMarket.sol`

- Fungsi: `createMarket()`, `stake()`, `resolveMarket()`, `claim()`
- Struct Market: `{question, deadline, resolved, outcome, totalYes, totalNo, mapping stakes}`
- Mekanisme: Pari-mutuel pool (pemenang bagi pool proporsional)
- Gas optimization: Custom Errors, CEI pattern
- Token: MockUSDC (6 decimals, address di atas)

## 4. X402 PAYMENT FLOW

Alur pembayaran per swipe:

1. User swipe -> Frontend POST ke `/api/stake`
2. Server balas HTTP 402 "Payment Required" + payment requirements
3. Frontend sign payment proof (tanpa popup wallet)
4. Frontend re-send request dengan header `X-PAYMENT`
5. Facilitator Monad verifikasi payment
6. Server eksekusi `stake()` ke PredictionMarket contract
7. Transaksi settle di Monad (~1 detik)

## 5. TECH STACK

Smart Contracts:

- Foundry + Solidity 0.8.24
- Deploy & verify via forge script

Frontend:

- Next.js 14 (App Router) + TypeScript
- Privy (embedded wallets, login email/Google)
- Wagmi + Viem (wallet & contract interaction)
- `react-tinder-card` atau Framer Motion (swipe UI)
- Tailwind CSS

Backend:

- Next.js API routes
- `@x402/core`, `@x402/evm`, `@x402/next` SDK

## 6. BUILD PHASES

Phase 1: DONE

- Setup environment
- Deploy MockUSDC
- Verify contracts

Phase 2: TODO

- Tulis `PredictionMarket.sol` (`createMarket`, `stake`, `resolve`, `claim`)
- Test lokal (`forge test`)
- Deploy & verify ke Monad testnet
- Update `PROJECT_SPEC.md` dengan address baru

Phase 3: TODO

- Init Next.js app di folder `web/`
- Setup Privy (embedded wallets)
- Bikin swipe card UI (`react-tinder-card`)
- Integrasi x402 SDK di `/api/stake` route

Phase 4: TODO

- Deploy ke Vercel
- Update `README.md` final
- Demo prep

## 7. ENVIRONMENT VARIABLES

File `.env` di folder `sc/`:

- `PRIVATE_KEY=0x...`
- `MONAD_RPC_URL=https://testnet-rpc.monad.xyz`
- `CHAIN_ID=10143`

File `.env.local` di folder `web/`:

- `NEXT_PUBLIC_PRIVY_APP_ID=...`
- `NEXT_PUBLIC_CHAIN_ID=10143`
- `NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz`
- `NEXT_PUBLIC_MOCKUSDC_ADDRESS=0xF380657785bb52732DDA31A3cf14c248645594E5`
- `NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xTODO` (akan diisi setelah deploy)

## 8. CODING STANDARDS

- Selalu gunakan Custom Errors, jangan `require(string)`
- Privy embedded wallets ONLY, jangan pakai `window.ethereum`/MetaMask popup
- Semua transaksi harus terasa instant (x402 flow)
- Test semua fungsi contract sebelum deploy

# SwipePredict — Frontend Design System & PRD

## 1. Product Summary
- Swipe-card prediction market on Monad testnet; payments settle instantly via x402.
- Value prop: "Prediction market yang secepat dan semudah swipe, dengan settlement on-chain instan dan transparan, tanpa friksi approve-wallet berulang."
- Core principle: web3-native honesty — all on-chain mechanics shown as proof, never hidden. Visual execution must be 100% free of AI slop and web3 slop.

## 2. Success Criteria
- Judges understand the product in <30 seconds of seeing the screen.
- Zero visuals recognizable as generic AI templates or generic "crypto app" templates.
- Demo flow (connect → swipe → settle → result) runs smoothly and convincingly.

## 3. Design Philosophy
- Ground to the subject: momentum, binary decisiveness (YA/TIDAK), live data pulse — like a fast, precise trading floor. NOT a cold, over-decorated crypto dashboard.
- Web3 elements = function, not decoration:
  - Wallet chip (truncated address) always visible in header
  - Tx hash clickable to Monad explorer after every settle
  - Live on-chain odds (from contract), never static numbers
  - Monad testnet badge clearly visible
  - Real settlement speed indicator ("settled ✓ 0.4s"), measured, not claimed
  - Transparency panel: contract address + user tx history

## 4. ANTI-SLOP RULES (MANDATORY — never violate)
AI slop umum yang DILARANG:
- Background krem hangat (#F4F1EA) + aksen terracotta (#D97757)
- Hitam pekat + satu aksen neon/acid-green
- Layout broadsheet ala koran dengan hairline rules tanpa border-radius

Web3 slop yang DILARANG:
- Gradient ungu-ke-biru sebagai background default
- Glassmorphism / frosted-blur card dengan border putih transparan
- Glow/neon border dekoratif di button/card
- Font futuristik sci-fi (Orbitron, Audiowide, dll)
- Ikon 3D coin/blob floating sebagai dekorasi hero
- Badge "Powered by Blockchain" generik / motif rantai-blok literal
- Loading spinner generik berputar lama / confetti berlebihan saat sukses

Rule: setiap elemen visual harus bisa dijawab "karena SwipePredict begini", bukan "karena terlihat modern/crypto".

## 5. Design Tokens
### 5.1 Colors
| Token | Hex | Usage |
| --- | --- | --- |
| Base | #F3F6F4 | main background, cool off-white |
| Ink | #0B1210 | primary text |
| YA | #0E9F6E | emerald — ONLY for YA side & related data |
| TIDAK | #E85D4C | coral-red — ONLY for TIDAK side & related data |
| Live | #F5A623 | amber — limited to "market active" indicators |
| Neutral | #8792A2 | borders, secondary text |

Note: YA/TIDAK colors are a functional binary language, used consistently across odds bar, results, history.

### 5.2 Typography
- Display: General Sans / Cabinet Grotesk (safe fallback: Space Grotesk via Google Fonts)
- Body: Inter
- Mono: IBM Plex Mono / JetBrains Mono for ALL on-chain data (odds, %, addresses, tx hash) — block explorer convention

### 5.3 Layout
- Vertical single-focus stack: one market card dominates, next card faintly visible behind (card deck)
- NO generic 3-column grid for the main feed
- Mobile-first; desktop adjusts without changing focus hierarchy

### 5.4 Signature Elements (ONLY these carry animation energy)
1. Color-bleed swipe — card edges tint proportionally emerald (right) / coral (left) by drag direction & distance
2. Pulse line — thin line under headline, pulsing with live YA/TIDAK ratio
3. Staged settlement status — mono text cycling: `menunggu facilitator` → `terverifikasi` → `settled ✓ 0.4s`

All other areas stay calm and disciplined.

## 6. Pages & Components
Pages/states: Landing/Connect | Market Feed (main) | Swipe Confirmation overlay | Hasil/Riwayat (with tx hash) | Leaderboard | Panel Transparansi (expandable).

Core components: MarketCard (category+deadline mono header, headline, pulse line, odds bar) | WalletChip | SwipeGestureLayer | SettlementStatusToast | LeaderboardRow.

Wireframe:
```
┌─────────────────────────────────┐
│ 0x7f2a...3a21    ● Monad Testnet │
│  [Kripto]        Berakhir 47:12  │
│  Akankah MON naik                │
│  dalam 1 jam ke depan?           │
│  ▓▓▓▓▓▓▓░░░  YA 62%   TIDAK 38%  │
│  ↳ lihat kontrak & riwayat       │
└─────────────────────────────────┘
      ← swipe TIDAK   swipe YA →
```

ADDITIONS (mandatory):
- Visible YA / TIDAK buttons under the card (accessibility, keyboard, reduced-motion, desktop demo fallback)
- Desktop (P1): centered card + side "live settlement ticker" (recent settles, mono, auto-updating)

## 7. Motion Rules
- Swipe done → card snaps out fast (no slow fades)
- Micro-animations <300ms; staged status for real settlement
- FORBIDDEN: particles/confetti, long generic spinners, slow decorative page transitions
- Respect `prefers-reduced-motion`

## 8. Copywriting Guidelines
- User voice, natural language. ✅ "Akankah MON naik dalam 1 jam?" ❌ "Predict MON price movement outcome"
- Concrete honest feedback. ✅ "Taruhan terkirim — settle dalam 0.4 detik" ❌ "Transaction processing..."
- Empty states give action direction. ✅ "Belum ada market aktif. Cek lagi sebentar lagi." ❌ "No data available"
- Vocabulary consistency: button "Klaim" → confirmation "Diklaim"

## 9. Tech Stack & Key Decisions
- Next.js App Router + Tailwind (tokens per Section 5) + Framer Motion (custom drag for color-bleed)
- Wallet: Privy embedded wallet as provider INSIDE Wagmi config — signing is silent/programmatic, NO MetaMask popups; WalletChip shows embedded address
- x402: @x402/core, @x402/evm, @x402/next + facilitator https://x402-facilitator.molandak.org
- Real-time odds: poll every 4-5s or read Supabase cache; confirm via viem watchContractEvent (avoid RPC rate limits)

## 10. Implementation Priority
P0 (must demo): landing/connect + wallet chip + testnet badge | market card + swipe + color-bleed | x402 staged settlement + real settle time + clickable tx hash | live odds bar | YA/TIDAK buttons

P1: hasil/riwayat | leaderboard | transparency panel | desktop live ticker

P2: streak counter | share card | category filter

## 11. Quality Checklist (verify before submit)
Web3 authenticity: wallet chip real address | tx hash clickable | testnet badge visible | transparency panel accessible.

Anti-slop: all rules in Section 4 checked.

Functional: mobile-first tested narrow screen | keyboard focus visible | prefers-reduced-motion respected | all states (loading/error/empty/success) designed.

## 12. Out of Scope (MVP)
Custom stake amount | automatic oracle (manual resolve, explained honestly to judges) | multi-chain | push notifications | dark/light mode toggle (one mode only)

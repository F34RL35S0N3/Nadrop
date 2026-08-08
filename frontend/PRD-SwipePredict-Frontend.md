# PRD — Frontend SwipePredict
### Product Requirements Document untuk UI/UX Web3-Native

**Versi:** 1.0
**Untuk:** Tim Frontend — Monad Developer Blitz Hackathon 2026
**Kategori kompetisi:** Prediction Market

---

## 1. Ringkasan Produk

SwipePredict adalah aplikasi prediction market berbasis interaksi swipe card, di mana user memprediksi hasil ya/tidak dari event singkat, stake sejumlah kecil token, dan pembayaran diproses instan lewat protokol **x402** di atas **Monad testnet**.

**Value proposition:** Prediction market yang secepat dan semudah swipe, dengan settlement on-chain yang instan dan transparan, tanpa friksi approve-wallet berulang.

**Prinsip desain utama:** Frontend ini adalah **web3-native product** — semua mekanisme on-chain (wallet, transaksi, kontrak, kecepatan settlement) ditampilkan secara jujur sebagai bukti kepercayaan, bukan disembunyikan. Namun eksekusi visualnya harus 100% bebas dari pola desain generik/template AI (AI slop), baik pola AI slop umum maupun pola khas "crypto app" yang templated.

---

## 2. Tujuan & Kriteria Sukses

### Tujuan produk
- Menunjukkan prediction market yang terasa cepat, hidup, dan mudah dipakai orang awam sekalipun
- Memamerkan keunggulan teknis x402 (settlement instan) dan Monad (throughput tinggi, gas rendah) secara visual, bukan cuma diklaim di teks
- Menghasilkan UI/UX yang jelas-jelas terlihat "didesain dengan sengaja", bukan hasil generate template

### Kriteria sukses untuk hackathon
- Juri dapat memahami cara kerja produk dalam <30 detik pertama melihat layar
- Tidak ada elemen visual yang dapat dikenali sebagai template AI umum maupun template "crypto app" generik
- Alur demo end-to-end (connect wallet → swipe → settle → lihat hasil) berjalan mulus dan meyakinkan secara visual

---

## 3. Target User & Konteks Penggunaan

- **User utama:** Peserta ekosistem Monad/crypto-curious yang ingin mencoba prediction market tanpa proses rumit
- **Device:** Mobile-first (swipe adalah interaksi utama), tetap harus rapi di desktop untuk keperluan demo di layar besar
- **Konteks demo:** Presentasi live di depan juri — UI harus meyakinkan dalam waktu singkat, bukan dijelaskan panjang lebar

---

## 4. Filosofi Desain

### 4.1 Ground ke subject asli
SwipePredict bukan soal "blockchain futuristik". Dunia visualnya adalah **momentum, ketegasan biner (ya/tidak), dan denyut data yang hidup** — mirip lantai bursa yang cepat dan presisi, bukan dashboard crypto yang dingin dan berlebihan secara dekoratif.

### 4.2 Elemen web3 = fungsi, bukan dekorasi
Karena ini produk web3-native, seluruh mekanisme on-chain **wajib ditunjukkan secara jujur** sebagai bagian dari informasi produk, bukan disamarkan agar terlihat seperti app biasa:

| Elemen web3 | Fungsi dalam UI |
|---|---|
| Wallet connection state | Chip alamat wallet terpotong (`0x7f...3a21`) selalu terlihat di header |
| Transaction hash/receipt | Setelah settle, tampilkan tx hash yang bisa diklik ke Monad explorer |
| Live on-chain odds | Rasio YA/TIDAK dari smart contract, update real-time, bukan angka statis |
| Network/testnet badge | Indikator jelas bahwa ini berjalan di Monad testnet |
| Settlement speed indicator | Angka nyata kecepatan settle (misal "settled in 0.4s"), bukan klaim teks kosong |
| Panel transparansi kontrak | Akses ke contract address & riwayat transaksi user |

### 4.3 Dua kategori "slop" yang harus dihindari

**AI slop umum (pola generik lintas industri):**
- Background krem hangat (`#F4F1EA`) dengan aksen terracotta (`#D97757`)
- Background hitam pekat dengan satu aksen neon/acid-green
- Layout broadsheet dengan hairline rules dan kolom ala koran, tanpa border-radius

**Web3 slop (pola generik khusus crypto app):**
- Gradient ungu-ke-biru sebagai background default
- Glassmorphism / frosted-blur card dengan border putih transparan
- Glow/neon border dekoratif di sekeliling button atau card
- Font futuristik sci-fi (Orbitron, Audiowide, dsb)
- Ikon 3D coin/blob floating sebagai dekorasi hero tanpa fungsi
- Ikon rantai/blok sebagai motif visual literal ("Powered by Blockchain" badge generik)
- Loading spinner generik berputar lama, atau confetti berlebihan saat transaksi sukses

Setiap elemen visual dalam desain akhir harus bisa dijawab dengan **"karena SwipePredict begini"**, bukan **"karena ini terlihat modern/crypto"**.

---

## 5. Design Token System

### 5.1 Palet Warna

| Token | Hex | Penggunaan |
|---|---|---|
| Base | `#F3F6F4` | Background utama, off-white sejuk kehijauan |
| Ink | `#0B1210` | Teks utama, hitam kehijauan pekat |
| Aksen YA | `#0E9F6E` | Emerald — khusus sisi "YA" pada swipe & data terkait |
| Aksen TIDAK | `#E85D4C` | Coral-red — khusus sisi "TIDAK" pada swipe & data terkait |
| Aksen Live/Momentum | `#F5A623` | Amber — dipakai terbatas untuk indikator "market sedang aktif" |
| Netral Chrome | `#8792A2` | Border, teks sekunder, elemen non-fokus |

**Catatan fungsional:** warna YA/TIDAK bukan dekorasi — karena konten produk literally biner, warna menjadi bahasa fungsional yang dipakai konsisten di seluruh state terkait (bar odds, hasil, riwayat transaksi).

### 5.2 Tipografi

| Role | Font | Penggunaan |
|---|---|---|
| Display | General Sans / Cabinet Grotesk | Headline pertanyaan market, judul halaman |
| Body | Sans-serif pendukung (mis. Inter) | Paragraf, deskripsi, label UI |
| Data/Monospace | IBM Plex Mono / JetBrains Mono | Angka odds, persentase, alamat wallet, tx hash, semua data on-chain |

**Catatan fungsional:** monospace untuk data on-chain bukan sekadar gaya — ini konvensi nyata dari block explorer (Etherscan, Monadscan), sehingga user crypto langsung familiar. Dipakai disiplin, tidak ditumpuk efek tambahan.

### 5.3 Layout

- Struktur **stack vertikal single-focus**: satu market card mendominasi layar, dengan bayangan card berikutnya terlihat samar di belakang (dek kartu)
- Hindari grid 3 kolom generik untuk feed utama
- Prioritas mobile-first, breakpoint desktop menyesuaikan tanpa mengubah hierarki fokus

### 5.4 Signature Elements

1. **Color-bleed swipe** — saat card di-drag, tepi card luntur proporsional ke warna emerald (kanan) atau coral (kiri) sesuai arah dan jarak drag. Feedback fungsional yang merepresentasikan keputusan biner secara visual.
2. **Pulse line** — garis tipis animasi di bawah headline card, berdenyut sesuai rasio taruhan YA/TIDAK real-time dari kontrak.
3. **Status settlement bertahap** — teks monospace kecil yang berganti cepat merepresentasikan alur x402 sungguhan: `menunggu facilitator` → `terverifikasi` → `settled ✓ 0.4s`.

Energi animasi disimpan hanya pada tiga elemen ini — area lain tetap tenang dan disiplin.

---

## 6. Struktur Halaman & Komponen

### 6.1 Halaman/State yang dibutuhkan

| Halaman/State | Deskripsi |
|---|---|
| **Landing/Connect** | Hero singkat menjelaskan produk + tombol connect wallet |
| **Market Feed (utama)** | Stack card swipeable, satu market per waktu |
| **Konfirmasi Swipe** | Overlay singkat menunjukkan status settlement bertahap |
| **Hasil/Riwayat** | Daftar prediksi user (menang/kalah/pending) dengan tx hash masing-masing |
| **Leaderboard** | Ranking user berdasarkan win-rate/profit |
| **Panel Transparansi** | Expand dari card: contract address, link ke Monadscan, deskripsi mekanisme resolve |

### 6.2 Komponen inti

- **Market Card** — header (kategori + deadline monospace), headline pertanyaan, pulse line, bar odds YA/TIDAK
- **Wallet Chip** — alamat terpotong + badge network testnet, selalu visible di header
- **Swipe Gesture Layer** — drag handler dengan color-bleed feedback
- **Settlement Status Toast** — indikator bertahap saat transaksi diproses
- **Leaderboard Row** — rank, alamat/nama, win-rate, total profit (monospace untuk angka)

### 6.3 Wireframe konsep (ASCII)

```
┌─────────────────────────────────┐
│ 0x7f2a...3a21    ● Monad Testnet │
│                                   │
│  [Kripto]        Berakhir 47:12  │
│                                   │
│  Akankah MON naik                │
│  dalam 1 jam ke depan?           │
│                                   │
│  ▓▓▓▓▓▓▓░░░  YA 62%   TIDAK 38%  │
│                                   │
│  ↳ lihat kontrak & riwayat       │
└─────────────────────────────────┘
      ← swipe TIDAK   swipe YA →
```

---

## 7. Motion & Interaksi

- Animasi harus **mengomunikasikan kecepatan**, selaras dengan keunggulan teknis x402 + Monad
- Swipe selesai → card snap cepat keluar layar (bukan fade lambat)
- Konfirmasi transaksi → micro-animation singkat (<300ms untuk elemen visual awal), status bertahap untuk proses settlement nyata
- **Hindari:** partikel/confetti berlebihan, loading spinner generik berputar lama, transisi halaman yang lambat/dekoratif tanpa fungsi
- Hormati preferensi `prefers-reduced-motion` — animasi non-esensial dinonaktifkan otomatis

---

## 8. Copywriting Guidelines

- Tulis dari sisi user, bahasa natural — bukan jargon teknis
  - ✅ "Akankah MON naik dalam 1 jam?"
  - ❌ "Predict MON price movement outcome"
- Feedback transaksi konkret dan jujur
  - ✅ "Taruhan terkirim — settle dalam 0.4 detik"
  - ❌ "Transaction processing..."
- State kosong memberi arahan aksi, bukan pesan generik
  - ✅ "Belum ada market aktif. Cek lagi sebentar lagi."
  - ❌ "No data available"
- Konsistensi vokabuler: tombol yang bertuliskan "Klaim" menghasilkan konfirmasi "Diklaim", bukan istilah lain

---

## 9. Tech Stack Frontend

| Layer | Tools |
|---|---|
| Framework | Next.js + React |
| Wallet/Chain | Wagmi + Viem, konfigurasi Monad testnet (`eip155:10143`) |
| Payment | `@x402/core`, `@x402/evm`, `@x402/next`, facilitator resmi Monad |
| Swipe interaction | `react-tinder-card` atau Framer Motion custom |
| Styling | Tailwind CSS dengan token warna/tipografi sesuai Bagian 5 |
| Data real-time | Viem `watchContractEvent` untuk update odds & leaderboard |

---

## 10. Checklist Kualitas Sebelum Submit

**Autentikasi web3 (wajib ada, bukan disembunyikan):**
- [ ] Wallet chip menampilkan alamat asli yang terhubung
- [ ] Setiap transaksi menghasilkan tx hash yang bisa diklik ke Monad explorer
- [ ] Badge network testnet terlihat jelas
- [ ] Panel transparansi kontrak dapat diakses

**Bebas AI slop umum:**
- [ ] Tidak memakai kombinasi krem + terracotta
- [ ] Tidak memakai hitam pekat + satu aksen neon tanpa alasan spesifik
- [ ] Tidak memakai layout broadsheet dengan numbering dekoratif (01/02/03) tanpa makna sequence nyata

**Bebas web3 slop:**
- [ ] Tidak ada gradient ungu-biru sebagai background
- [ ] Tidak ada glassmorphism/blur card dekoratif
- [ ] Tidak ada glow/neon border tanpa fungsi
- [ ] Tidak memakai font futuristik sci-fi
- [ ] Tidak ada ikon 3D coin/blob floating sebagai hero decoration
- [ ] Tidak ada badge "Powered by Blockchain" generik

**Fungsional & responsif:**
- [ ] Mobile-first, teruji di layar sempit sebelum desktop
- [ ] Keyboard focus terlihat jelas (accessibility)
- [ ] `prefers-reduced-motion` dihormati
- [ ] Semua state (loading, error, kosong, sukses) punya desain, bukan dibiarkan default browser

---

## 11. Out of Scope (untuk MVP hackathon)

- Custom stake amount (nominal stake tetap untuk MVP)
- Oracle otomatis (resolve market manual/admin trigger, dijelaskan sebagai simplifikasi ke juri)
- Multi-chain support
- Sistem notifikasi push
- Mode gelap/terang (pilih satu arah sesuai token system di atas, cukup satu mode untuk demo)

---

## 12. Referensi

- Dokumentasi x402 di Monad: `docs.monad.xyz/guides/x402`
- Monad testnet explorer: Monadscan
- Chain ID Monad testnet: `eip155:10143`

# SwipePredict 🔮

SwipePredict adalah aplikasi **prediction market** berbasis interaksi swipe card (seperti Tinder). Di sini, user dapat memprediksi hasil akhir suatu event dengan jawaban Ya/Tidak, mempertaruhkan sejumlah token, dan pembayaran diproses **instan** lewat protokol **x402** di atas **Monad Testnet**.

Proyek ini dibangun untuk kompetisi **Monad Developer Blitz Hackathon 2026** (Kategori Prediction Market).

---

## 📖 Daftar Isi

- [Tentang Produk (Isi)](#-tentang-produk-isi)
- [Alur Penggunaan (Flow)](#-alur-penggunaan-flow)
- [Skema & Arsitektur](#-skema--arsitektur)
- [Tech Stack](#-tech-stack)
- [Prinsip Desain & UI/UX](#-prinsip-desain--uiux)
- [Cara Menjalankan Project (Local Development)](#-cara-menjalankan-project-local-development)

---

## 💡 Tentang Produk (Isi)

SwipePredict bertujuan menjadikan prediction market secepat dan semudah interaksi *swipe*, dengan *settlement on-chain* yang instan dan transparan, tanpa friksi klik setuju (approve) berulang kali di wallet.

**Value Proposition:**
- **Cepat & Interaktif:** Prediksi dengan menggeser kartu ke kanan (Ya) atau ke kiri (Tidak).
- **Instan Settlement:** Transaksi langsung selesai dan di-settle berkat integrasi x402 + kecepatan dari jaringan Monad.
- **Web3-Native & Jujur:** Seluruh mekanisme on-chain, transaction hash, dan alamat kontrak ditampilkan secara transparan sebagai bukti kepercayaan.

---

## 🔄 Alur Penggunaan (Flow)

Alur atau _user journey_ dari aplikasi ini dibuat seefisien mungkin:

1. **Connect Wallet:** User masuk ke landing page dan menghubungkan wallet mereka ke **Monad Testnet**.
2. **Lihat Market (Swipe Card):** User disajikan kartu pertanyaan secara satu-per-satu (satu layer utama tanpa distraksi).
3. **Prediksi (Swipe):** 
   - Geser Kanan 👉 untuk memprediksi **YA**.
   - Geser Kiri 👈 untuk memprediksi **TIDAK**.
4. **Instant Settlement:** Begitu kartu dilepas (dikonfirmasi), indikator settlement seketika berjalan dan merepresentasikan status on-chain. Stake token dikonfirmasi dalam hitungan milidetik.
5. **Cek Hasil & Leaderboard:** User dapat melihat Leaderboard atau Riwayat Transaksi yang mencantumkan *transaction hash* masing-masing prediksi untuk validasi blockchain asli.

---

## 🏗 Skema & Arsitektur

Aplikasi beroperasi sebagai dApp yang menjembatani interaksi UI dengan blockchain Monad.

1. **Frontend (Next.js):** Menyajikan UI yang interaktif (animasi drag/swipe) dan menangkap niat pengguna (YA/TIDAK).
2. **Web3 Connection (Wagmi + Viem):** Mengelola state koneksi wallet, membaca *odds* dari smart contract secara *real-time* (menggunakan polling/event watch), dan mengirim transaksi pengguna ke jaringan.
3. **Settlement Protocol (x402):** Memproses transaksi staking secara instan melalui *facilitator* resmi Monad tanpa jeda konfirmasi yang lama.
4. **Blockchain (Monad Testnet):** Tempat di mana *smart contract* dari market berjalan (`Chain ID: eip155:10143`).

---

## 🛠 Tech Stack

Proyek ini menggunakan teknologi web dan Web3 terkini:

- **Framework:** [Next.js (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Web3 Integration:** [Wagmi v3](https://wagmi.sh/) + [Viem v2](https://viem.sh/) (Dikonfigurasi khusus ke Monad Testnet)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animasi & Interaksi:** [Framer Motion](https://www.framer.com/motion/) (digunakan untuk *swipe gesture* & animasi *color-bleed feedback*)
- **Bahasa Pemrograman:** TypeScript

---

## 🎨 Prinsip Desain & UI/UX

Desain SwipePredict dibangun dengan prinsip **menjauhi elemen "AI Slop"** (template UI crypto yang membosankan dan generik).

### **Signature Elements:**
1. **Color-Bleed Swipe:** Saat menggeser kartu, pinggiran kartu secara dinamis akan "luntur" warnanya proporsional ke *Emerald* (YA - Kanan) atau *Coral-Red* (TIDAK - Kiri).
2. **Pulse Line:** Garis tipis animasi di bawah kartu berdenyut *real-time* mencerminkan persentase taruhan YA/TIDAK dari *smart contract*.
3. **Settlement Bertahap:** Teks monospace muncul memperlihatkan langkah-langkah x402 secara nyata (`menunggu facilitator` → `terverifikasi` → `settled ✓`).

### **Aturan UI Utama:**
- ✅ **Hanya Menampilkan Fungsi, Bukan Dekorasi:** Tidak ada blur/glassmorphism berlebihan, efek neon, logo coin 3D yang melayang, maupun *loading spinner* generik.
- ✅ **Font Monospace untuk Data:** Semua angka *odds*, persentase, alamat wallet, dan *transaction hash* menggunakan font *monospace* (seperti IBM Plex Mono / JetBrains Mono) selayaknya *block explorer* asli.
- ✅ **Warna Spesifik:** Base *Off-white* kehijauan (`#F3F6F4`), Teks Hitam kehijauan pekat (`#0B1210`), dengan aksen ketat (Emerald `#0E9F6E` dan Coral-Red `#E85D4C`).

---

## 🚀 Cara Menjalankan Project (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan frontend di komputer lokal Anda:

### 1. Buka Direktori Proyek
Pastikan Anda sudah berada di root direktori proyek.
```bash
cd nadrop
```

### 2. Install Dependencies
Jalankan perintah berikut untuk menginstall seluruh paket yang dibutuhkan (dengan `npm` / `pnpm` / `yarn`):
```bash
npm install
```

### 3. Jalankan Development Server
Mulai server Next.js dalam mode development:
```bash
npm run dev
```

### 4. Akses Aplikasi
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat UI SwipePredict.

### 💡 Tips Tambahan:
- **Mobile-First Experience:** Halaman web ini didesain mengutamakan mobile. Sangat disarankan melihat pratinjau dalam mode mobile di browser Anda (*Inspect Element* -> *Toggle Device Toolbar*).
- **Wallet Connection:** Pastikan Anda menggunakan extension wallet (seperti MetaMask/Rabby) dan menambah jaringan **Monad Testnet** untuk dapat mencoba simulasi transaksi sepenuhnya.

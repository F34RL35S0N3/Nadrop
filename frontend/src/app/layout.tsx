import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwipePredict — Prediction Market Secepat Swipe",
  description:
    "Prediksi hasil ya/tidak dari event singkat, stake token, dan dapatkan settlement instan on-chain lewat Monad testnet dan x402 protocol.",
  keywords: ["prediction market", "monad", "x402", "web3", "swipe"],
  openGraph: {
    title: "SwipePredict",
    description: "Prediction market secepat swipe, settlement instan on-chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-base)] text-[var(--color-ink)] antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

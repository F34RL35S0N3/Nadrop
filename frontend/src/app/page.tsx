"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWallet } from "@/components/providers/WalletProvider";

export default function LandingPage() {
  const router = useRouter();
  const { connect, isConnected } = useWallet();

  const handleConnect = () => {
    connect();
  };

  // If already connected, redirect
  useEffect(() => {
    if (isConnected) {
      router.push("/market");
    }
  }, [isConnected, router]);

  if (isConnected) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-[calc(100vh-56px)]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        {/* Animated Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mx-auto mb-8 w-72"
        >
          {/* Stacked card shadows */}
          <div className="absolute inset-0 bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] transform rotate-3 scale-[0.92] translate-y-3 opacity-30" />
          <div className="absolute inset-0 bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-stack)] transform -rotate-1 scale-[0.96] translate-y-1.5 opacity-50" />
          
          {/* Main preview card */}
          <div className="relative bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 border border-[var(--color-chrome-border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded-[var(--radius-badge)] bg-[var(--color-chrome-light)] text-[10px] font-medium text-[var(--color-ink)]">
                Kripto
              </span>
              <span className="font-data text-[10px] text-[var(--color-chrome)]">
                Berakhir 47:12
              </span>
            </div>
            <p className="font-display text-base font-bold text-[var(--color-ink)] leading-tight mb-3">
              Akankah MON menembus $5 dalam 1 jam ke depan?
            </p>
            {/* Mini odds bar */}
            <div className="h-2 rounded-full overflow-hidden bg-[var(--color-chrome-light)] mb-2">
              <div className="h-full rounded-full bg-[var(--color-yes)]" style={{ width: "62%" }} />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[var(--color-yes)] font-data font-medium">YA 62%</span>
              <span className="text-[var(--color-no)] font-data font-medium">TIDAK 38%</span>
            </div>
          </div>

          {/* Swipe direction hints */}
          <div className="flex justify-between mt-3 px-4">
            <motion.span
              animate={{ x: [-4, 0, -4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-xs text-[var(--color-no)] font-medium flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              TIDAK
            </motion.span>
            <motion.span
              animate={{ x: [4, 0, 4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-xs text-[var(--color-yes)] font-medium flex items-center gap-1"
            >
              YA
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="font-display text-3xl font-bold text-[var(--color-ink)] mb-3 tracking-tight"
        >
          Prediksi. Swipe. Settle.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[var(--color-chrome)] text-base leading-relaxed mb-8"
        >
          Prediction market secepat swipe. Stake, prediksi ya atau tidak, dan
          dapatkan settlement instan on-chain lewat Monad.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          id="connect-wallet-cta"
          className="w-full max-w-xs px-8 py-3.5 rounded-[var(--radius-button)] bg-[var(--color-ink)] text-[var(--color-base)] text-base font-semibold transition-all duration-200 hover:opacity-90 shadow-[var(--shadow-card)]"
        >
          Login with Privy / MetaMask
        </motion.button>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center justify-center gap-4 mt-6"
        >
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-chrome)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-yes)]" />
            Monad Testnet
          </span>
          <span className="text-[var(--color-chrome-border)]">·</span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-chrome)]">
            x402 Settlement
          </span>
          <span className="text-[var(--color-chrome-border)]">·</span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-chrome)]">
            &lt;1s settle
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

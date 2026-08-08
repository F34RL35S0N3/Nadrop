"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useWallet } from "@/components/providers/WalletProvider";

export default function LandingPage() {
  const router = useRouter();
  const { connect, isConnected } = useWallet();
  const [showTooltip, setShowTooltip] = useState(false);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-100, 100], [-10, 10]);
  const yesOpacity = useTransform(x, [0, 100], [0, 1]);
  const noOpacity = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  useEffect(() => {
    if (isConnected) {
      router.push("/market");
    }
  }, [isConnected, router]);

  if (isConnected) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden flex flex-col items-center">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[var(--color-yes-light)] rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[var(--color-no-light)] rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[var(--color-chrome-light)] rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 py-12 lg:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left: Text & CTA */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-5xl lg:text-7xl font-extrabold text-[var(--color-ink)] mb-6 tracking-tight leading-tight">
                Analyze. Swipe. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-yes)] to-[var(--color-no)]">Validate.</span>
              </h1>
              <p className="text-[var(--color-chrome)] text-lg lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                The most honest Web3 prediction market. Swipe to share sentiment, validate instantly on Monad, and earn reputation while supporting Public Goods.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={connect}
                  className="relative overflow-hidden group px-8 py-4 rounded-[var(--radius-button)] bg-[var(--color-ink)] text-[var(--color-surface)] font-semibold text-lg shadow-[var(--shadow-card-hover)] transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10">Start Predicting</span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[var(--color-yes)] to-[var(--color-no)] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </button>
                <div className="text-sm font-medium text-[var(--color-chrome)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-yes)] animate-pulse" />
                  Live on Monad Testnet
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Interactive Mock Swipe Card */}
          <div className="flex-1 w-full max-w-sm flex items-center justify-center relative min-h-[400px]">
            {/* Background stacked hints */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute bg-[var(--color-surface)]/40 backdrop-blur-md rounded-[var(--radius-card)] w-72 h-[280px] shadow-[var(--shadow-stack)] transform rotate-6 scale-[0.9] translate-y-4" />
              <div className="absolute bg-[var(--color-surface)]/60 backdrop-blur-md rounded-[var(--radius-card)] w-72 h-[280px] shadow-[var(--shadow-stack)] transform -rotate-3 scale-[0.95] translate-y-2" />
            </div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{ x, opacity, rotate }}
              whileTap={{ cursor: "grabbing" }}
              className="relative bg-[var(--color-surface)]/80 backdrop-blur-xl rounded-[var(--radius-card)] shadow-[var(--shadow-card-hover)] p-6 border border-[var(--color-chrome-light)] w-72 cursor-grab mx-auto touch-none"
            >
              {/* Overlay labels */}
              <motion.div style={{ opacity: yesOpacity }} className="absolute top-4 left-4 z-20 pointer-events-none rotate-[-15deg] border-2 border-[var(--color-yes)] text-[var(--color-yes)] font-bold text-xl px-3 py-1 rounded-[var(--radius-badge)]">
                YES
              </motion.div>
              <motion.div style={{ opacity: noOpacity }} className="absolute top-4 right-4 z-20 pointer-events-none rotate-[15deg] border-2 border-[var(--color-no)] text-[var(--color-no)] font-bold text-xl px-3 py-1 rounded-[var(--radius-badge)]">
                NO
              </motion.div>

              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-[var(--radius-badge)] bg-[var(--color-chrome-light)] text-xs font-semibold text-[var(--color-ink)]">
                  Crypto
                </span>
                <span className="font-data text-xs text-[var(--color-chrome)] font-medium">
                  Ends 47:12
                </span>
              </div>
              <p className="font-display text-xl font-bold text-[var(--color-ink)] leading-snug mb-6">
                Will MON break $5 in the next hour?
              </p>
              
              <div className="h-2.5 rounded-full overflow-hidden bg-[var(--color-chrome-light)] mb-3">
                <div className="h-full rounded-full bg-[var(--color-yes)]" style={{ width: "62%" }} />
              </div>
              <div className="flex justify-between text-xs mb-4">
                <span className="text-[var(--color-yes)] font-data font-bold">YES 62%</span>
                <span className="text-[var(--color-no)] font-data font-bold">NO 38%</span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 bg-[var(--color-chrome-light)]/30 rounded-xl mt-4">
                 <motion.span animate={{ x: [-3, 0, -3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="text-[10px] font-bold text-[var(--color-no)] flex items-center gap-1">
                   <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                   SWIPE NO
                 </motion.span>
                 <motion.span animate={{ x: [3, 0, 3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="text-[10px] font-bold text-[var(--color-yes)] flex items-center gap-1">
                   SWIPE YES
                   <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                 </motion.span>
              </div>
            </motion.div>

            {/* Login Tooltip on Swipe */}
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-16 bg-[var(--color-ink)] text-[var(--color-surface)] text-sm font-medium px-4 py-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-50"
              >
                Login to lock in your prediction! 🚀
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Box Features */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <div className="bg-[var(--color-surface)]/70 backdrop-blur-md rounded-2xl p-8 border border-[var(--color-chrome-light)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-yes-light)] flex items-center justify-center mb-6 text-[var(--color-yes)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-3 text-[var(--color-ink)]">Instant Settlement</h3>
            <p className="text-[var(--color-chrome)] text-sm leading-relaxed">
              Experience the speed of Monad and x402 protocol. As soon as a market resolves, payouts are instantly distributed on-chain with zero manual claiming friction.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[var(--color-surface)]/70 backdrop-blur-md rounded-2xl p-8 border border-[var(--color-chrome-light)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-chrome-light)] flex items-center justify-center mb-6 text-[var(--color-ink)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-3 text-[var(--color-ink)]">Build Reputation</h3>
            <p className="text-[var(--color-chrome)] text-sm leading-relaxed">
              Every accurate prediction boosts your on-chain reputation. Climb the leaderboard, earn exclusive badges, and prove you are the ultimate sentiment analyst.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[var(--color-surface)]/70 backdrop-blur-md rounded-2xl p-8 border border-[var(--color-chrome-light)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-no-light)] flex items-center justify-center mb-6 text-[var(--color-no)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-3 text-[var(--color-ink)]">Public Goods</h3>
            <p className="text-[var(--color-chrome)] text-sm leading-relaxed">
              By participating, you directly fund ecosystem. A portion of the protocol&apos;s yields automatically flows into the Monad Public Goods Fund.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

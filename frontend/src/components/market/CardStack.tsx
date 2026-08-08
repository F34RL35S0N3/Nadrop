"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Market, SwipeDirection } from "@/lib/types";
import { SwipeGestureLayer } from "./SwipeGestureLayer";
import { MarketCard } from "./MarketCard";

interface CardStackProps {
  currentMarket: Market | null;
  nextMarket: Market | null;
  onSwipe: (market: Market, direction: SwipeDirection) => void;
  onSwipeComplete: () => void;
  hasMore: boolean;
}

export function CardStack({
  currentMarket,
  nextMarket,
  onSwipe,
  onSwipeComplete,
  hasMore,
}: CardStackProps) {
  if (!hasMore || !currentMarket) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-full bg-[var(--color-chrome-light)] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 6V14L19 17"
              stroke="var(--color-chrome)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="14"
              cy="14"
              r="10"
              stroke="var(--color-chrome)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-[var(--color-ink)] mb-1">
          All markets have been swiped
        </p>
        <p className="text-sm text-[var(--color-chrome)] text-center">
          Check back soon for new markets.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Background Card (next market preview) */}
      {nextMarket && (
        <div className="absolute inset-0 z-0" style={{ transform: "scale(0.95) translateY(12px)" }}>
          <div className="opacity-50 pointer-events-none">
            <MarketCard market={nextMarket} isTop={false} />
          </div>
        </div>
      )}

      {/* Active Card with Swipe Gesture */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentMarket.id}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <SwipeGestureLayer
            market={currentMarket}
            onSwipe={(direction) => onSwipe(currentMarket, direction)}
            onSwipeComplete={onSwipeComplete}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Market, SwipeDirection } from "@/lib/types";
import { MarketCard } from "./MarketCard";

interface SwipeGestureLayerProps {
  market: Market;
  onSwipe: (direction: SwipeDirection) => void;
  onSwipeComplete: () => void;
}

const SWIPE_THRESHOLD = 100;
const EXIT_DISTANCE = 500;

export function SwipeGestureLayer({
  market,
  onSwipe,
  onSwipeComplete,
}: SwipeGestureLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const yesOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 0.25]);
  const noOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [0.25, 0]);
  const skipOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [0.22, 0]);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const scale = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [0.97, 0.99, 1, 0.99, 0.97],
  );

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velocityX = info.velocity.x;

    if (
      offsetY < -SWIPE_THRESHOLD &&
      Math.abs(offsetY) > Math.abs(offsetX)
    ) {
      onSwipe("up");
      setTimeout(onSwipeComplete, 300);
      return;
    }

    if (Math.abs(offsetX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500) {
      onSwipe(offsetX > 0 ? "right" : "left");
      setTimeout(onSwipeComplete, 300);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full touch-none">
      <motion.div
        className="absolute inset-0 rounded-[var(--radius-card)] pointer-events-none z-10"
        style={{
          opacity: yesOpacity,
          background:
            "linear-gradient(90deg, transparent 60%, var(--color-yes) 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-[var(--radius-card)] pointer-events-none z-10"
        style={{
          opacity: noOpacity,
          background:
            "linear-gradient(-90deg, transparent 60%, var(--color-no) 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-[var(--radius-card)] pointer-events-none z-10"
        style={{
          opacity: skipOpacity,
          background:
            "linear-gradient(180deg, var(--color-live) 0%, transparent 45%)",
        }}
      />

      <motion.div
        className="absolute top-6 right-6 z-20 pointer-events-none"
        style={{ opacity: useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]) }}
      >
        <div className="px-3 py-1.5 rounded-[var(--radius-badge)] border-2 border-[var(--color-yes)] text-[var(--color-yes)] font-bold text-sm rotate-12">
          YES
        </div>
      </motion.div>
      <motion.div
        className="absolute top-6 left-6 z-20 pointer-events-none"
        style={{ opacity: useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]) }}
      >
        <div className="px-3 py-1.5 rounded-[var(--radius-badge)] border-2 border-[var(--color-no)] text-[var(--color-no)] font-bold text-sm -rotate-12">
          NO
        </div>
      </motion.div>
      <motion.div
        className="absolute top-6 left-1/2 z-20 -translate-x-1/2 pointer-events-none"
        style={{ opacity: useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]) }}
      >
        <div className="px-3 py-1.5 rounded-[var(--radius-badge)] border-2 border-[var(--color-live)] text-[var(--color-live)] font-bold text-sm">
          SKIP
        </div>
      </motion.div>

      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, scale }}
        exit={{
          x: x.get() > 0 ? EXIT_DISTANCE : x.get() < 0 ? -EXIT_DISTANCE : 0,
          y: y.get() < 0 ? -EXIT_DISTANCE : 0,
          opacity: 0,
          transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        }}
        className="relative z-0 cursor-grab active:cursor-grabbing"
        whileTap={{ cursor: "grabbing" }}
      >
        <MarketCard market={market} isTop={true} />
      </motion.div>
    </div>
  );
}

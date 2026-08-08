"use client";

import { motion } from "framer-motion";

interface OddsBarProps {
  yesPercentage: number;
  noPercentage: number;
}

export function OddsBar({ yesPercentage, noPercentage }: OddsBarProps) {
  return (
    <div className="w-full">
      {/* Bar */}
      <div className="relative h-2.5 rounded-full overflow-hidden bg-[var(--color-chrome-light)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-yes)]"
          initial={false}
          animate={{ width: `${yesPercentage}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 rounded-full bg-[var(--color-no)]"
          initial={false}
          animate={{ width: `${noPercentage}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-yes)]" />
          <span className="text-sm font-medium text-[var(--color-yes)]">YES</span>
          <span className="font-data text-sm text-[var(--color-yes)]">
            {yesPercentage}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-data text-sm text-[var(--color-no)]">
            {noPercentage}%
          </span>
          <span className="text-sm font-medium text-[var(--color-no)]">NO</span>
          <span className="w-2 h-2 rounded-full bg-[var(--color-no)]" />
        </div>
      </div>
    </div>
  );
}

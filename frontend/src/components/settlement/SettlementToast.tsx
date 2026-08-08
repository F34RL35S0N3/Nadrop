"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SettlementState } from "@/lib/types";
import { MONAD_TESTNET_EXPLORER, truncateAddress } from "@/lib/mockData";

interface SettlementToastProps {
  state: SettlementState;
  choice: "YES" | "NO";
  question: string;
  onDismiss: () => void;
}

const PHASE_LABELS: Record<SettlementState["phase"], string> = {
  idle: "",
  sending: "sending contribution",
  facilitator: "waiting for facilitator",
  verified: "verified",
  settled: "settled",
  error: "error",
};

export function SettlementToast({
  state,
  choice,
  question,
  onDismiss,
}: SettlementToastProps) {
  const [autoDismiss, setAutoDismiss] = useState(false);

  useEffect(() => {
    if (state.phase === "settled") {
      const timer = window.setTimeout(() => setAutoDismiss(true), 3000);
      return () => window.clearTimeout(timer);
    }
  }, [state.phase]);

  useEffect(() => {
    if (autoDismiss) onDismiss();
  }, [autoDismiss, onDismiss]);

  if (state.phase === "idle") return null;

  const isYes = choice === "YES";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm"
      >
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-overlay)] border border-[var(--color-chrome-border)] overflow-hidden">
          <div
            className="h-1"
            style={{
              background: isYes ? "var(--color-yes)" : "var(--color-no)",
            }}
          />

          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isYes
                    ? "bg-[var(--color-yes-light)] text-[var(--color-yes)]"
                    : "bg-[var(--color-no-light)] text-[var(--color-no)]"
                }`}
              >
                {isYes ? "YES" : "NO"}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs font-bold ${
                    isYes ? "text-[var(--color-yes)]" : "text-[var(--color-no)]"
                  }`}
                >
                  Predicted {choice}
                </span>
                <p className="text-sm text-[var(--color-ink)] mt-0.5 line-clamp-2">
                  {question}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {(["sending", "facilitator", "verified", "settled"] as const).map(
                (phase) => {
                  const phases = [
                    "idle",
                    "sending",
                    "facilitator",
                    "verified",
                    "settled",
                    "error",
                  ] as const;
                  const currentIdx = phases.indexOf(state.phase);
                  const phaseIdx = phases.indexOf(phase);
                  const isActive = state.phase === phase;
                  const isDone = currentIdx > phaseIdx && state.phase !== "error";
                  const isSettled = phase === "settled" && state.phase === "settled";

                  if (!isActive && !isDone && !isSettled) return null;

                  return (
                    <div
                      key={phase}
                      className={`flex items-center gap-2 ${
                        isActive ? "animate-settle-appear" : ""
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDone || isSettled
                            ? "bg-[var(--color-yes)]"
                            : isActive
                              ? "bg-[var(--color-live)] animate-pulse-dot"
                              : "bg-[var(--color-chrome-light)]"
                        }`}
                      />
                      <span
                        className={`font-data text-xs ${
                          isDone || isSettled
                            ? "text-[var(--color-yes)]"
                            : isActive
                              ? "text-[var(--color-ink)]"
                              : "text-[var(--color-chrome)]"
                        }`}
                      >
                        {isSettled && state.settlementTime
                          ? `settled ✓ ${state.settlementTime}s`
                          : PHASE_LABELS[phase]}
                      </span>
                    </div>
                  );
                },
              )}
            </div>

            {state.phase === "error" && state.error ? (
              <pre className="mt-3 whitespace-pre-wrap break-words font-data text-xs text-[var(--color-no)]">
                {state.error}
              </pre>
            ) : null}

            {(state.txHash && state.phase === "settled") ||
            state.phase === "error" ? (
              <div className="mt-3 pt-3 border-t border-[var(--color-chrome-border)]">
                <div className="flex items-center justify-between gap-3">
                  {state.txHash ? (
                    <a
                      href={`${MONAD_TESTNET_EXPLORER}/tx/${state.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-data text-[11px] text-[var(--color-yes)] hover:underline"
                    >
                      tx: {truncateAddress(state.txHash)}
                    </a>
                  ) : (
                    <span className="font-data text-[11px] text-[var(--color-chrome)]">
                      no tx
                    </span>
                  )}
                  <button
                    onClick={onDismiss}
                    className="text-xs text-[var(--color-chrome)] hover:text-[var(--color-ink)] transition-colors px-2 py-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

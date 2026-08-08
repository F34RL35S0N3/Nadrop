"use client";

import { useState, useCallback } from "react";
import { SettlementState } from "@/lib/types";

export function useSettlement() {
  const [state, setState] = useState<SettlementState>({
    phase: "idle",
    txHash: null,
    settlementTime: null,
    error: null,
  });

  const startSettlement = useCallback(() => {
    const startTime = performance.now();

    setState({
      phase: "sending",
      txHash: null,
      settlementTime: null,
      error: null,
    });

    // Phase 1: sending → facilitator (simulated ~200ms)
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        phase: "facilitator",
      }));

      // Phase 2: facilitator → verified (simulated ~150ms)
      setTimeout(() => {
        const mockTxHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`;

        setState((prev) => ({
          ...prev,
          phase: "verified",
          txHash: mockTxHash,
        }));

        // Phase 3: verified → settled (simulated ~50ms)
        setTimeout(() => {
          const elapsed = (performance.now() - startTime) / 1000;
          setState({
            phase: "settled",
            txHash: mockTxHash,
            settlementTime: Math.round(elapsed * 10) / 10,
            error: null,
          });
        }, 50);
      }, 150);
    }, 200);
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: "idle",
      txHash: null,
      settlementTime: null,
      error: null,
    });
  }, []);

  return { state, startSettlement, reset };
}

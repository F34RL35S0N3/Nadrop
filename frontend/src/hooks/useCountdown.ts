"use client";

import { useState, useEffect } from "react";
import { formatCountdown } from "@/lib/mockData";

export function useCountdown(deadline: number) {
  const [display, setDisplay] = useState(() => formatCountdown(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(formatCountdown(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return display;
}

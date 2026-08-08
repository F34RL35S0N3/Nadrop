"use client";

import { useEffect, useRef } from "react";

interface PulseLineProps {
  yesPercentage: number;
  active?: boolean;
}

export function PulseLine({ yesPercentage, active = true }: PulseLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const midY = height / 2;

    // Pulse speed relative to market activity (higher yes% = more active)
    const baseFrequency = 0.02 + (yesPercentage / 100) * 0.03;
    const amplitude = 2 + (yesPercentage / 100) * 3;

    let phase = 0;

    const yesColor = "#0E9F6E";
    const noColor = "#E85D4C";

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(0, midY);

      for (let x = 0; x < width; x++) {
        const progress = x / width;
        const wave = Math.sin(x * baseFrequency + phase) * amplitude;
        const envelope = Math.sin(progress * Math.PI) * 0.8 + 0.2;
        const y = midY + wave * envelope;
        ctx.lineTo(x, y);
      }

      // Gradient from yes to no color based on odds
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, yesColor);
      gradient.addColorStop(yesPercentage / 100, yesColor);
      gradient.addColorStop(Math.min((yesPercentage / 100) + 0.1, 1), noColor);
      gradient.addColorStop(1, noColor);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!prefersReducedMotion && active) {
        phase += 0.04;
        animationRef.current = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [yesPercentage, active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-3 opacity-70"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}

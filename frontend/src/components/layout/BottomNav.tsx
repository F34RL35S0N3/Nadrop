"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/components/providers/WalletProvider";

const NAV_ITEMS = [
  {
    label: "Market",
    href: "/market",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" fill="none" />
        <path d="M6 10L9 7L12 10L16 6" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Analysis History",
    href: "/history",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" fill="none" />
        <path d="M10 6V10L13 12" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Top Analysts",
    href: "/leaderboard",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="10" width="4" height="7" rx="1" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" fill={active ? "var(--color-yes-light)" : "none"} />
        <rect x="8" y="5" width="4" height="12" rx="1" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" fill={active ? "var(--color-yes-light)" : "none"} />
        <rect x="13" y="8" width="4" height="9" rx="1" stroke={active ? "var(--color-yes)" : "var(--color-chrome)"} strokeWidth="1.5" fill={active ? "var(--color-yes-light)" : "none"} />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isConnected } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {/* Mobile: Fixed bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-sm border-t border-[var(--color-chrome-border)] md:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}-mobile`}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[var(--radius-chip)] transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--color-yes)]"
                    : "text-[var(--color-chrome)] hover:text-[var(--color-ink)]"
                }`}
              >
                {item.icon(isActive)}
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: Top navigation tabs (shown in header area) */}
      <nav className="hidden md:flex fixed top-14 left-0 right-0 z-40 bg-[var(--color-base)]/95 backdrop-blur-sm border-b border-[var(--color-chrome-border)]">
        <div className="max-w-7xl mx-auto flex items-center gap-1 px-6 py-1.5 w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}-desktop`}
                className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-chip)] text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--color-yes-light)] text-[var(--color-yes)]"
                    : "text-[var(--color-chrome)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                }`}
              >
                {item.icon(isActive)}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

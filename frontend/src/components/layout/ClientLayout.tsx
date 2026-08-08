"use client";

import { ReactNode } from "react";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <Header />
      <main className="flex-1 flex flex-col md:pt-12">{children}</main>
      <BottomNav />
    </WalletProvider>
  );
}

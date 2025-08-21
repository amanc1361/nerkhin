import BottomNav from "@/app/components/nav/BottomNav";
import TopNav from "@/app/components/nav/TopNav";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import type { ReactNode } from "react";


export default function Layout({ children }: { children: ReactNode }) {
  const t = getMarketMessages("fa");
  return (
    <div className="min-h-dvh bg-white">
      <TopNav t={t} role="wholesaler" active="search" />
      {children}
      <div className="h-24 md:h-0" />
      <BottomNav t={t} role="wholesaler" active="search" />
    </div>
  );
}

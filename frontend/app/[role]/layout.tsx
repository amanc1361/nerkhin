import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import type { ReactNode } from "react";
import TopNav from "../components/nav/TopNav";
import BottomNav from "../components/nav/BottomNav";


export default function RoleLayout({ children, params }:{ children: ReactNode; params: { role: "wholesaler" | "retailer" } }) {
  const t = getMarketMessages("fa");
  return (
    <div className="min-h-dvh bg-white">
      <TopNav t={t} role={params.role} active="search" />
      {children}
      <div className="h-24 md:h-0" />
      <BottomNav t={t} role={params.role} active="search" />
    </div>
  );
}

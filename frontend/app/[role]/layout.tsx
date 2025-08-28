import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import type { ReactNode } from "react";
import TopNav from "../components/nav/TopNav";
import BottomNav from "../components/nav/BottomNav";


export default async function RoleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ role: "wholesaler" | "retailer" }>;
}) {
  const { role } = await params;
  const t = getMarketMessages("fa");

  return (
    <div  dir="rtl" className="min-h-dvh bg-white">
      <TopNav t={t} role={role} active="search" />
      {children}
      <div className="h-24 md:h-0" />
      <BottomNav t={t} role={role} active="search" />
    </div>
  );
}




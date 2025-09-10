// app/[role]/layout.tsx

import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import type { ReactNode } from "react";
import TopNav from "../components/nav/TopNav";
import BottomNav from "../components/nav/BottomNav";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type Role = "wholesaler" | "retailer";

export default async function RoleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ role: Role }>; // اگر پروژه‌ات Sync APIs دارد، Promise نگه دار
}) {
  noStore();

  // 1) نقشِ پاس‌داده‌شده از middleware
  const hdr = headers();
  const hdrRole = ((await hdr).get("x-user-role") || "") as Role;

  // 2) fallback: پارامز مسیر
  const { role: routeRole } = await params;

  const role = (hdrRole || routeRole) as Role;

  const t = getMarketMessages("fa");

  return (
    <div dir="rtl" className="min-h-dvh bg-white">

      <TopNav t={t} role={role} />
      {children}
      <div className="h-24 md:h-0" />
      <BottomNav t={t} role={role}  />
    </div>
  );
}

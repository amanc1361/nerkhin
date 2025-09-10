"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import React from "react";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";

type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

type IconProps = { className?: string };
const Icons: Record<Active, React.FC<IconProps>> = {
  search: ({ className = "" }) => (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  account: ({ className = "" }) => (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  products: ({ className = "" }) => (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 3l9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13V3" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function BottomNav({
  t,
  role,
}: {
  t: MarketMessages;
  role: Role;
}) {
  // در لایه app/[role] هستیم؛ سگمنت فرزند:
  const segment = useSelectedLayoutSegment(); // "account" | "products" | null

  // اگر روی روت /[role] باشیم (segment === null) → search فعال باشد
  const activeKey: Active =
    segment === null
      ? "search"
      : segment === "account"
      ? "account"
      : segment === "products"
      ? "products"
      : "search"; // پیش‌فرض امن

  const base = `/${role}`;
  const items =
    role === "wholesaler"
      ? ([
          { key: "search" as const, href: `${base}`, label: t.menu.search },
          { key: "account" as const, href: `${base}/account`, label: t.menu.myAccount },
          { key: "products" as const, href: `${base}/products`, label: t.menu.myProducts },
        ])
      : ([
          { key: "search" as const, href: `${base}`, label: t.menu.search },
          { key: "account" as const, href: `${base}/account`, label: t.menu.myAccount },
        ]);

  return (
    <nav dir="rtl" className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[94%]">
      <div className="rounded-3xl px-3 py-2 bg-white/90 backdrop-blur border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(({ key, href, label }) => {
            const IconCmp = Icons[key];
            const isActive = activeKey === key;
            return (
              <li key={key} className="flex justify-center">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-xs transition",
                    isActive ? "text-slate-900 bg-slate-100 shadow-inner" : "text-slate-500 hover:text-slate-900",
                  ].join(" ")}
                >
                  <IconCmp className="w-5 h-5 -translate-y-[1px]" />
                  <span className="leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

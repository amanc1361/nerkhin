import Link from "next/link";
import Image from "next/image";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import { JSX } from "react";
import { formatTodayJalali } from "@/lib/date/jalai";
import BrandLogo from "../shared/‌BrandLogo";


type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

const IconSearch = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 3-8 6v1h16v-1c0-3-3-6-8-6Z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
);







export default function TopNav({
  t, role, active,
}: { t: MarketMessages; role: Role; active: Active }) {
  const base = role === "wholesaler" ? "/wholesaler" : "/retailer";
  const items = [
    { key: "search", href: `${base}/search`,   label: t.menu.search,   icon: <IconSearch/> },
    { key: "account", href: `${base}/account`, label: t.menu.myAccount, icon: <IconUser/>  },
    ...(role === "wholesaler" ? [{ key: "products", href: `${base}/products`, label: t.menu.myProducts, icon: <IconBox/> }] : []),
  ] as const;

  return (
    <div dir="rtl" className="sticky top-0 z-50">
      <div className="bg-white/70 backdrop-blur-md border-b border-slate-200/70">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ لوگوی شما */}
            <BrandLogo
              variant="logo3"          // یا "logo2"
              href={base + "/search"}  // کلیک = بازگشت به صفحه نقش
              className="w-16 h-auto"  // سایز
              title="Nerkhin"
            />
            <div className="text-xs text-slate-500 hidden sm:block">{formatTodayJalali()}</div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-50/60 rounded-2xl p-1 border border-slate-200/70 shadow-sm">
            {items.map(it => (
              <Link
                key={it.key}
                href={it.href}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition",
                  active === it.key
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                ].join(" ")}
              >
                {it.icon}<span className="text-sm">{it.label}</span>
              </Link>
            ))}
          </nav>

          <div className="md:hidden text-slate-400 text-sm">{formatTodayJalali()}</div>
        </div>
      </div>
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 opacity-70" />
    </div>
  );
}

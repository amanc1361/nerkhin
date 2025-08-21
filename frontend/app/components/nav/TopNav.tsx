import { formatTodayJalali } from "@/lib/date/jalai";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";
import BrandLogo from "../shared/‌BrandLogo";


type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

const IconSearch = () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>;
const IconUser   = () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 3-8 6v1h16v-1c0-3-3-6-8-6Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>;
const IconBox    = () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>;

export default function TopNav({ t, role, active }: { t: MarketMessages; role: Role; active: Active }) {
  const base = role === "wholesaler" ? "/wholesaler" : "/retailer";
  const items = [
    { key: "search",   href: `${base}/search`,   label: t.menu.search,   icon: <IconSearch/> },
    { key: "account",  href: `${base}/account`,  label: t.menu.myAccount, icon: <IconUser/>  },
    ...(role === "wholesaler" ? [{ key: "products", href: `${base}/products`, label: t.menu.myProducts, icon: <IconBox/> }] : []),
  ] as const;

  return (
    <header dir="rtl" className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="text-xs md:text-sm text-slate-500">{formatTodayJalali()}</div>

        <BrandLogo variant="logo3" href={`${base}/search`} className="w-16 md:w-20 h-auto" title="Nerkhin" />

        <nav className="hidden md:flex items-center gap-1 rounded-2xl p-1 border border-slate-200 bg-slate-50/60">
          {items.map(it => (
            <Link
              key={it.key}
              href={it.href}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-xl transition",
                active === it.key ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900 hover:bg-white/70",
              ].join(" ")}
            >
              {it.icon}<span className="text-sm">{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";
import BrandLogo from "../shared/‌BrandLogo";

type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

// آیکن‌های ساده؛ لینک‌ها را تغییر نمی‌دهیم
const IconSearch = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 3-8 6v1h16v-1c0-3-3-6-8-6Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
);

export default function TopNav({
  t,
  role,
  active,
}: {
  t: MarketMessages;
  role: Role;
  active: Active;
}) {
  const base = role === "wholesaler" ? "/wholesaler" : "/retailer";

  // ⚠️ لینک‌ها را تغییر نمی‌دهیم؛ فقط استایل
  const items =
    role === "wholesaler"
      ? ([
          { key: "search", href: `${base}/search`, label: t.menu.search, icon: <IconSearch /> },
          { key: "account", href: `${base}/account`, label: t.menu.myAccount, icon: <IconUser /> },
          { key: "products", href: `${base}/products`, label: t.menu.myProducts, icon: <IconBox /> },
        ] as const)
      : ([
          { key: "search", href: `${base}/search`, label: t.menu.search, icon: <IconSearch /> },
          { key: "account", href: `${base}/account`, label: t.menu.myAccount, icon: <IconUser /> },
        ] as const);

  function formatTodayJalaliShort(): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <header dir="rtl" className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl h-14 md:h-16 px-4 flex items-center justify-between">
        {/* راست: لوگو */}
        <BrandLogo variant="logo3" href={`${base}`} className="w-20 md:w-24 h-auto" title="Nerkhin" />

        {/* وسط: منو (فقط دسکتاپ) */}
        <nav className="hidden md:flex items-center gap-6">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className={[
                "flex items-center gap-2 text-[15px] transition",
                active === it.key
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {it.icon}
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>

        {/* چپ: تاریخ کوتاه */}
        <div className="text-slate-400 text-sm">{formatTodayJalaliShort()}</div>
      </div>
    </header>
  );
}

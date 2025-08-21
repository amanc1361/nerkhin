// components/nav/TopNav.tsx
import { formatTodayJalaliShort } from "@/lib/date/jalai";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";
import BrandLogo from "../shared/‌BrandLogo";


type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

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

  // فقط داده‌های ساده (هیچ JSX داخل آرایه نیست)
  const items =
    role === "wholesaler"
      ? ([
          { key: "search" as const,   href: `${base}/search`,   label: t.menu.search },
          { key: "account" as const,  href: `${base}/account`,  label: t.menu.myAccount },
          { key: "products" as const, href: `${base}/products`, label: t.menu.myProducts },
        ])
      : ([
          { key: "search" as const,   href: `${base}/search`,   label: t.menu.search },
          { key: "account" as const,  href: `${base}/account`,  label: t.menu.myAccount },
        ]);

  // ⛑️ ایمن‌سازی تاریخ: اگر هر مشکلی بود، خالی برگرده و UI بالا بیاید
  let dateShort = "";
  try {
    dateShort = formatTodayJalaliShort();
  } catch {
    dateShort = "";
  }

  const renderIcon = (key: Active) => {
    switch (key) {
      case "search":
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9"
              stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
        );
      case "account":
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 3-8 6v1h16v-1c0-3-3-6-8-6Z"
              stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
        );
      case "products":
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7"
              stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <header dir="rtl" className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl h-14 md:h-16 px-4 flex items-center justify-between">
        {/* راست: لوگو */}
        <BrandLogo variant="logo3" href={`${base}`} className="w-20 md:w-24 h-auto" title="Nerkhin" />

        {/* وسط: منو (فقط دسکتاپ) */}
        <nav className="hidden md:flex items-center gap-6">
          {items.map(({ key, href, label }) => (
            <Link
              key={key}
              href={href}
              className={[
                "flex items-center gap-2 text-[15px] transition",
                active === key ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {renderIcon(key)}
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* چپ: تاریخ کوتاه (اگر محاسبه نشود، مخفی می‌ماند) */}
        <div className="text-slate-400 text-sm min-w-[7.5rem] text-left">
          {dateShort}
        </div>
      </div>
    </header>
  );
}

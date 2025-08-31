import { formatTodayJalaliShort } from "@/lib/date/jalai";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";
import BrandLogo from "../shared/‌BrandLogo";

type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

/** آیکن‌های یکدست */
function IconSearch({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUser({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBox({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 3l9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13V3" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

  const items =
    role === "wholesaler"
      ? ([
          { key: "search" as const,   href: `${base}`,   label: t.menu.search,      Icon: IconSearch },
          { key: "account" as const,  href: `${base}/account`,  label: t.menu.myAccount,   Icon: IconUser },
          { key: "products" as const, href: `${base}/products`, label: t.menu.myProducts,  Icon: IconBox },
        ])
      : ([
          { key: "search" as const,   href: `${base}/search`,   label: t.menu.search,    Icon: IconSearch },
          { key: "account" as const,  href: `${base}/account`,  label: t.menu.myAccount, Icon: IconUser },
        ]);

  let dateShort = "";
  try {
    dateShort = formatTodayJalaliShort();
  } catch {
    dateShort = "";
  }

  return (
    <header dir="rtl" className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl h-14 md:h-16 px-4 flex items-center justify-between">
        {/* راست: لوگو */}
        <BrandLogo variant="logo3" href={`${base}`} className="w-20 md:w-24 h-auto" title="Nerkhin" />

        {/* وسط: منو (فقط دسکتاپ) */}
        <nav className="hidden md:flex items-center gap-6">
          {items.map(({ key, href, label, Icon }) => {
            const isActive = active === key;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex items-center gap-2.5 text-[15px] transition",
                  "hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 rounded-lg px-1.5 py-1",
                  isActive ? "text-blue-600 font-semibold" : "text-slate-600",
                ].join(" ")}
              >
                <Icon className="w-[18px] h-[18px] md:w-5 md:h-5 -translate-y-[1px] shrink-0" />
                <span className="leading-none">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* چپ: تاریخ کوتاه */}
        <div className="text-slate-400 text-sm min-w-[7.5rem] text-left">
          {dateShort}
        </div>
      </div>
    </header>
  );
}

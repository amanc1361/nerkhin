import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";


type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

const Icon = {
  search:   () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
  account:  () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 3-8 6v1h16v-1c0-3-3-6-8-6Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
  products: () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
};


export default function BottomNav({
  t,
  role,
  active = "search",
}: {
  t: MarketMessages;
  role: Role;
  active?: Active;
}) {
  const base = `/${role}`;
  const items =
    role === "wholesaler"
      ? ([
          { key: "search" as const, href: `${base}/search`, label: t.menu.search },
          { key: "account" as const, href: `${base}/account`, label: t.menu.myAccount },
          { key: "products" as const, href: `${base}/products`, label: t.menu.myProducts },
        ])
      : ([
          { key: "search" as const, href: `${base}/search`, label: t.menu.search },
          { key: "account" as const, href: `${base}/account`, label: t.menu.myAccount },
        ]);

  return (
    <nav dir="rtl" className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[94%]">
      <div className="rounded-3xl px-3 py-2 bg-white/90 backdrop-blur border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        {/* ستون‌ها دقیقا برابر تعداد آیتم‌ها تا هیچ شِفْتی نباشه */}
        <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(({ key, href, label }) => {
            const isActive = active === key;
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
                  {/* آیکن placeholder – اگر آیکن سفارشی داری جایگزین کن */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                    <path d="M12 12" stroke="currentColor" />
                  </svg>
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

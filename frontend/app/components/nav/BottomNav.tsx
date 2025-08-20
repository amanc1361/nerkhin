import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";


type Role = "wholesaler" | "retailer";
type Active = "search" | "account" | "products";

const Icon = {
  search: () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
  account: () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-8 3-8 6v1h16v-1c0-3-3-6-8-6Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
  products: () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
};

export default function BottomNav({
  t, role, active = "search",
}: { t: MarketMessages; role: Role; active?: Active }) {
  const base = role === "wholesaler" ? "/wholesaler" : "/retailer";
  const items = [
    { key: "search",   href: `${base}/search`,   label: t.menu.search,   Icon: Icon.search },
    { key: "account",  href: `${base}/account`,  label: t.menu.myAccount, Icon: Icon.account },
    ...(role === "wholesaler" ? [{ key: "products", href: `${base}/products`, label: t.menu.myProducts, Icon: Icon.products }] : []),
  ] as const;

  return (
    <nav dir="rtl" className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%]">
      <div className="mx-auto rounded-3xl px-3 py-2 bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <ul className="grid grid-cols-3 gap-1">
          {items.map(({ key, href, label, Icon }) => {
            const isActive = active === key;
            return (
              <li key={key} className="flex justify-center">
                <Link
                  href={href}
                  className={[
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-xs transition",
                    isActive ? "text-slate-900 bg-slate-100 shadow-inner" : "text-slate-500 hover:text-slate-900"
                  ].join(" ")}
                >
                  <Icon />
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

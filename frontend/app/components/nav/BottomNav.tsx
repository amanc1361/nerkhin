import { MarketMessages } from "@/lib/server/texts/marketMessages";
import Link from "next/link";


export default function BottomNav({
  t,
  role,
  active = "search",
}: {
  t: MarketMessages;
  role: "wholesaler" | "retailer";
  active?: "search" | "account" | "products";
}) {
  const base = role === "wholesaler" ? "/wholesaler" : "/retailer";

  const items = [
    { key: "search", label: t.menu.search, href: `${base}/search` },
    { key: "account", label: t.menu.myAccount, href: `${base}/account` },
    ...(role === "wholesaler" ? [{ key: "products", label: t.menu.myProducts, href: `${base}/products` }] : []),
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-2 grid grid-cols-3 gap-2">
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className={`text-center text-sm py-2 rounded-xl ${
              active === it.key ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

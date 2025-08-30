"use client";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function IconSearch({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SearchBar({
  t,
  role,
  initialQuery = "",
  persistFilters = true, // ← اگر false کنی فقط q ست می‌شود
}: {
  t: MarketMessages;
  role: "wholesaler" | "retailer";
  initialQuery?: string;
  /** حفظ سایر فیلترهای URL هنگام جستجو (categoryId, brandId, ...) */
  persistFilters?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const base = role === "wholesaler" ? "/wholesaler/search" : "/retailer/search";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const q = ((new FormData(e.currentTarget).get("q") as string) || "").trim();

    // اگر بخوای پارامترهای فعلی (مثل categoryId, brandId...) حفظ بشن:
    const params = new URLSearchParams(persistFilters ? searchParams.toString() : "");

    if (q) params.set("q", q);
    else params.delete("q");

    const qs = params.toString();
    const href = qs ? `${base}?${qs}` : base;

    const onResultsPage = pathname?.startsWith(base);
    (onResultsPage ? router.replace : router.push)(href);
  };

  return (
    <form dir="rtl" onSubmit={onSubmit} className="w-full">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm">
          <input
            name="q"
            defaultValue={initialQuery}
            placeholder={t.searchCta}
            autoComplete="off"
            inputMode="search"
            className="w-full bg-transparent outline-none rounded-2xl py-3.5 md:py-4 pr-3 pl-12 text-right text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label={t.menu.search}
            className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          >
            <IconSearch className="w-5 h-5 -translate-y-[1px]" />
            <span className="sr-only">{t.menu.search}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

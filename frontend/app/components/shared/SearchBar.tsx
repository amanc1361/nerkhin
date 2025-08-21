"use client";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import { useRouter } from "next/navigation";


export default function SearchBar({ t, role, initialQuery = "" }: {
  t: MarketMessages; role: "wholesaler" | "retailer"; initialQuery?: string;
}) {
  const router = useRouter();
  const base = role === "wholesaler" ? "/wholesaler/search" : "/retailer/search";

  return (
    <form
      dir="rtl"
      onSubmit={(e) => {
        e.preventDefault();
        const q = (new FormData(e.currentTarget).get("q") as string)?.trim() ?? "";
        router.push(`${base}?q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl bg-white border border-slate-200 shadow-sm px-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
            </span>
            <input
              name="q"
              defaultValue={initialQuery}
              placeholder={t.searchCta}
              className="w-full bg-transparent outline-none rounded-2xl py-3.5 md:py-4 pr-3 pl-8 text-right text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl px-4 md:px-5 py-2.5 text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            {t.menu.search}
          </button>
        </div>
      </div>
    </form>
  );
}

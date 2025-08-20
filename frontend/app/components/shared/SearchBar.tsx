"use client";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import { useRouter } from "next/navigation";


export default function SearchBar({
  t, role, initialQuery = "",
}: { t: MarketMessages; role: "wholesaler" | "retailer"; initialQuery?: string }) {
  const router = useRouter();
  const base = role === "wholesaler" ? "/wholesaler/search" : "/retailer/search";

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const q = (new FormData(e.currentTarget).get("q") as string)?.trim() ?? "";
        router.push(`${base}?q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="mx-auto max-w-3xl px-4 -mt-3 md:-mt-4">
        <div className="relative group rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_10px_40px_rgba(0,0,0,0.07)] focus-within:shadow-[0_12px_50px_rgba(59,130,246,0.15)] transition">
          <input
            name="q"
            defaultValue={initialQuery}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent outline-none rounded-full py-3.5 md:py-4 pl-4 pr-12 text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label={t.menu.search}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            {t.menu.search}
          </button>
        </div>
      </div>
    </form>
  );
}

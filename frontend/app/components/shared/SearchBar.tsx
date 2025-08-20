"use client";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import { useRouter } from "next/navigation";


export default function SearchBar({
  t,
  role,
  initialQuery = "",
}: {
  t: MarketMessages;
  role: "wholesaler" | "retailer";
  initialQuery?: string;
}) {
  const router = useRouter();
  const base = role === "wholesaler" ? "/wholesaler/search" : "/retailer/search";

  return (
    <form
      dir="rtl"
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const q = (new FormData(e.currentTarget).get("q") as string)?.trim() ?? "";
        router.push(`${base}?q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        {/* گلس/پیل بدون همپوشانی: input + button در Grid */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-full bg-white/85 backdrop-blur-xl border border-slate-200/70 shadow-[0_10px_40px_rgba(0,0,0,0.07)] focus-within:shadow-[0_12px_50px_rgba(59,130,246,0.15)] transition px-2">
          <input
            name="q"
            defaultValue={initialQuery}
            // متن راهنما داخل همین تکست (با تایپ محو می‌شود)
            placeholder={t.searchCta}
            className="col-start-1 w-full bg-transparent outline-none rounded-full py-3.5 md:py-4 px-3 text-right text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label={t.menu.search}
            className="col-start-2 rounded-full px-4 md:px-5 py-2.5 text-sm bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition"
          >
            {t.menu.search}
          </button>
        </div>
      </div>
    </form>
  );
}

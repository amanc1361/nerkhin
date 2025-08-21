import { MarketMessages } from "@/lib/server/texts/marketMessages";
import BrandLogo from "../shared/‌BrandLogo";
import SearchBar from "../shared/SearchBar";


export default function SearchHero({
  t, role, initialQuery,
}: { t: MarketMessages; role: "wholesaler" | "retailer"; initialQuery?: string }) {
  return (
    <section dir="rtl" className="pt-4 md:pt-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-2">
          <BrandLogo variant="logo3" className="w-16 h-auto md:w-20" title="Nerkhin" />
          <div className="text-slate-700 text-sm md:text-base">{t.searchCta}</div>
        </div>
        <div className="mt-3 md:mt-4">
          <SearchBar t={t} role={role} initialQuery={initialQuery} />
        </div>
      </div>
    </section>
  );
}

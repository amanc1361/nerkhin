
import PageHeader from "@/app/components/layout/PageHeader";
import BottomNav from "@/app/components/nav/BottomNav";
import TopNav from "@/app/components/nav/TopNav";
import CategoryGrid from "@/app/components/shared/CategoryGrid";
import SearchBar from "@/app/components/shared/SearchBar";
import { SearchParamsPromise } from "@/app/types/searchparam";
import { getAllCategories } from "@/lib/server/server-api";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function WholesalerSearch({ searchParams }: { searchParams: SearchParamsPromise }) {
  const t = getMarketMessages("fa");
  const categories = await getAllCategories().catch(() => []);
  const sp = await searchParams; const raw = sp?.q; const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-slate-50">
      <TopNav t={t} role="wholesaler" active="search" />
      <PageHeader t={t} />
      <SearchBar t={t} role="wholesaler" initialQuery={q} />
      <CategoryGrid categories={categories} role="wholesaler" />
      <div className="h-24" />
      <BottomNav t={t} role="wholesaler" active="search" />
    </main>
  );
}

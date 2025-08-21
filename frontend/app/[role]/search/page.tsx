
import SearchHero from "@/app/components/layout/SearchHero";
import CategoryGrid from "@/app/components/shared/CategoryGrid";
import { SearchParamsPromise } from "@/app/types/searchparam";
import { getAllCategories } from "@/lib/server/server-api";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function SearchPage({
  params, searchParams,
}:{ params: { role: "wholesaler" | "retailer" }; searchParams: SearchParamsPromise }) {
  const t = getMarketMessages("fa");
  const categories = await getAllCategories().catch(() => []);
  const sp = await searchParams; const raw = sp?.q; const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <main className="bg-white">
      <SearchHero t={t} role={params.role} initialQuery={q} />
      <CategoryGrid categories={categories} linkFor={(c) => `/${params.role}/categories/${c.id}`} />
    </main>
  );
}


import { getAllCategories } from "@/lib/server/server-api";
import { SearchParamsPromise } from "../types/searchparam";
import SearchHero from "../components/layout/SearchHero";
import CategoryGrid from "../components/shared/CategoryGrid";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function RoleHome({
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

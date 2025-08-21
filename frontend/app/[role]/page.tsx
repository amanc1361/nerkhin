
import { getAllCategories } from "@/lib/server/server-api";
import { SearchParamsPromise } from "../types/searchparam";
import SearchHero from "../components/layout/SearchHero";
import CategoryGrid from "../components/shared/CategoryGrid";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function RoleHome({
  params,
  searchParams,
}: {
  params: Promise<{ role: "wholesaler" | "retailer" }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await params;
  const sp = await searchParams;
  const raw = sp?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  const t = getMarketMessages("fa");
  const categories = await getAllCategories().catch(() => []);

  return (
    <main className="bg-white">
      <SearchHero t={t} role={role} initialQuery={q} />
      <CategoryGrid
        categories={categories}
        linkFor={(c) => `/${role}/categories/${c.id}`}
      />
    </main>
  );
}
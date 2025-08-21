
import SearchHero from "@/app/components/layout/SearchHero";
import CategoryGrid from "@/app/components/shared/CategoryGrid";
import { SearchParamsPromise } from "@/app/types/searchparam";
import { getAllCategories } from "@/lib/server/server-api";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function SearchPage({
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


import { getAllCategories } from "@/lib/server/server-api";
import { SearchParamsPromise } from "../types/searchparam";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/nav/BottomNav";
import SearchClient from "../components/pages/search/SearchClient";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function RetailerPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const t = getMarketMessages("fa");
  const categories = await getAllCategories().catch(() => []);

  const sp = await searchParams;
  const raw = sp?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-gray-50">
      <PageHeader t={t} />
      <SearchClient t={t} role="retailer" initialCategories={categories} initialQuery={q} />
      <BottomNav t={t} role="retailer" active="search" />
    </main>
  );
}

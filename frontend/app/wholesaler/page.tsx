import { getAllCategories } from "@/lib/server/server-api";
import { SearchParamsPromise } from "../types/searchparam";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import PageHeader from "../components/layout/PageHeader";
import SearchClient from "../components/pages/search/SearchClient";
import BottomNav from "../components/nav/BottomNav";


export const revalidate = 0;

export default async function WholesalerPage({
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
      <SearchClient t={t} role="wholesaler" initialCategories={categories} initialQuery={q} />
      <BottomNav t={t} role="wholesaler" active="search" />
    </main>
  );
}

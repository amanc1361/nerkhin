import { getAllCategories } from "@/lib/server/server-api";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import PageHeader from "../components/layout/PageHeader";
import SearchClient from "../components/pages/search/SearchClient";
import BottomNav from "../components/nav/BottomNav";


export const revalidate = 0; // همیشه تازه (می‌تونی 60s هم بگذاری)

export default async function WholesalerSearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const t = getMarketMessages("fa");
  const categories = await getAllCategories().catch(() => []);
  const q = searchParams?.q ?? "";

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-gray-50">
      <PageHeader t={t} />
      <SearchClient t={t} role="wholesaler" initialCategories={categories} initialQuery={q} />
      <BottomNav t={t} role="wholesaler" active="search" />
    </main>
  );
}

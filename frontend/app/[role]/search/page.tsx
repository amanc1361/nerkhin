// app/[role]/search/page.tsx
import { getMarketMessages } from "@/lib/server/texts/marketMessages";

export const revalidate = 0;

type Role = "wholesaler" | "retailer";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: Role }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await params;
  const sp = await searchParams;
  const raw = sp?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  const t = getMarketMessages("fa");

  // صفحهٔ کلاینتی برای مصرف useMarketSearch
  return (
    <div className="bg-white">
   
      <SearchResultsClient role={role} initialQuery={q} t={t} />
    </div>
  );
}

// چون این فایل Server است، ایمپورت کلاینتی را پایین می‌آوریم تا Tree-shake شود
import SearchResultsClient from "@/app/components/market/SearchResultsClient";

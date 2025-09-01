import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import SearchResultsClient from "@/app/components/market/SearchResultsClient";

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
  let q = Array.isArray(raw) ? raw[0] : raw ?? "";


  const rawCat = sp?.categoryId ?? sp?.CategoryID;
  const categoryId = Number(Array.isArray(rawCat) ? rawCat[0] : rawCat);
  if (categoryId > 0) {
 
    q = q ? `${q} categoryId:${categoryId}` : `categoryId:${categoryId}`;
    console.log(q)
  }

  const t = getMarketMessages("fa");

  return (
    <div className="bg-white">
      <SearchResultsClient role={role} initialQuery={q} t={t} />
    </div>
  );
}

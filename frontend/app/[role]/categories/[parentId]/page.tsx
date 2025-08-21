import CategoryGrid from "@/app/components/shared/CategoryGrid";
import { getSubCategories } from "@/lib/server/server-api";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";


export const revalidate = 0;

export default async function SubCategoriesPage({ params }:{ params: { role: "wholesaler" | "retailer"; parentId: string } }) {
  const t = getMarketMessages("fa");
  const subs = await getSubCategories(params.parentId).catch(() => []);

  return (
    <main className="bg-white">
      <div dir="rtl" className="mx-auto max-w-6xl px-4 pt-4">
        <h1 className="text-slate-800 text-base md:text-lg mb-3">{t.subcategoriesTitle}</h1>
      </div>
      <CategoryGrid categories={subs} linkFor={(c) => `/${params.role}/brands?categoryId=${c.id}`} />
    </main>
  );
}

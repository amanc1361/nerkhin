// app/[role]/categories/[parentId]/page.tsx
import { getSubCategories } from "@/lib/server/server-api";
import type { Category } from "@/app/types/category/categoryManagement";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import CategoryGrid from "@/app/components/shared/CategoryGrid";

export const revalidate = 0;

// ✅ در Next.js 15، params باید Promise باشد
type Params = { role: "wholesaler" | "retailer"; parentId: string };

export default async function SubCategoriesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { role, parentId } = await params;
  const t = getMarketMessages("fa");

  const subs: Category[] = await getSubCategories(parentId).catch(() => []);

  return (
    <main className="bg-white">
      <div dir="rtl" className="mx-auto max-w-6xl px-4 pt-4">
        <h1 className="text-slate-800 text-base md:text-lg mb-3">
          {t.subcategoriesTitle}
        </h1>
      </div>

      <CategoryGrid
        categories={subs}
        linkFor={(c) => `/${role}/brands?categoryId=${c.id}`}
      />
    </main>
  );
}

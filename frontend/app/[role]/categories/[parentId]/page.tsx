import { getSubCategories } from "@/lib/server/server-api";
import type { Category } from "@/app/types/category/categoryManagement";
import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import CategoryGrid from "@/app/components/shared/CategoryGrid";
import Pagination from "@/app/components/shared/Pagination";

export const revalidate = 0;
const PAGE_SIZE = 12;

export default async function SubCategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: "wholesaler" | "retailer"; parentId: string }>;
  searchParams?: Promise<{ page?: string; from?: string }>;
}) {
  const { role, parentId } = await params;
  const sp = (await searchParams) || {};
  const currentPage = Math.max(1, Number(sp.page || 1));
  const from = sp.from === "add" ? "add" : undefined;

  const t = getMarketMessages("fa");
  const subsAll: Category[] = await getSubCategories(Number(parentId)).catch(() => []);

  const totalPages = Math.max(1, Math.ceil((subsAll?.length || 0) / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const subs = subsAll.slice(start, start + PAGE_SIZE);

  return (
    <main className="bg-white">
      <div dir="rtl" className="mx-auto max-w-6xl px-4 pt-4">
        <h1 className="text-slate-800 text-base md:text-lg mb-3">
          {t.subcategoriesTitle}
        </h1>

        <CategoryGrid
          categories={subs}
          linkFor={(c) => {
            // اگر از فلو «افزودن محصول» آمده‌ایم، همچنان به صفحهٔ ساخت محصول برو
            if (from === "add") {
              return `/${role}/products/create?subCategoryId=${c.id}`;
            }
            // ⬅️ تغییر اصلی: برو به صفحهٔ جستجو و categoryId را بده
            // (SearchPage شما باید از query param با نام `categoryId` بخواند)
            const base = role === "wholesaler" ? "/wholesaler/search" : "/retailer/search";
            return `${base}?categoryId=${c.id}&page=1`;
          }}
        />

        <div className="py-2">
          <Pagination currentPage={safePage} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}

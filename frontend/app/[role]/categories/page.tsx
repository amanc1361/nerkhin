import "server-only";
import type { Category } from "@/app/types/category/categoryManagement";
import { getAllCategories } from "@/lib/server/server-api";
import CategoryGrid from "@/app/components/shared/CategoryGrid";
import Pagination from "@/app/components/shared/Pagination";

type Role = "wholesaler" | "retailer";
export const revalidate = 0;

const PAGE_SIZE = 12;

export default async function CategoriesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: Role }>;
  searchParams?: Promise<{ page?: string; from?: string }>;
}) {
  const { role } = await params;
  const sp = (await searchParams) || {};
  const currentPage = Math.max(1, Number(sp.page || 1));
  const from = sp.from === "add" ? "add" : undefined;

  const roots: Category[] = await getAllCategories().catch(() => []);
  const totalPages = Math.max(1, Math.ceil((roots?.length || 0) / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = roots.slice(start, start + PAGE_SIZE);

  return (
    <main className="bg-white">
      <div dir="rtl" className="mx-auto max-w-6xl px-4 pt-4">
        {/* نمایش گرید شاخه‌های اصلی؛ لینک هر کارت → صفحهٔ زیرشاخه‌ها */}
        <CategoryGrid
          categories={pageItems}
          linkFor={(c) => {
            const qs = from ? `?from=add` : "";
            return `/${role}/categories/${c.id}${qs}`;
          }}
        />

        <div className="py-2">
          <Pagination currentPage={safePage} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}

// مسیر فعلی‌ات برای ساخت محصول (همون که الان داری):
// مثلا: app/panel/products/create/page.tsx
import { notFound } from "next/navigation";
import { getBrandDetails, getFiltersByCategory } from "lib/server/server-api";
import { ProductCreateClient } from "@/app/components/panel/products/ProductCreateClient";
import type { Brand } from "@/app/types/types";
import type { ProductFilterData } from "@/app/types/model/model";

export default async function ProductCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string; categoryId?: string }>;
}) {
  const { brandId, categoryId } = await searchParams;
  if (!brandId || !categoryId) notFound();

  const catId = Number(categoryId);

  const [brandRaw, filters] = await Promise.all([
    getBrandDetails(brandId),
    getFiltersByCategory(catId),
  ]);
  if (!brandRaw) notFound();

  const brand: Brand = { ...brandRaw, categoryId: catId };

  return <ProductCreateClient brand={brand} filters={filters as ProductFilterData[]} />;
}

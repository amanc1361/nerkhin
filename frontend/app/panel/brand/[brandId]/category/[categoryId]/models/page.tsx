// همون مسیری که قبلاً داشتی و کار می‌کرد (تغییر مسیر نده)
// مثلا: app/app/panel/brands/[brandId]/[categoryId]/page.tsx
import { notFound } from "next/navigation";
import { BrandPageClient } from "@/app/components/panel/brands/BrandPageClient";
import type { Brand } from "@/app/types/types";
import type { ProductFilterData } from "@/app/types/model/model";
import { getBrandDetails, getFiltersByCategory } from "lib/server/server-api";

interface RouteParams {
  brandId: string;
  categoryId: string;
}

export default async function BrandModelsPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { brandId, categoryId } = await params;
  if (!brandId || !categoryId) notFound();

  const catId = Number(categoryId);

  const [brandRaw, filters] = await Promise.all([
    getBrandDetails(brandId),
    getFiltersByCategory(catId),
  ]);
  if (!brandRaw) notFound();

  const brand: Brand = { ...brandRaw, categoryId: catId };

  return <BrandPageClient brand={brand} initialFilters={filters as ProductFilterData[]} />;
}

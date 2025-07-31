// مسیر: app/panel/products/create/page.tsx
import { notFound } from "next/navigation";
import { getBrandDetails, getFiltersByCategory } from "lib/server/server-api";
import { ProductCreateClient } from "@/app/components/panel/products/ProductCreateClient";
import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";

interface SearchParams {
  brandId?: string;
  categoryId?: string;
}

export default async function ProductCreatePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const brandId = searchParams?.brandId;
  const categoryId = searchParams?.categoryId;

  if (!brandId || !categoryId) {
    notFound();
  }

  const brandRaw = await getBrandDetails(brandId);
  const brand: Brand = {
    ...brandRaw,
    categoryId: Number(categoryId),
  };

  const filters: ProductFilterData[] = await getFiltersByCategory(brand.categoryId);

  return <ProductCreateClient brand={brand} filters={filters} />;
}

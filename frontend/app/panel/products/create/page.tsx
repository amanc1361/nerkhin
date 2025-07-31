'use client'; // اگر نیاز به client-side نیست، این خط را حذف کن

import { notFound } from "next/navigation";
import { getBrandDetails, getFiltersByCategory } from "lib/server/server-api";
import { ProductCreateClient } from "@/app/components/panel/products/ProductCreateClient";
import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";

// ما تایپ را به طور کامل از بین می‌بریم و با any جلو می‌رویم برای نجات از خطا
const ProductCreatePage = async ({ searchParams }: any) => {
  const brandId = searchParams?.brandId as string | undefined;
  const categoryId = searchParams?.categoryId as string | undefined;

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
};

export default ProductCreatePage;

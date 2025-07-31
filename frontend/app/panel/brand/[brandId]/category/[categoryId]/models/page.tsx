// مسیر: app/app/panel/brands/[brandId]/[categoryId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";

import { BrandPageClient } from "@/app/components/panel/brands/BrandPageClient";
import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";

import {
  getBrandDetails,
  getFiltersByCategory,
} from "lib/server/server-api";

/* تایپ دقیق پارامترهای مسیر */
interface RouteParams {
  brandId: string;
  categoryId: string;
}

export default async function BrandModelPage({
  params,
}: {
  params?: Promise<RouteParams>;
}) {
  const p: RouteParams | undefined =
    params && typeof (params as any).then === "function"
      ? await params
      : (params as unknown as RouteParams | undefined);

  if (!p?.brandId || !p?.categoryId) {
    notFound();
  }

  const { brandId, categoryId } = p;

  const brandRaw = await getBrandDetails(brandId);
  const brand: Brand = { ...brandRaw, categoryId: Number(categoryId) };

  const filters: ProductFilterData[] = await getFiltersByCategory(
    brand.categoryId
  );

  return (
    <BrandPageClient
      brand={brand}
      initialFilters={filters}
    />
  );
}

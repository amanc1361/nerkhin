// فایل: app/components/panel/brands/BrandPageClient.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";
import { ProductList } from "@/app/components/panel/products/ProductList";
import { modelPageMessages as messages } from "@/app/constants/modelmessage";

interface Props {
  brand: Brand;
  initialFilters: ProductFilterData[];
}

export const BrandPageClient: React.FC<Props> = ({ brand, initialFilters }) => {
  const router = useRouter();

  const handleAddProduct = () => {
    router.push(`/panel/products/create?brandId=${brand.id}&categoryId=${brand.categoryId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{messages.title(brand.title)}</h1>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          افزودن محصول جدید
        </button>
      </div>

      <ProductList
        brand={brand}
        filters={initialFilters}
        categoryId={brand.categoryId}
      />
    </div>
  );
};

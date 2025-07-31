// فایل: app/components/panel/brands/ProductCreator.tsx
"use client";

import React from "react";
import { Brand } from "@/app/types/types";
import { productMessages as msg } from "@/app/constants/productMessages";
import { useProductForm } from "@/app/hooks/useProductForm";
import { ProductFormBody } from "./ProductFormBody";
import { ProductFilterData } from "@/app/types/model/model";
import { ProductViewModel } from "@/app/types/product/product";

interface Props {
  brand: Brand;
  categoryId: number;
  filters?: ProductFilterData[];
  mode?: "create" | "edit";
  initialProduct?: ProductViewModel;
  onProductAdded: () => void;
}

export const ProductCreator: React.FC<Props> = ({
  brand,
  categoryId,
  filters,
  mode = "create",
  initialProduct,
  onProductAdded,
}) => {
  const hook = useProductForm({
    mode,
    brandId: brand.id,
    categoryId,
    initialProduct,
    presetFilters: filters,
    onSuccess: onProductAdded,
  });

  return (
    <div className="p-4 border rounded-md bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">
        {mode === "edit" ? msg.editProduct : msg.addProduct}
      </h3>

      <ProductFormBody
        {...hook}
        mode={mode}
      />
    </div>
  );
};

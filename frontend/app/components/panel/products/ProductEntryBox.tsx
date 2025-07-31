// فایل: app/components/panel/products/ProductEntryBox.tsx
"use client";

import React from "react";
import { Brand } from "@/app/types/types";
import { productMessages } from "@/app/constants/productMessages";
import { ProductCreator } from "@/app/components/panel/brands/ProductCreator";
import { useFiltersByCategory } from "@/app/hooks/useFilterByCategory";

interface ProductEntryBoxProps {
  brand: Brand;
  categoryId: number;
  onProductAdded: () => void;
}

export const ProductEntryBox: React.FC<ProductEntryBoxProps> = ({
  brand,
  categoryId,
  onProductAdded,
}) => {
  const { filters, loading, error } = useFiltersByCategory(categoryId);

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-gray-400">{productMessages.loadingFilters}</p>}
      {error && <p className="text-sm text-red-500">{productMessages.loadError}</p>}

      {!loading && !error && (
        <ProductCreator
          brand={brand}
          categoryId={categoryId}
          filters={filters}
          mode="create"
          onProductAdded={onProductAdded}
        />
      )}
    </div>
  );
};

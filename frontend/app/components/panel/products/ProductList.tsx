"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";
import { ProductEditModal } from "./ProductEditModal";
import { ProductViewModel } from "@/app/types/product/product";
import { useProductActions } from "@/app/hooks/useProductAction";
import { useProductsByBrand } from "@/app/hooks/useProductsBy‌Brand";
import { ProductTable } from "@/app/components/shared/ProductTable";

interface Props {
  brand: Brand;
  filters: ProductFilterData[];
  categoryId: number;
}

export const ProductList: React.FC<Props> = ({
  brand,
  filters,
  categoryId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { products, loading, error, refresh, totalPages, totalCount } =
    useProductsByBrand(brand.id, page);

  const { deleteProduct } = useProductActions(refresh);
  const [editing, setEditing] = useState<ProductViewModel | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <ProductTable
        products={products}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onEdit={(product) => setEditing(product)}
        onDelete={deleteProduct}
        onPageChange={handlePageChange}
        isLoading={loading}
        error={error}
      />

      {editing && (
        <ProductEditModal
          isOpen
          onClose={() => setEditing(null)}
          product={editing}
          brand={brand}
          filters={filters}
          categoryId={categoryId}
          onUpdated={refresh}
        />
      )}
    </>
  );
};

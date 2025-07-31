// فایل: app/components/panel/products/ProductEditModal.tsx
"use client";

import React from "react";
import ReusableModal from "@/app/components/shared/generalModal";
import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";
import { productMessages as msg } from "@/app/constants/productMessages";
import { ProductCreator } from "@/app/components/panel/brands/ProductCreator";
import { ProductViewModel } from "@/app/types/product/product";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: ProductViewModel;
  brand: Brand;
  filters: ProductFilterData[];
  categoryId: number;
  onUpdated: () => void;
}

export const ProductEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  product,
  brand,
  filters,
  categoryId,
  onUpdated,
}) => (
  <ReusableModal
    isOpen={isOpen}
    size="full"
    onClose={onClose}
    title={msg.editProduct}
  >
    <ProductCreator
      brand={brand}
      categoryId={categoryId}
      mode="edit"
      initialProduct={product}
      filters={filters}
      onProductAdded={() => {
        onUpdated();
        onClose();
      }}
    />
  </ReusableModal>
);

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { productMessages as msg } from "@/app/constants/productMessages";
import { Brand } from "@/app/types/types";
import { ProductFilterData } from "@/app/types/model/model";
import { ProductCreator } from "@/app/components/panel/brands/ProductCreator";

interface Props {
  brand: Brand;
  filters: ProductFilterData[];
}

export const ProductCreateClient: React.FC<Props> = ({ brand, filters }) => {
  const router = useRouter();

  const handleSuccess = () => {
    toast.info(msg.createRedirecting);

    setTimeout(() => {
      router.push(`/panel/brand/${brand.id}/category/${brand.categoryId}/models`);
    }, 1200);
  };

  const handleError = () => {
    toast.error(msg.createError);
  };

  return (
    <div className=" mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{msg.createPageTitle}</h1>
      <ProductCreator
        brand={brand}
        categoryId={brand.categoryId}
        filters={filters}
        mode="create"
        onProductAdded={handleSuccess}
      />
    </div>
  );
};

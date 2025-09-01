"use client";
import { useState } from "react";
import ProductSpecsResponsive from "./ProductSpecsResponsive";
import ProductActionBar from "@/app/components/market/ProductActionBar";
import { ProductViewModel } from "@/app/types/product/product";


export default function ProductSpecsController({
  t,
  product,
}: {
  t: { specs: string; compare: string; favorite: string };
  product: ProductViewModel;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ProductActionBar t={t} onSpecs={() => setOpen(true)} />
      <ProductSpecsResponsive product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

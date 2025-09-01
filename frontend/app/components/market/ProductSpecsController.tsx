"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProductSpecsResponsive from "./ProductSpecsResponsive";
import ProductActionBar from "@/app/components/market/ProductActionBar";

import ComparePicker from "./ComparePicker";
import { ProductViewModel } from "@/app/types/product/product";

export default function ProductSpecsController({
  t,
  product,
}: {
  t: { specs: string; compare: string; favorite: string };
  product: ProductViewModel;
}) {
  const [openSpecs, setOpenSpecs] = useState(false);
  const [openCompare, setOpenCompare] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const role = pathname?.split("/")?.[1] || "wholesaler";
  const brandId =
    (product as any).brandId ?? (product as any).brandID ?? (product as any).brand_id;

  return (
    <>
      <ProductActionBar
        t={t}
        onSpecs={() => setOpenSpecs((v) => !v)}
        onCompare={() => setOpenCompare(true)}
        onLike={() => {}}
      />

      {/* مشخصات: موبایل=مودال، دسکتاپ=ثابت زیر گالری */}
      <ProductSpecsResponsive product={product} open={openSpecs} onClose={() => setOpenSpecs(false)} />

      {/* انتخاب محصول برای مقایسه: بر اساس brandId و برای همهٔ عمده‌فروشان */}
      {brandId ? (
        <ComparePicker
          open={openCompare}
          onClose={() => setOpenCompare(false)}
          brandId={Number(brandId)}
          currentProductId={Number((product as any).id)}
          onPick={(otherId) => {
            setOpenCompare(false);
            router.push(`/${role}/compare?base=${(product as any).id}&target=${otherId}`);
          }}
        />
      ) : null}
    </>
  );
}

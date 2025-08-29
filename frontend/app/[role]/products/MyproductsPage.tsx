"use client";

import { useEffect, useMemo, useState } from "react";

import type { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";

import ProductsToolbar from "@/app/components/userproduct/ProductsToolbar";
import ProductsHeader from "@/app/components/userproduct/ProductsHeader";
import ProductsList from "@/app/components/userproduct/ProductsList";
import DollarPriceModal from "@/app/components/userproduct/DollarPriceModal";
import { useDollarPriceAction } from "@/app/hooks/useDollarPriceAction";

type Role = "wholesaler" | "retailer";

type Props = {
  role: Role;
  initialItems: any[];           // UserProductVM[]
  usdPrice: string | number;
  locale: string;
};

export default function MyproductsPage({
  role,
  initialItems,
  usdPrice,
  locale,
}: Props) {
  const messages: UserProductMessages = useMemo(
    () =>
      (typeof getUserProductMessages === "function"
        ? getUserProductMessages("fa")
        : ({} as any)),
    [locale]
  );

  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  useEffect(() => { setLocalUsd(String(usdPrice ?? "")); }, [usdPrice]);

  const addHref = `/${role}/products/create`;

  // مودال قیمت دلار
  const [openUsdModal, setOpenUsdModal] = useState(false);
  const { update, isSubmitting } = useDollarPriceAction((digits) => {
    setLocalUsd(digits);
    setOpenUsdModal(false);
  });
  const handleUsdSubmit = (digits: string) => update(digits);

  // اکشن‌های دیگر
  const onShareJpg = () => {};
  const onSharePdf = () => {};
  const onShare    = () => {};
  const onEdit = (_id: number) => {};
  const onDelete = (_id: number) => {};
  const onToggleVisible = (_id: number) => {};

  return (
    <div dir="rtl" className="container mx-auto px-3 py-4 lg:py-6 text-right">
      <div className="lg:flex lg:gap-6">
        {/* سایدبار راست */}
        <aside className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-20">
          <div className="rounded-2xl border bg-white p-3 space-y-4 shadow-sm text-right">
            <ProductsToolbar
              usdPrice={localUsd}
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}  // ← از همینجا باز می‌شود
            />
          </div>
        </aside>

        {/* ستون چپ: هدر و لیست محصولات */}
        <main className="flex-1">
          {/* موبایل: تولبار بالا */}
          <div className="lg:hidden mb-4">
            <ProductsToolbar
              usdPrice={localUsd}
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}  // ← موبایل هم همین
            />
          </div>

          <ProductsHeader
            count={initialItems?.length ?? 0}
            messages={messages}
          />

          <ProductsList
            items={initialItems ?? []}
            messages={messages}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleVisible={onToggleVisible}
          />
        </main>
      </div>

      {/* مودال قیمت دلار */}
      <DollarPriceModal
        open={openUsdModal}
        initialValue={localUsd}
        onClose={() => setOpenUsdModal(false)}
        onSubmit={handleUsdSubmit}
        loading={isSubmitting}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";


import type { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
// اگر پروژه‌ات هلسپر دیگری دارد، همین را با همان جایگزین کن
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import ProductsToolbar from "@/app/components/userproduct/ProductsToolbar";
import ProductsHeader from "@/app/components/userproduct/ProductsHeader";
import ProductsList from "@/app/components/userproduct/ProductsList";

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
  // پیام‌ها از سیستم خودت
  const messages: UserProductMessages = useMemo(
    () => (typeof getUserProductMessages === "function"
      ? getUserProductMessages("fa")
      : ({} as any)),
    [locale]
  );

  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  useEffect(() => { setLocalUsd(String(usdPrice ?? "")); }, [usdPrice]);

  // مسیر افزودن محصول (اگر جای دیگری محاسبه می‌کنی، همین را عوض کن)
  const addHref = `/${role}/products/create`;

  // این‌ها را به اکشن‌های واقعی وصل کن
  const onShareJpg = () => {};
  const onSharePdf = () => {};
  const onShare    = () => {};
  const onUsdSave  = () => {};
  const onEdit = (_id: number) => {};
  const onDelete = (_id: number) => {};
  const onToggleVisible = (_id: number) => {};

  return (
    <div dir="rtl" className="container mx-auto px-3 py-4 lg:py-6 text-right">
      {/* فقط lg:flex — بدون row-reverse تا آیتم اول (سایدبار) در RTL سمت راست بایستد */}
      <div className="lg:flex lg:gap-6">
        {/* ستون راست: سایدبار ابزارها (آیتم اول = سمت راست در RTL) */}
        <aside className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-20">
          <div className="rounded-2xl border bg-white p-3 space-y-4 shadow-sm text-right">
            {/* دانلودها + اشتراک (همان کامپوننت خودت) */}
            <ProductsToolbar
              usdPrice={localUsd}
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
            />

            {/* ورودی قیمت دلار + ذخیره */}
            {/* <div className="rounded-xl border p-3 space-y-2 text-right">
              <label className="block text-xs text-neutral-500">
                {messages.toolbar.dollarPrice("")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  className="flex-1 rounded-lg border px-3 py-2 text-sm text-right placeholder:text-right"
                  value={localUsd}
                  onChange={(e) => setLocalUsd(e.target.value)}
                />
                <button
                  onClick={onUsdSave}
                  className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm"
                >
                  {messages.toolbar.save ?? "ذخیره"}
                </button>
              </div>
            </div>


            <Link
              href={addHref}
              className="block w-full rounded-lg bg-neutral-100 text-center py-2.5 text-sm text-neutral-700"
            >
              {messages.toolbar.addProduct}
            </Link> */}
          </div>
        </aside>

        {/* ستون چپ: هدر و لیست محصولات */}
        <main className="flex-1">
          {/* موبایل: نوار ابزار بالای لیست */}
          <div className="lg:hidden mb-4">
            <ProductsToolbar
              usdPrice={usdPrice}
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
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
    </div>
  );
}

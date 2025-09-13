"use client";

import { ProductViewModel } from "@/app/types/product/product";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Back from "../icon-components/Back";
import { SpecPairs, useSpecPairs } from "./spaces";

type Messages = {
  specs: string;
  back: string;
};

function mainImage(p: ProductViewModel): string | null {
  // اگر defaultImageUrl یا تصویر اول موجود بود از همان استفاده کن
  const url =
    (p as any)?.defaultImageUrl ||
    (p as any)?.imageUrl ||
    (Array.isArray((p as any)?.images) && (p as any).images.length ? (p as any).images[0]?.url : null);

  if (typeof url === "string" && url.trim()) return url;

  // در غیر این‌صورت از الگوی uploads استفاده کن
  if (p?.id) return `https://nerrkhin.com/uploads/${p.id}/1.webp`;
  return null;
}

export default function ProductCompareTable({
  left,
  right,
  messages,
  onRemoveLeft,
  onRemoveRight,
}: {
  left: ProductViewModel;
  right: ProductViewModel;
  messages?: Partial<Messages>;
  onRemoveLeft?: () => void;
  onRemoveRight?: () => void;
}) {
  const t: Messages = { specs: "مشخصات:", back: "بازگشت", ...messages };
  const router = useRouter();

  const leftPairs = useSpecPairs(left as any);
  const rightPairs = useSpecPairs(right as any);

  // برای هم‌ترازی، کلیدهای مشترک را پیدا کنیم (اختیاری)
  const allTitles = useMemo(() => {
    const s = new Set<string>();
    leftPairs.forEach((p) => s.add(p.title));
    rightPairs.forEach((p) => s.add(p.title));
    return Array.from(s);
  }, [leftPairs, rightPairs]);

  const toRecord = (pairs: { title: string; values: string[] }[]) =>
    Object.fromEntries(pairs.map((p) => [p.title, p.values]));

  const Lrec = useMemo(() => toRecord(leftPairs), [leftPairs]);
  const Rrec = useMemo(() => toRecord(rightPairs), [rightPairs]);

  const renderCard = (p: ProductViewModel, rec: Record<string, string[]>, onRemove?: () => void) => {
    const img = mainImage(p);

    return (
      <div className="relative rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 overflow-hidden">
        {/* دکمه حذف اختیاری */}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 left-2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 shadow hover:bg-white"
            aria-label="remove"
            title="حذف"
          >
            ×
          </button>
        ) : null}

        {/* تصویر */}
        <div className="p-4">
          {img ? (
            <Image
              src={img}
              alt={p?.modelName || ""}
              width={300}
              height={300}
              className="w-full aspect-square object-contain rounded-lg bg-gray-50"
            />
          ) : (
            <div className="w-full aspect-square rounded-lg bg-gray-100" />
          )}
        </div>

        {/* عنوان */}
        <div className="px-4 pb-3 text-right">
          <div className="text-base font-bold leading-6 text-gray-900 whitespace-pre-line break-words line-clamp-2">
            {`${p?.brandTitle ?? ""} ${p?.modelName ?? ""}`.trim()}
          </div>
        </div>

        {/* مشخصات: با چیپ و بدون خطوط اضافه */}
        <div className="px-4 pb-4 text-right">
          <div className="text-gray-500 text-sm mb-2">{t.specs}</div>

          {/* اگر می‌خواهی فقط کلیدهای مشترک نمایش داده شود، از allTitles استفاده کن: */}
          {/* <SpecPairs pairs={allTitles.map(title => ({ title, values: rec[title] ?? [] }))} /> */}

          {/* در غیر این صورت همان زوج‌ها را نمایش بده: */}
          <SpecPairs pairs={Object.entries(rec).map(([title, values]) => ({ title, values }))} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Back button */}
      <div className="mb-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 flex py-2 rounded-lg bg-white text-sm text-gray-700 shadow-sm ring-1 ring-black/5 hover:bg-gray-50"
          >
            {t.back}
          </button>
        </div>
      </div>

      {/* مقایسه دو محصول */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        {renderCard(left, Lrec, onRemoveLeft)}
        {renderCard(right, Rrec, onRemoveRight)}
      </div>
    </div>
  );
}

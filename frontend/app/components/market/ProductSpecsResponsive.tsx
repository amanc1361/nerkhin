"use client";

import { useEffect, useMemo } from "react";
import { ProductViewModel } from "@/app/types/product/product";
import Portal from "../shared/portal";
import { SpecPairs, useSpecPairs } from "./spaces";

export default function ProductSpecsResponsive({
  product,
  open,
  onClose,
  title = "مشخصات",
}: {
  product: ProductViewModel;
  open: boolean; // موبایل: کنترل مودال
  onClose: () => void;
  title?: string;
}) {
  // زوج‌های مشخصات از سورس محصول (با پوشش Filter/Option بزرگ/کوچک + name/title/displayName)
  const pairs = useSpecPairs(product as any);

  // استخراج تگ‌ها (پشتیبانی از چند نام و ساختار مختلف)
  const tagTitles = useMemo(() => {
    const raw = (product as any)?.tags ?? (product as any)?.productTags ?? [];
    const list = Array.isArray(raw) ? raw : [];
    const titles = list
      .map((t: any) => (typeof t === "string" ? t : t?.tag))
      .filter(Boolean) as string[];
    // حذف موارد تکراری
    return Array.from(new Set(titles));
  }, [product]);
  

  // ESC برای بستن
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // قفل اسکرول هنگام باز بودن شیت موبایل
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // رندر چیپ‌های تگ‌ها (بدون تغییر در بقیه ساختار)
  const TagsChips = () =>
    tagTitles.length ? (
      <div className="mt-3">
  
        <div className="flex flex-wrap gap-2">
          {tagTitles.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="inline-block rounded-full bg-white px-2.5 py-1 text-xs text-gray-700 ring-1 ring-black/10"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* دسکتاپ: همیشه زیر گالری */}
      <div className="hidden md:block mt-4" dir="rtl">
        <h2 className="text-base font-semibold mb-2 text-right">{title}</h2>

        {/* قاب سبک بدون خطوط اضافی + چیپ‌ها */}
        <div className="rounded-2xl bg-white/60 p-3 shadow-sm ring-1 ring-black/5 text-right">
          {/* توضیحات (اختیاری) */}
          {product?.description ? (
            <div className="mb-3 text-sm leading-7 text-gray-700 whitespace-pre-line break-words">
              {product.description}
            </div>
          ) : null}

          {/* مشخصات (chips) */}
          <SpecPairs pairs={pairs} variant="chips" />

          {/* تگ‌ها */}
          <TagsChips />
        </div>
      </div>

      {/* موبایل: شیت داخل پرتال با z-index بالا */}
      <Portal>
        <div className="md:hidden" dir="rtl">
          <div
            className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={onClose}
          />
          <div
            className={`fixed inset-x-0 bottom-0 z-[9999] transform transition-transform duration-300 ${
              open ? "translate-y-0" : "translate-y-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!open}
          >
            <div
              className="mx-auto max-w-md rounded-t-2xl bg-white p-3 shadow-2xl"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
            >
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-200" />
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">{title}</h2>
                <button onClick={onClose} className="p-2" aria-label="close">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* توضیحات + مشخصات در شیت موبایل */}
              <div className="max-h-[70vh] overflow-y-auto pb-1 text-right">
                {product?.description ? (
                  <div className="mb-3 text-sm leading-7 text-gray-700 whitespace-pre-line break-words">
                    {product.description}
                  </div>
                ) : null}

                <SpecPairs pairs={pairs} variant="chips" />

                {/* تگ‌ها در موبایل */}
                <TagsChips />
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>
  );
}

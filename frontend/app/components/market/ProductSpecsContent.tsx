"use client";
import { ProductViewModel } from "@/app/types/product/product";
import React, { useMemo } from "react";


function groupFilters(p: any): Array<{ title: string; values: string[] }> {
  const map = new Map<string, string[]>();

  // حالت ۱: آرایهٔ filterRelations [{filterTitle, optionTitle}, ...]
  if (Array.isArray(p?.filterRelations)) {
    for (const r of p.filterRelations) {
      const key = r?.filterTitle || r?.filter?.title || "—";
      const val = r?.optionTitle || r?.option?.title || r?.value || "";
      if (!val) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(val);
    }
  }

  // حالت ۲: آرایهٔ filters [{title, options:[{title, selected?}]}]
  if (Array.isArray(p?.filters)) {
    for (const f of p.filters) {
      const key = f?.title || "—";
      const opts: string[] =
        (Array.isArray(f?.options)
          ? f.options
              .filter((o: any) => o?.selected ?? true)
              .map((o: any) => o?.title)
              .filter(Boolean)
          : []) || [];
      if (opts.length) {
        if (!map.has(key)) map.set(key, []);
        map.set(key, [...(map.get(key) || []), ...opts]);
      }
    }
  }

  return Array.from(map.entries()).map(([title, values]) => ({
    title,
    values: Array.from(new Set(values)),
  }));
}

export default function ProductSpecsContent({ product }: { product: ProductViewModel }) {
  const pairs = useMemo(() => groupFilters(product), [product]);
  return (
    <div dir="rtl" className="text-right">
      {/* توضیحات */}
      {product?.description ? (
        <div className="mb-3 text-sm leading-7 text-gray-700">{product.description}</div>
      ) : null}

      {/* جدول فیلترها/گزینه‌ها */}
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        {pairs.length ? (
          pairs.map(({ title, values }) => (
            <div key={title} className="flex items-start gap-3 py-2 px-3">
              <div className="min-w-28 text-xs text-gray-500">{title}</div>
              <div className="flex-1 text-sm text-gray-800">{values.join("، ") || "—"}</div>
            </div>
          ))
        ) : (
          <div className="py-3 px-3 text-sm text-gray-500">مشخصاتی ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
}

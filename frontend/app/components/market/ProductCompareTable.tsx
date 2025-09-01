"use client";

import { ProductViewModel } from "@/app/types/product/product";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Back from "../icon-components/Back";

/** فقط فیلترها/گزینه‌ها را تجمیع می‌کند */
function groupFilters(p: any) {
  const m = new Map<string, string[]>();

  if (Array.isArray(p?.filterRelations)) {
    for (const r of p.filterRelations) {
      const key = r?.filterTitle || r?.filter?.title || "—";
      const val = r?.optionTitle || r?.option?.title || r?.value || "";
      if (!val) continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(val);
    }
  }
  if (Array.isArray(p?.filters)) {
    for (const f of p.filters) {
      const key = f?.title || "—";
      const opts = (Array.isArray(f?.options) ? f.options : [])
        .filter((o: any) => (o?.selected ?? true))
        .map((o: any) => o?.title)
        .filter(Boolean);
      if (opts.length) {
        if (!m.has(key)) m.set(key, []);
        m.set(key, [...(m.get(key) || []), ...opts]);
      }
    }
  }

  const obj: Record<string, string> = {};
  for (const [k, arr] of m.entries()) obj[k] = Array.from(new Set(arr)).join("، ");
  return obj;
}

/** عکس اصلی (اختیاری) */
function mainImage(p: any): string | null {
  const url =
    p?.defaultImageUrl ||
    p?.imageUrl ||
    (Array.isArray(p?.images) && p.images.length ? p.images[0]?.url : null);
  return typeof url === "string" && url.trim() ? url : null;
}

type Messages = {
  specs: string;
  back: string;
};

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

  const L = useMemo(() => groupFilters(left), [left]);
  const R = useMemo(() => groupFilters(right), [right]);

  const renderCard = (
    p: ProductViewModel,
    grouped: Record<string, string>,
    onRemove?: () => void
  ) => {
    const img = mainImage(p);

    return (
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* دکمه × */}
      

        {/* تصویر */}
        <div className="p-4">
                 
            <Image
              src={"https://nerkhin.com/uploads/"+p.id+"/1.webp"}
              alt={p?.modelName || ""}
              width={300}
              height={300}
              className="w-full aspect-square object-contain rounded-lg bg-gray-50"
            />
       
        </div>

        {/* عنوان + توضیحات */}
        <div className="px-4 pb-3 h-16 text-right">
          <div className="text-base font-bold leading-6 text-gray-900 whitespace-pre-line break-words">
            {`${p?.brandTitle ?? ""} ${p?.modelName ?? ""}`.trim()}
          </div>
      
        </div>

        {/* خط جداکننده */}
        <div className="h-px bg-gray-200" />

        {/* مشخصات */}
        <div className="px-4 py-3 text-right">
          <div className="text-gray-500 text-sm mb-2">{t.specs}</div>
          <div className="space-y-2">
            {Object.entries(grouped).map(([k, v]) => (
              <div key={k} className="text-sm text-gray-900">
                <span className="text-gray-600">{k}:</span>{" "}
                <span className="font-medium whitespace-pre-line break-words">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full ">
      {/* Back button */}
      <div className="mb-4 ">
        <div className="flex justify-end">

    
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 flex py-2  rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-100"
          >
           {t.back}
        </button>
            </div>
      </div>

      {/* مقایسه دو محصول */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        {renderCard(left, L, onRemoveLeft)}
        {renderCard(right, R, onRemoveRight)}
      </div>
    </div>
  );
}

"use client";
import { ProductViewModel } from "@/app/types/product/product";
import { useEffect, useMemo } from "react";
import Portal from "../shared/portal";


/** گروه‌بندی فیلترها و گزینه‌ها از ساختارهای مختلف */
function groupFilters(p: any): Array<{ title: string; values: string[] }> {
  const map = new Map<string, string[]>();

  if (Array.isArray(p?.filterRelations)) {
    for (const r of p.filterRelations) {
      const key = r?.filterTitle || r?.filter?.title || "—";
      const val = r?.optionTitle || r?.option?.title || r?.value || "";
      if (!val) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(val);
    }
  }

  if (Array.isArray(p?.filters)) {
    for (const f of p.filters) {
      const key = f?.title || "—";
      const opts: string[] = (Array.isArray(f?.options)
        ? f.options
            .filter((o: any) => o?.selected ?? true)
            .map((o: any) => o?.title)
            .filter(Boolean)
        : []) as string[];
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

function SpecsContent({ product }: { product: ProductViewModel }) {
  const pairs = useMemo(() => groupFilters(product), [product]);

  return (
    <div dir="rtl" className="text-right">
      {product?.description ? (
        <div className="mb-3 text-sm leading-7 text-gray-700 whitespace-pre-line break-words">
          {product.description}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        {pairs.length ? (
          pairs.map(({ title, values }) => (
            <div key={title} className="flex items-start gap-3 py-2 px-3">
              <div className="min-w-28 text-xs text-gray-500">{title}</div>
              <div className="flex-1 text-sm text-gray-800 break-words">
                {values.join("، ") || "—"}
              </div>
            </div>
          ))
        ) : (
          <div className="py-3 px-3 text-sm text-gray-500">مشخصاتی ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
}

export default function ProductSpecsResponsive({
  product,
  open,
  onClose,
  title = "مشخصات",
}: {
  product: ProductViewModel;
  open: boolean;     // موبایل: کنترل مودال
  onClose: () => void;
  title?: string;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* دسکتاپ: همیشه زیر گالری */}
      <div className="hidden md:block mt-4">
        <h2 className="text-base font-semibold mb-2">{title}</h2>
        <SpecsContent product={product} />
      </div>

      {/* موبایل: شیت داخل پرتال با z-index بالا */}
      <Portal>
        <div className="md:hidden">
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
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pb-1">
                <SpecsContent product={product} />
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>
  );
}

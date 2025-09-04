"use client";

import { ProductViewModel } from "@/app/types/product/product";
import { useEffect, useMemo } from "react";
import Portal from "../shared/portal";

/** ---------- انواع داده‌ی منعطف برای مشخصات ---------- */
type FilterRelationVM = {
  // نام‌ها به شکل‌های مختلف می‌آیند:
  filterTitle?: string | null;
  optionTitle?: string | null;

  filterName?: string | null;
  optionName?: string | null;
  filterOptionName?: string | null;

  value?: string | number | null;

  // حروف کوچک
  filter?: { title?: string | null; name?: string | null; displayName?: string | null } | null;
  option?: { title?: string | null; name?: string | null; displayName?: string | null } | null;

  // حروف بزرگ (مطابق لاگ شما)
  Filter?: { title?: string | null; name?: string | null; displayName?: string | null } | null;
  Option?: { title?: string | null; name?: string | null; displayName?: string | null } | null;
};

type FilterOptionVM = {
  id?: number;
  title?: string | null;
  name?: string | null;
  displayName?: string | null;
  selected?: boolean | number | null;
  isSelected?: boolean | number | null;
  checked?: boolean | number | null;
  value?: string | number | null;
  filterId?: number | null;
};

type FilterVM = {
  title?: string | null;
  name?: string | null;
  displayName?: string | null;
  options?: FilterOptionVM[] | null;
};

type ProductSpecsSource = {
  description?: string | null;
  filterRelations?: FilterRelationVM[] | null;
  filters?: FilterVM[] | null;
};

/** ---------- کمک‌تابع‌ها ---------- */
function pickFirstText(...candidates: Array<string | number | null | undefined>): string {
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    const s = typeof c === "number" ? String(c) : String(c ?? "");
    if (s.trim().length) return s.trim();
  }
  return "";
}

function normTitle(s?: string | null, fallback = "—"): string {
  const t = (s ?? "").toString().trim();
  return t.length ? t : fallback;
}

function truthyish(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.trim().length > 0 && v !== "0" && v.toLowerCase() !== "false";
  return false;
}

function optionIsSelected(o: FilterOptionVM): boolean {
  return Boolean(
    truthyish(o.selected) || truthyish(o.isSelected) || truthyish(o.checked) || truthyish(o.value)
  );
}

/** ---------- گروه‌بندی مشخصات از منابع مختلف ---------- */
function groupFilters(p: ProductSpecsSource): Array<{ title: string; values: string[] }> {
  const map = new Map<string, string[]>();

  // 1) منبع اصلی: روابط فیلترها
  if (Array.isArray(p?.filterRelations) && p.filterRelations!.length) {
    for (const r of p.filterRelations!) {
      // عنوان فیلتر
      const key = normTitle(
        pickFirstText(
          r?.filterTitle,
          r?.filterName,
          r?.Filter?.displayName,
          r?.Filter?.name,
          r?.Filter?.title,
          r?.filter?.displayName,
          r?.filter?.name,
          r?.filter?.title
        )
      );

      // مقدار/گزینه انتخاب‌شده
      const val = pickFirstText(
        r?.optionTitle,
        r?.optionName,
        r?.filterOptionName, // مطابق لاگ شما
        r?.Option?.displayName,
        r?.Option?.name,
        r?.Option?.title,
        r?.option?.displayName,
        r?.option?.name,
        r?.option?.title,
        r?.value
      );

      const clean = normTitle(val, "");
      if (!clean) continue;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(clean);
    }
  }

  // 2) fallback: filters → options (اگر روابط ناقص/خالی باشد)
  if (Array.isArray(p?.filters) && p.filters!.length) {
    for (const f of p.filters!) {
      const key = normTitle(pickFirstText(f?.title, f?.displayName, f?.name));
      const opts: string[] = Array.isArray(f?.options)
        ? f.options!
            .filter((o) => optionIsSelected(o))
            .map((o) => pickFirstText(o?.title, o?.displayName, o?.name, o?.value))
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      if (opts.length) {
        if (!map.has(key)) map.set(key, []);
        map.set(key, [...(map.get(key) || []), ...opts]);
      }
    }
  }

  // خروجی یکتا و مرتب
  return Array.from(map.entries()).map(([title, values]) => ({
    title,
    values: Array.from(new Set(values)),
  }));
}

/** ---------- محتوای مشخصات ---------- */
function SpecsContent({ product }: { product: ProductViewModel }) {
  // لاگ برای عیب‌یابی
  useEffect(() => {
    console.debug("[ProductSpecs] filterRelations:", (product as any)?.filterRelations);
    console.debug("[ProductSpecs] filters:", (product as any)?.filters);
  }, [product]);

  const pairs = useMemo(
    () => groupFilters(product as unknown as ProductSpecsSource),
    [product]
  );

  // در صورت نیاز این لاگ را بردار
  useEffect(() => {
    console.debug("[ProductSpecs] pairs:", pairs);
  }, [pairs]);

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

/** ---------- ریسپانسیو (دسکتاپ + موبایل) ---------- */
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
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
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

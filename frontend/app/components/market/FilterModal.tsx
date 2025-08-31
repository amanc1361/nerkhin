// app/components/market/FiltersModal.tsx
"use client";

import { useBrandsByCategory } from "@/app/hooks/useBrandCategory";
import { useEffect, useMemo, useState } from "react";
// مسیر ایمپورت را مطابق پروژه خودت تنظیم کن:


type Option = { value: number; label: string };

export type FiltersValue = {
  categoryId?: number;
  brandIds?: number[];      // خروجی همچنان آرایه است
  cityId?: number;
  isDollar?: boolean | null;
  priceMin?: number;
  priceMax?: number;
};

export default function FiltersModal({
  open,
  onClose,
  onClear,
  onApply,
  initial,
  // 🔹 ورودی جدید:
  categoryId,
  cities = [],
  dir = "rtl",
  title = "فیلترها",
}: {
  open: boolean;
  onClose: () => void;
  onClear?: () => void;
  onApply: (val: FiltersValue) => void;
  initial?: FiltersValue;
  categoryId: number;             // ⬅️ مهم
  cities?: Option[];
  dir?: "rtl" | "ltr";
  title?: string;
}) {
  const [val, setVal] = useState<FiltersValue>(initial ?? {});
  useEffect(() => {
    if (open) setVal(initial ?? {});
  }, [open, initial]);

  // قفل اسکرول پس‌زمینه هنگام باز بودن
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  // 🔹 واکشی برندها بر اساس categoryId (یا subCategoryId)
  const { items: brands = [], loading: brandsLoading } = useBrandsByCategory(categoryId);
  const brandOptions: Option[] = useMemo(
    () => brands.map((b: any) => ({ value: Number(b.id), label: String(b.title ?? b.name ?? b.model ?? b.id) })),
    [brands]
  );

  // اگر دسته عوض شد، انتخاب برندهای قبلی معنی ندارد → پاک‌شان کن
  useEffect(() => {
    setVal((p) => ({ ...p, categoryId, brandIds: [] }));
  }, [categoryId]);

  const isOpen = open ? "pointer-events-auto" : "pointer-events-none";
  const backdrop = open ? "opacity-100" : "opacity-0";
  const panelMobile = open ? "translate-y-0" : "translate-y-full";
  const panelDesktop = open ? "translate-x-0" : "translate-x-full";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${isOpen} ${backdrop}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet (mobile) */}
      <section
        dir={dir}
        className={`
          fixed z-50 bg-white shadow-xl
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl p-4
          transform transition-transform duration-300 md:hidden
          ${panelMobile}
        `}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <Header title={title} onClose={onClose} />
        <FormBody
          val={val} setVal={setVal}
          brandOptions={brandOptions}
          brandsLoading={brandsLoading}
          cities={cities}
          categoryId={categoryId}
        />
        <Footer onClear={onClear} onApply={() => onApply(val)} onClose={onClose} />
      </section>

      {/* Sidebar (desktop) */}
      <section
        dir={dir}
        className={`
          fixed z-50 bg-white shadow-2xl
          inset-y-0 right-0 w-full md:w-[380px] lg:w-[420px] p-5
          transform transition-transform duration-300 hidden md:flex md:flex-col
          ${panelDesktop}
        `}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <Header title={title} onClose={onClose} />
        <FormBody
          val={val} setVal={setVal}
          brandOptions={brandOptions}
          brandsLoading={brandsLoading}
          cities={cities}
          categoryId={categoryId}
        />
        <Footer onClear={onClear} onApply={() => onApply(val)} onClose={onClose} />
      </section>
    </>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <header className="flex items-center justify-between pb-3 border-b">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <button onClick={onClose} aria-label="بستن" className="p-2 rounded-xl hover:bg-gray-100">
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}

function FormBody({
  val, setVal, brandOptions, brandsLoading, cities, categoryId,
}: {
  val: FiltersValue;
  setVal: (u: FiltersValue | ((p: FiltersValue) => FiltersValue)) => void;
  brandOptions: Option[];
  brandsLoading: boolean;
  cities: Option[];
  categoryId?: number;
}) {
  return (
    <div className="flex-1 overflow-auto pt-4 space-y-6">
   

      {/* برند (کشویی) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">برند</label>
        <select
          className="w-full rounded-xl border px-3 py-2 bg-white text-sm"
          disabled={!categoryId || brandsLoading}
          value={(val.brandIds?.[0] as number | undefined) ?? ""}
          onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : undefined;
            setVal((p) => ({ ...p, brandIds: v ? [v] : [] }));
          }}
        >
          <option value="">{brandsLoading ? "در حال بارگذاری…" : "همهٔ برندها"}</option>
          {brandOptions.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>

      

      {/* بازه قیمت */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">حداقل قیمت</label>
          <input
            type="number" inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2"
            value={val.priceMin ?? ""}
            onChange={(e) => setVal({ ...val, priceMin: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">حداکثر قیمت</label>
          <input
            type="number" inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2"
            value={val.priceMax ?? ""}
            onChange={(e) => setVal({ ...val, priceMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      {/* شهر (اختیاری) */}
      {!!cities.length && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">شهر</label>
          <select
            className="w-full rounded-xl border px-3 py-2 bg-white text-sm"
            value={val.cityId ?? ""}
            onChange={(e) => setVal({ ...val, cityId: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">همه</option>
            {cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

function Footer({ onClear, onApply, onClose }: { onClear?: () => void; onApply: () => void; onClose: () => void }) {
  return (
    <footer className="pt-4 border-t mt-4 flex items-center gap-3">
      {onClear && <button onClick={onClear} className="px-4 py-2 rounded-xl border hover:bg-gray-50">پاک‌کردن</button>}
      <button onClick={onApply} className="px-4 py-2 rounded-xl bg-gray-900 text-white">اعمال فیلتر</button>
      <button onClick={onClose} className="ml-auto px-3 py-2 text-gray-500 hover:text-gray-700">بستن</button>
    </footer>
  );
}

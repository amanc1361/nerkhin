// app/components/market/FilterModal.tsx
"use client";

import { useBrandsByCategory } from "@/app/hooks/useBrandCategory";
import type { ProductFilterData } from "@/app/types/product/product";
import { useEffect, useMemo, useState } from "react";
import MoneyInput, { parseMoney } from "@/app/components/shared/MonyInput";
import { useFiltersByCategory } from "@/app/hooks/useFilterByCategory";
import Portal from "../shared/portal";

type Option = { value: number; label: string };

export type FiltersValue = {
  categoryId?: number;
  brandIds?: number[]; // در این فرم تک‌انتخاب است ولی همچنان آرایه می‌فرستیم
  cityId?: number;
  isDollar?: boolean | null;
  priceMin?: number;
  priceMax?: number;
  // خروجی نهاییِ فیلترها به صورت آرایه‌ی فلت از optionIdها
  optionIds?: number[];
  // جدید: اعمال فیلتر بدون انتخاب گزینه
  filterIds?: number[];
};

export default function FiltersModal({
  open,
  onClose,
  onClear,
  onApply,
  initial,
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
  categoryId: number;
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
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // برندها براساس دسته
  const { items: brands = [], loading: brandsLoading } = useBrandsByCategory(categoryId);
  const brandOptions: Option[] = useMemo(
    () =>
      brands.map((b: any) => ({
        value: Number(b.id),
        label: String(b.title ?? b.name ?? b.model ?? b.id),
      })),
    [brands]
  );

  // فیلترها و گزینه‌ها براساس دسته
  const {
    filters: filterGroups = [],
    loading: filtersLoading,
    error,
  } = useFiltersByCategory(categoryId);

  // نگاشت انتخاب‌ها به ازای هر فیلتر: { [filterId]: optionId }
  const [selectedByFilter, setSelectedByFilter] = useState<Record<number, number | undefined>>({});

  // جدید: فیلترهای فعال بدون گزینه
  const [enabledFilters, setEnabledFilters] = useState<Record<number, boolean>>({});

  // اگر دسته عوض شد، انتخاب قبلی پاک شود
  useEffect(() => {
    setVal((p) => ({ ...p, categoryId, brandIds: [], optionIds: [], filterIds: [] }));
    setSelectedByFilter({});
    setEnabledFilters({});
  }, [categoryId]);

  // مقداردهی اولیه‌ی انتخاب‌های فیلتر از روی initial.optionIds بعد از لود فیلترها
  useEffect(() => {
    if (!filterGroups.length) return;
    const initIds = initial?.optionIds ?? [];
    if (!initIds.length) return;

    // ساخت lookup: optionId → filterId
    const optionToFilter = new Map<number, number>();
    for (const g of filterGroups) {
      for (const opt of g.options ?? []) {
        optionToFilter.set(Number(opt.id), Number(g.filter.id));
      }
    }
    const next: Record<number, number> = {};
    for (const oid of initIds) {
      const fid = optionToFilter.get(Number(oid));
      if (fid) next[fid] = Number(oid);
    }
    setSelectedByFilter(next);
  }, [filterGroups, initial?.optionIds]);

  // مقداردهی اولیه‌ی filterIds → enabledFilters
  useEffect(() => {
    if (!filterGroups.length) return;
    const initFilterIds = initial?.filterIds ?? [];
    if (!initFilterIds.length) return;

    const next: Record<number, boolean> = {};
    for (const g of filterGroups) {
      const fid = Number(g.filter.id);
      next[fid] = initFilterIds.includes(fid);
    }
    setEnabledFilters((prev) => ({ ...prev, ...next }));
  }, [filterGroups, initial?.filterIds]);

  // خروجی نهاییِ optionIds از روی selectedByFilter
  const flatOptionIds = useMemo(
    () =>
      Object.values(selectedByFilter)
        .filter((v): v is number => Number.isFinite(v as number))
        .map(Number),
    [selectedByFilter]
  );

  // خروجی نهاییِ filterIds براساس تیک‌ها (فقط وقتی آپشن انتخاب نشده)
  const flatFilterIds = useMemo(() => {
    const ids: number[] = [];
    for (const g of filterGroups) {
      const fid = Number(g.filter.id);
      const enabled = !!enabledFilters[fid];
      const hasOption = Number.isFinite(selectedByFilter[fid] as number);
      if (enabled && !hasOption) ids.push(fid);
    }
    return ids;
  }, [enabledFilters, selectedByFilter, filterGroups]);

  // هندل تغییر کشویی هر فیلتر
  const onChangeFilterSelect = (filterId: number, optionId?: number) => {
    setSelectedByFilter((prev) => ({ ...prev, [filterId]: optionId }));
    // اگر آپشن انتخاب شد، تیک «بدون گزینه» خاموش شود تا دوگانه نشود
    if (optionId) {
      setEnabledFilters((prev) => ({ ...prev, [filterId]: false }));
    }
  };

  // تیک «اعمال بدون گزینه»
  const toggleFilterEnabled = (filterId: number, checked: boolean) => {
    setEnabledFilters((prev) => ({ ...prev, [filterId]: checked }));
    if (checked) {
      setSelectedByFilter((prev) => {
        const next = { ...prev };
        delete next[filterId];
        return next;
      });
    }
  };

  // نهایی‌سازی و ارسال به والد
  const apply = () => {
    onApply({
      ...val,
      optionIds: flatOptionIds.length ? flatOptionIds : undefined,
      filterIds: flatFilterIds.length ? flatFilterIds : undefined,
    });
  };

  const isOpen = open ? "pointer-events-auto" : "pointer-events-none";
  const backdrop = open ? "opacity-100" : "opacity-0";
  const panelMobile = open ? "translate-y-0" : "translate-y-full";
  const panelDesktop = open ? "translate-x-0" : "translate-x-full";

  // برای MoneyInput معمولاً مقدار رشته‌ای بدهیم و در خروجی number بسازیم
  const priceMinStr = val.priceMin != null ? String(val.priceMin) : "";
  const priceMaxStr = val.priceMax != null ? String(val.priceMax) : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${isOpen} ${backdrop}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet (mobile) */}
      <Portal>
        <section
          dir={dir}
          className={`
            fixed z-50 bg-white shadow-xl
            inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl p-4
            transform transition-transform duration-300 md:hidden
            ${panelMobile}
          `}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <Header title={title} onClose={onClose} />
          <FormBody
            val={val}
            setVal={setVal}
            brandOptions={brandOptions}
            brandsLoading={brandsLoading}
            cities={cities}
            categoryId={categoryId}
            filterGroups={filterGroups}
            filtersLoading={filtersLoading}
            errorText={error ?? undefined}
            selectedByFilter={selectedByFilter}
            onChangeFilterSelect={onChangeFilterSelect}
            enabledFilters={enabledFilters}
            onToggleFilterEnabled={toggleFilterEnabled}
          />
          <Footer onClear={onClear} onApply={apply} onClose={onClose} />
        </section>
      </Portal>

      {/* Sidebar (desktop) */}
      <section
        dir={dir}
        className={`
          fixed z-50 bg-white shadow-2xl
          inset-y-0 right-0 w-full md:w-[380px] lg:w-[420px] p-5
          transform transition-transform duration-300 hidden md:flex md:flex-col
          ${panelDesktop}
        `}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <Header title={title} onClose={onClose} />
        <FormBody
          val={val}
          setVal={setVal}
          brandOptions={brandOptions}
          brandsLoading={brandsLoading}
          cities={cities}
          categoryId={categoryId}
          filterGroups={filterGroups}
          filtersLoading={filtersLoading}
          errorText={error ?? undefined}
          selectedByFilter={selectedByFilter}
          onChangeFilterSelect={onChangeFilterSelect}
          enabledFilters={enabledFilters}
          onToggleFilterEnabled={toggleFilterEnabled}
        />
        <Footer onClear={onClear} onApply={apply} onClose={onClose} />
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
  val,
  setVal,
  brandOptions,
  brandsLoading,
  cities,
  categoryId,
  filterGroups,
  filtersLoading,
  errorText,
  selectedByFilter,
  onChangeFilterSelect,
  enabledFilters,
  onToggleFilterEnabled,
}: {
  val: FiltersValue;
  setVal: (u: FiltersValue | ((p: FiltersValue) => FiltersValue)) => void;
  brandOptions: Option[];
  brandsLoading: boolean;
  cities: Option[];
  categoryId?: number;
  filterGroups: ProductFilterData[];
  filtersLoading: boolean;
  errorText?: string;
  selectedByFilter: Record<number, number | undefined>;
  onChangeFilterSelect: (filterId: number, optionId?: number) => void;
  enabledFilters: Record<number, boolean>;
  onToggleFilterEnabled: (filterId: number, checked: boolean) => void;
}) {
  // برای MoneyInput معمولاً مقدار رشته‌ای بدهیم و در خروجی number بسازیم
  const priceMinStr = val.priceMin != null ? String(val.priceMin) : "";
  const priceMaxStr = val.priceMax != null ? String(val.priceMax) : "";

  return (
    <div className="flex-1 overflow-auto pt-4 space-y-6">
      {/* برند (کشویی تک‌انتخاب) */}
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
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {/* شهر (اختیاری) */}
      {!!cities.length && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">شهر</label>
          <select
            className="w-full rounded-xl border px-3 py-2 bg-white text-sm"
            value={val.cityId ?? ""}
            onChange={(e) =>
              setVal((p) => ({ ...p, cityId: e.target.value ? Number(e.target.value) : undefined }))
            }
          >
            <option value="">همهٔ شهرها</option>
            {cities.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* بازه قیمت با MoneyInput (سه‌رقمی) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">حداقل قیمت</label>
          <MoneyInput
            value={priceMinStr}
            onChange={(str: string) =>
              setVal((p) => ({
                ...p,
                priceMin: str ? Number(parseMoney(str)) : undefined,
              }))
            }
            placeholder="مثلاً ۱,۵۰۰,۰۰۰"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">حداکثر قیمت</label>
          <MoneyInput
            value={priceMaxStr}
            onChange={(str: string) =>
              setVal((p) => ({
                ...p,
                priceMax: str ? Number(parseMoney(str)) : undefined,
              }))
            }
            placeholder="مثلاً ۱۲,۰۰۰,۰۰۰"
          />
        </div>
      </div>

      {/* فیلترها و گزینه‌ها (هر فیلتر = یک کشویی تک‌انتخاب) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
   
          {filtersLoading && <span className="text-xs text-gray-500">(در حال بارگذاری…)</span>}
          {errorText && <span className="text-xs text-red-600">({errorText})</span>}
        </div>

        {!filtersLoading && !filterGroups.length && (
          <div className="text-sm text-gray-500">فیلتری برای این دسته ثبت نشده است.</div>
        )}

        {filterGroups.map((g) => {
          const fid = Number(g.filter.id);
          const title = String(g.filter.displayName ?? g.filter.name ?? `فیلتر #${fid}`);
          const current = selectedByFilter[fid] ?? "";

          return (
            <div key={fid} className="border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">{title}</label>
       
              </div>

              <select
                className="w-full rounded-xl border px-3 py-2 bg-white text-sm"
                value={current}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : undefined;
                  onChangeFilterSelect(fid, v);
                }}
              >
                <option value="">(بدون انتخاب گزینه)</option>
                {(g.options ?? []).map((opt) => {
                  const oid = Number(opt.id);
                  const label = String(opt.name ?? oid);
                  return (
                    <option key={oid} value={oid}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Footer({
  onClear,
  onApply,
  onClose,
}: {
  onClear?: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  return (
    <footer className="pt-4 border-t mt-4 flex items-center gap-3">
      {onClear && (
        <button onClick={onClear} className="px-4 py-2 rounded-xl border hover:bg-gray-50">
          پاک‌کردن
        </button>
      )}
      <button onClick={onApply} className="px-4 py-2 rounded-xl bg-gray-900 text-white">
        اعمال فیلتر
      </button>
      <button onClick={onClose} className="ml-auto px-3 py-2 text-gray-500 hover:text-gray-700">
        بستن
      </button>
    </footer>
  );
}

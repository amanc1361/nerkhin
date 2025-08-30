// app/components/shared/FilterControls.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";

type Option = { value: string | number; label: string };

export type FilterControlsValue = {
  brandIds: number[];
  categoryId?: number;
  subCategoryId?: number;
  isDollar?: boolean | null; // null => هر دو
  sortUpdated: "asc" | "desc";
  search: string;
};

type VisibleKeys =
  | "brand"
  | "category"
  | "subCategory"
  | "priceType"
  | "sortUpdated"
  | "search";

type Props = {
  messages: UserProductMessages;
  brands?: Option[];
  categories?: Option[];
  subCategories?: Option[];
  initial?: Partial<FilterControlsValue>;
  onChange: (v: FilterControlsValue) => void;

  /** کنترل نمایش هر آیتم؛ مقدار پیش‌فرض: همه true */
  visible?: Partial<Record<VisibleKeys, boolean>>;
};

export default function FilterControls({
  messages,
  brands = [],
  categories = [],
  subCategories = [],
  initial,
  onChange,
  visible,
}: Props) {
  const [brandIds, setBrandIds] = useState<number[]>(initial?.brandIds ?? []);
  const [categoryId, setCategoryId] = useState<number | undefined>(initial?.categoryId);
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>(initial?.subCategoryId);
  const [isDollar, setIsDollar] = useState<boolean | null>(
    typeof initial?.isDollar === "boolean" ? initial?.isDollar! : null
  );
  const [sortUpdated, setSortUpdated] = useState<"asc" | "desc">(initial?.sortUpdated ?? "desc");
  const [search, setSearch] = useState<string>(initial?.search ?? "");

  // پیش‌فرض‌ها: همه نمایش داده شوند مگر اینکه false داده شود
  const show = useMemo(() => {
    const def: Record<VisibleKeys, boolean> = {
      brand: true,
      category: true,
      subCategory: true,
      priceType: true,
      sortUpdated: true,
      search: true,
    };
    return { ...def, ...(visible ?? {}) };
  }, [visible]);

  useEffect(() => {
    const payload: FilterControlsValue = {
      brandIds,
      categoryId,
      subCategoryId,
      isDollar,
      sortUpdated,
      search,
    };
    onChange(payload);
  }, [brandIds, categoryId, subCategoryId, isDollar, sortUpdated, search, onChange]);

  const t = messages.filters;

  return (
    <div dir="rtl" className="rounded-2xl border bg-white p-3 shadow-sm space-y-3">
      {/* سطر ۱: برند + دسته + زیردسته (هر کدام قابل مخفی شدن) */}
      {(show.brand || show.category || show.subCategory) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {show.brand && (
            <label className="text-sm">
              <span className="block mb-1">{t.brand}</span>
              <select
                multiple
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={brandIds.map(String)}
                onChange={(e) => {
                  const vals = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setBrandIds(vals);
                }}
              >
                {brands.length === 0 && <option value="">{t.brandAll}</option>}
                {brands.map((b) => (
                  <option key={b.value} value={String(b.value)}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {show.category && (
            <label className="text-sm">
              <span className="block mb-1">{t.category}</span>
              <select
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={categoryId ?? ""}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">{t.brandAll}</option>
                {categories.map((c) => (
                  <option key={c.value} value={String(c.value)}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {show.subCategory && (
            <label className="text-sm">
              <span className="block mb-1">{t.subCategory}</span>
              <select
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={subCategoryId ?? ""}
                onChange={(e) =>
                  setSubCategoryId(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">{t.brandAll}</option>
                {subCategories.map((sc) => (
                  <option key={sc.value} value={String(sc.value)}>
                    {sc.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {/* سطر ۲: نوع قیمت + مرتب‌سازی + جستجو (هر کدام قابل مخفی شدن) */}
      {(show.priceType || show.sortUpdated || show.search) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {show.priceType && (
            <label className="text-sm">
              <span className="block mb-1">{t.priceType}</span>
              <select
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={isDollar === null ? "any" : isDollar ? "1" : "0"}
                onChange={(e) => {
                  const v = e.target.value;
                  setIsDollar(v === "any" ? null : v === "1");
                }}
              >
                <option value="any">{t.priceAny}</option>
                <option value="1">{t.priceDollar}</option>
                <option value="0">{t.priceRial}</option>
              </select>
            </label>
          )}

          {show.sortUpdated && (
            <label className="text-sm">
              <span className="block mb-1">{t.sortUpdated}</span>
              <select
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={sortUpdated}
                onChange={(e) => setSortUpdated(e.target.value as "asc" | "desc")}
              >
                <option value="desc">{t.sortNewest}</option>
                <option value="asc">{t.sortOldest}</option>
              </select>
            </label>
          )}

          {show.search && (
            <label className="text-sm">
              <span className="block mb-1">{t.searchPlaceholder}</span>
              <input
                className="w-full border rounded-xl px-3 py-2 bg-white"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useMemo } from "react";

export type FilterRelationVM = {
  filterTitle?: string | null;
  optionTitle?: string | null;

  filterName?: string | null;
  optionName?: string | null;
  filterOptionName?: string | null;

  value?: string | number | null;

  filter?: { title?: string | null; name?: string | null; displayName?: string | null } | null;
  option?: { title?: string | null; name?: string | null; displayName?: string | null } | null;

  Filter?: { title?: string | null; name?: string | null; displayName?: string | null } | null;
  Option?: { title?: string | null; name?: string | null; displayName?: string | null } | null;
};

export type FilterOptionVM = {
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

export type FilterVM = {
  title?: string | null;
  name?: string | null;
  displayName?: string | null;
  options?: FilterOptionVM[] | null;
};

export type ProductSpecsSource = {
  description?: string | null;
  filterRelations?: FilterRelationVM[] | null;
  filters?: FilterVM[] | null;
};

export type SpecPair = { title: string; values: string[] };

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

/** ---------- تابع واحد و مشترک: گروه‌بندی مشخصات ---------- */
export function groupFilters(p: ProductSpecsSource): SpecPair[] {
  const map = new Map<string, string[]>();

  // 1) منبع اصلی: روابط فیلترها (انتخاب‌های واقعی محصول)
  if (Array.isArray(p?.filterRelations) && p.filterRelations!.length) {
    for (const r of p.filterRelations!) {
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

      const val = pickFirstText(
        r?.optionTitle,
        r?.optionName,
        r?.filterOptionName, // مطابق لاگ‌های شما
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

  // 2) fallback: filters → options (اگر روابط ناقص/خالی بود)
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

  // خروجی یکتا
  return Array.from(map.entries()).map(([title, values]) => ({
    title,
    values: Array.from(new Set(values)),
  }));
}

/** ---------- چیپ برای نمایش مقدار ---------- */
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-gray-100 text-gray-800 text-[12px] leading-5 px-2 py-1">
      {children}
    </span>
  );
}

/** ---------- UI: نمایش زوج‌های مشخصات ---------- */
export function SpecPairs({
  pairs,
  variant = "chips", // "chips" | "inline"
}: {
  pairs: SpecPair[];
  variant?: "chips" | "inline";
}) {
  if (!pairs?.length) {
    return <div className="py-2 px-1 text-sm text-gray-500">مشخصاتی ثبت نشده است.</div>;
  }

  return (
    <div className="space-y-1.5">
      {pairs.map(({ title, values }) => (
        <div key={title} className="flex items-start gap-3 py-1">
          <div className="min-w-28 shrink-0 text-xs text-gray-500 pt-1">{title}</div>
          <div className="flex-1">
            {variant === "chips" ? (
              <div className="flex flex-wrap gap-1.5">
                {values.map((v) => (
                  <Chip key={title + v}>{v}</Chip>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-900">{values.join("، ") || "—"}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** ---------- هوک کمکی: تولید زوج‌ها از هر سورس ---------- */
export function useSpecPairs(src: ProductSpecsSource) {
  return useMemo(() => groupFilters(src), [src]);
}

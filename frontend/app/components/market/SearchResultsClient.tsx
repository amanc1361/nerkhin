// app/components/market/SearchResultsClient.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMarketSearch } from "@/app/hooks/useMarketSearch";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";

import Pagination from "@/app/components/shared/Pagination";
import { useIntersection } from "@/app/hooks/useIntersection";
import MarketProductItem from "./MarketProductItem";
import { Filter, Search } from "lucide-react";
import FiltersModal, { FiltersValue } from "./FilterModal";

type Role = "wholesaler" | "retailer";

export default function SearchResultsClient({
  role,
  initialQuery,
  t,
}: {
  role: Role;
  initialQuery: string;
  t: MarketMessages;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // مقدار قابل ویرایشِ ورودی کاربر (جعبه جستجو)
  const [text, setText] = useState(initialQuery || "");

  // خواندن categoryId از URL
  const catId = useMemo(() => {
    const raw = sp.get("categoryId") ?? sp.get("CategoryID");
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [sp]);

  // وضعیت باز/بسته بودن پنل فیلتر
  const [filtersOpen, setFiltersOpen] = useState(false);

  // --- استخراج اولیه همه پارامترها از URL (برای جلوگیری از فلیکر) ---
  const initialFromUrl = useMemo(() => {
    const q = (sp.get("q") || "").trim();
    const brandIds = (sp.get("brandIds") || "")
      .split(",")
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);

    const optionIds = (sp.get("optionIds") || "")
      .split(",")
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);

    const filterIds = (sp.get("filterIds") || "")
      .split(",")
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);

    const isDollar =
      sp.get("isDollar") === "1" ? true : sp.get("isDollar") === "0" ? false : undefined;

    const priceMin = sp.get("min") ? Number(sp.get("min")) : undefined;
    const priceMax = sp.get("max") ? Number(sp.get("max")) : undefined;
    const cityId = sp.get("cityId") ? Number(sp.get("cityId")) : undefined;

    return {
      search: q || initialQuery || "",
      categoryId: catId,
      brandIds: brandIds.length ? brandIds : undefined,
      optionIds: optionIds.length ? optionIds : undefined,
      filterIds: filterIds.length ? filterIds : undefined, // ← اضافه شد
      isDollar,
      priceMin,
      priceMax,
      cityId,
      limit: 40,
      sortBy: "updated" as const,
      sortUpdated: "desc" as const,
      onlyVisible: true,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, catId, initialQuery]);

  // هوک جستجو (CSR) با مقدار اولیه از URL
  const { data, loading, setPage, page, setQuery, query } = useMarketSearch(initialFromUrl, "fa");

  // همگام با URL (هر بار هر پارامتری عوض شد)
  useEffect(() => {
    const q = (sp.get("q") || "").trim();
    setText(q);

    const rawCat = sp.get("categoryId") ?? sp.get("CategoryID");
    const nCat = rawCat ? Number(rawCat) : undefined;

    const brandIds = (sp.get("brandIds") || "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);

    const optionIds = (sp.get("optionIds") || "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);

    const filterIds = (sp.get("filterIds") || "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);

    const isDollar =
      sp.get("isDollar") === "1" ? true : sp.get("isDollar") === "0" ? false : undefined;

    const priceMin = sp.get("min") ? Number(sp.get("min")) : undefined;
    const priceMax = sp.get("max") ? Number(sp.get("max")) : undefined;
    const cityId = sp.get("cityId") ? Number(sp.get("cityId")) : undefined;

    setQuery((prev) => ({
      ...prev,
      search: q,
      categoryId: nCat && nCat > 0 ? nCat : undefined,
      brandIds: brandIds.length ? brandIds : undefined,
      optionIds: optionIds.length ? optionIds : undefined,
      filterIds: filterIds.length ? filterIds : undefined, // ← اضافه شد
      isDollar,
      priceMin,
      priceMax,
      cityId,
      offset: 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // submit سرچ: پارامترهای فعلی URL حفظ شوند
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    // فقط q را به‌روزرسانی کن، بقیه پارامترها حفظ شوند
    if (text) params.set("q", text);
    else params.delete("q");

    // اطمینان از بودن categoryId اگر بود
    if (catId) params.set("categoryId", String(catId));
    else params.delete("categoryId");

    router.replace(`/${role}/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // — اعمال از مودال —
  const applyFilters = (f: FiltersValue) => {
    // اول state داخلی هوک رو به‌روزرسانی کن
    setQuery((prev) => ({
      ...prev,
      offset: 0,
      categoryId: f.categoryId ?? prev.categoryId,
      isDollar: typeof f.isDollar === "boolean" ? f.isDollar : undefined,
      priceMin: f.priceMin,
      priceMax: f.priceMax,
      cityId: f.cityId,
      brandIds: f.brandIds?.length ? f.brandIds : undefined,
      optionIds: f.optionIds?.length ? f.optionIds : undefined,
      filterIds: f.filterIds?.length ? f.filterIds : undefined, // ← اضافه شد
    }));

    // خیلی مهم: از URL فعلی شروع کن
    const params = new URLSearchParams(sp.toString());

    // q را دست‌نخورده نگه داریم
    const qUrl = (params.get("q") || "").trim();
    if (qUrl) params.set("q", qUrl);
    else params.delete("q");

    // categoryId
    const finalCatId =
      f.categoryId ??
      (params.get("categoryId") ? Number(params.get("categoryId")) : undefined) ??
      undefined;
    if (finalCatId) params.set("categoryId", String(finalCatId));
    else params.delete("categoryId");

    // isDollar
    if (typeof f.isDollar === "boolean") params.set("isDollar", f.isDollar ? "1" : "0");
    else params.delete("isDollar");

    // priceMin / priceMax
    if (f.priceMin != null) params.set("min", String(f.priceMin)); else params.delete("min");
    if (f.priceMax != null) params.set("max", String(f.priceMax)); else params.delete("max");

    // cityId
    if (f.cityId != null) params.set("cityId", String(f.cityId)); else params.delete("cityId");

    // brandIds
    if (f.brandIds?.length) params.set("brandIds", f.brandIds.join(","));
    else params.delete("brandIds");

    // optionIds
    if (f.optionIds?.length) params.set("optionIds", f.optionIds.join(","));
    else params.delete("optionIds");

    // filterIds
    if (f.filterIds?.length) params.set("filterIds", f.filterIds.join(","));
    else params.delete("filterIds");

    // مرتب‌سازی: اگر بک‌اندت sortDir می‌خواهد، مطمئن شو ست شده
    params.set("sortBy", "updated");
    params.set("sortDir", "desc");

    router.replace(`/${role}/search${params.toString() ? `?${params.toString()}` : ""}`);
    setFiltersOpen(false);
  };

  // — موبایل: مرج برای اسکرول بی‌نهایت —
  const [mergedItems, setMergedItems] = useState<MarketItemVM[]>([]);
  useEffect(() => {
    if ((query.offset ?? 0) === 0) setMergedItems(data.items);
  }, [data.items, query.offset]);
  useEffect(() => {
    const first = (query.offset ?? 0) === 0;
    if (!first && data.items.length) {
      setMergedItems((prev) => {
        const map = new Map(prev.map((x) => [x.id, x]));
        data.items.forEach((it) => map.set(it.id, it)); // de-dup
        return Array.from(map.values());
      });
    }
  }, [data.items, query.offset]);

  const limit = query.limit || 20;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / limit)),
    [data.total, limit]
  );

  // — موبایل: اسکرول بی‌نهایت —
  const hasMore = page * limit < (data.total || 0);
  const loadNext = useCallback(() => {
    if (!loading && hasMore) setPage(page + 1);
  }, [loading, hasMore, page, setPage]);
  const sentinelRef = useIntersection(loadNext, !hasMore);

  return (
    <main className="max-w-screen-lg mx-auto px-3 pb-20" dir="rtl">
      {/* Header + Search */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 py-3">
          <form onSubmit={submit} className="flex w-full gap-2">
            <div className="flex w-full items-center gap-2 rounded-2xl border px-3 py-2 bg-white shadow-sm">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full outline-none bg-transparent text-sm"
                placeholder={t.search.placeholder}
                dir="rtl"
              />
              <button aria-label={t.action.search} className="p-1 rounded-md hover:bg-gray-100">
                <Search className="w-5 h-5" />
              </button>
            </div>
            {/* دکمهٔ باز کردن مودال فیلتر */}
       
       
            {catId!==undefined && catId >0 && (
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="border rounded-md justify-center flex items-center gap-2 py-2 px-3 w-40 hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                <span>فیلتر نتایج</span>
              </button>
            )}


          </form>
        </div>
      </header>

      {/* موبایل: اسکرول بی‌نهایت */}
      <section className="md:hidden pt-3">
        {mergedItems.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">{t.list.empty}</div>
        )}
        <ul className="flex flex-col divide-y">
          {mergedItems.map((item) => (
            <MarketProductItem key={item.id} item={item} t={t} role={role} />
          ))}
        </ul>
        {loading && <div className="py-4 text-center text-gray-500">{t.common.loading}</div>}
        {hasMore && <div ref={sentinelRef} className="h-10" />}
      </section>

      {/* دسکتاپ: صفحه‌بندی با Pagination */}
      <section className="hidden md:block pt-4">
        {loading && <div className="py-4 text-center text-gray-500">{t.common.loading}</div>}
        {!loading && data.items.length === 0 && (
          <div className="text-center text-gray-500 py-8">{t.list.empty}</div>
        )}

        <ul className="flex flex-col divide-y">
          {data.items.map((item) => (
            <MarketProductItem key={item.id} item={item} t={t} role={role} />
          ))}
        </ul>

        <div className="mt-4 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>

      {/* مودال فیلتر */}
      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilters}
        initial={{
          categoryId: catId,
          isDollar: sp.get("isDollar") === "1" ? true : sp.get("isDollar") === "0" ? false : null,
          priceMin: sp.get("min") ? Number(sp.get("min")) : undefined,
          priceMax: sp.get("max") ? Number(sp.get("max")) : undefined,
          cityId: sp.get("cityId") ? Number(sp.get("cityId")) : undefined,
          brandIds: sp.get("brandIds")
            ? sp
                .get("brandIds")!
                .split(",")
                .map(Number)
                .filter((n) => Number.isFinite(n) && n > 0)
            : [],
          // ← اضافه شد: optionIds و filterIds از URL
          optionIds: sp.get("optionIds")
            ? sp
                .get("optionIds")!
                .split(",")
                .map(Number)
                .filter((n) => Number.isFinite(n) && n > 0)
            : [],
          filterIds: sp.get("filterIds")
            ? sp
                .get("filterIds")!
                .split(",")
                .map(Number)
                .filter((n) => Number.isFinite(n) && n > 0)
            : [],
        }}
        categoryId={catId ?? 0}
        cities={[]}
        title="فیلترها"
        dir="rtl"
      />
    </main>
  );
}

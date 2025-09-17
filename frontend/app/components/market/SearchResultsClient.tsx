// app/components/market/SearchResultsClient.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMarketSearch } from "@/app/hooks/useMarketSearch";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";

import Pagination from "@/app/components/shared/Pagination";
import MarketProductItem from "./MarketProductItem";
import { Filter, Search } from "lucide-react";
import FiltersModal, { FiltersValue } from "./FilterModal";

type Role = "wholesaler" | "retailer";

const PAGE_LIMIT = 40; // Define limit as a constant for consistency

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

  // مقدار قابل ویرایش input جستجو
  const [text, setText] = useState(initialQuery || "");

  // تشخیص موبایل (مطابق breakpoint md)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(!!mql.matches);
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  // categoryId از URL
  const catId = useMemo(() => {
    const raw = sp.get("categoryId") ?? sp.get("CategoryID");
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [sp]);

  // وضعیت مودال فیلتر
  const [filtersOpen, setFiltersOpen] = useState(false);

  // --- مقدار اولیه query از URL (برای جلوگیری از فلیکر) ---
  const initialFromUrl = useMemo(() => {
    const q = (sp.get("q") || "").trim();

    const parseNums = (key: string) =>
      (sp.get(key) || "")
        .split(",")
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0);

    const brandIds = parseNums("brandIds");
    const optionIds = parseNums("optionIds");
    const filterIds = parseNums("filterIds");

    const isDollar =
      sp.get("isDollar") === "1" ? true : sp.get("isDollar") === "0" ? false : undefined;

    const priceMin = sp.get("min") ? Number(sp.get("min")) : undefined;
    const priceMax = sp.get("max") ? Number(sp.get("max")) : undefined;
    const cityId = sp.get("cityId") ? Number(sp.get("cityId")) : undefined;

    const pageFromUrl = Number(sp.get("page") || "1");
    const initialPage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

    return {
      search: q || initialQuery || "",
      categoryId: catId,
      brandIds: brandIds.length ? brandIds : undefined,
      optionIds: optionIds.length ? optionIds : undefined,
      filterIds: filterIds.length ? filterIds : undefined,
      isDollar,
      priceMin,
      priceMax,
      cityId,
      limit: PAGE_LIMIT,
      offset: (initialPage - 1) * PAGE_LIMIT,
      sortBy: "updated" as const,
      sortUpdated: "desc" as const,
      onlyVisible: true,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // هوک جستجو (CSR)
  const { data, loading, setPage, page, setQuery, query } = useMarketSearch(initialFromUrl, "fa");

  // Set initial page state from URL once, on mount.
  useEffect(() => {
    const pageFromUrl = Number(sp.get("page") || "1");
    const initialPage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
    if (page !== initialPage) {
      setPage(initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync با URL در هر تغییر
  useEffect(() => {
    const q = (sp.get("q") || "").trim();
    setText(q);

    const rawCat = sp.get("categoryId") ?? sp.get("CategoryID");
    const nCat = rawCat ? Number(rawCat) : undefined;

    const parseNums = (key: string) =>
      (sp.get(key) || "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0);

    const brandIds = parseNums("brandIds");
    const optionIds = parseNums("optionIds");
    const filterIds = parseNums("filterIds");

    const isDollar =
      sp.get("isDollar") === "1" ? true : sp.get("isDollar") === "0" ? false : undefined;

    const priceMin = sp.get("min") ? Number(sp.get("min")) : undefined;
    const priceMax = sp.get("max") ? Number(sp.get("max")) : undefined;
    const cityId = sp.get("cityId") ? Number(sp.get("cityId")) : undefined;

    const pageFromUrl = Number(sp.get("page") || "1");
    const currentPage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
    const currentOffset = (currentPage - 1) * PAGE_LIMIT;

    setPage(currentPage);

    setQuery((prev) => ({
      ...prev,
      search: q,
      categoryId: nCat && nCat > 0 ? nCat : undefined,
      brandIds: brandIds.length ? brandIds : undefined,
      optionIds: optionIds.length ? optionIds : undefined,
      filterIds: filterIds.length ? filterIds : undefined,
      isDollar,
      priceMin,
      priceMax,
      cityId,
      offset: currentOffset,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // ارسال فرم جستجو
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (text) params.set("q", text);
    else params.delete("q");
    if (catId) params.set("categoryId", String(catId));
    else params.delete("categoryId");
    params.delete("page");
    router.replace(`/${role}/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // اعمال فیلترها از مودال
  const applyFilters = (f: FiltersValue) => {
    const params = new URLSearchParams(sp.toString());
    const qUrl = (params.get("q") || "").trim();
    if (qUrl) params.set("q", qUrl);
    else params.delete("q");
    const finalCatId =
      f.categoryId ??
      (params.get("categoryId") ? Number(params.get("categoryId")) : undefined) ??
      undefined;
    if (finalCatId) params.set("categoryId", String(finalCatId));
    else params.delete("categoryId");
    if (typeof f.isDollar === "boolean") params.set("isDollar", f.isDollar ? "1" : "0");
    else params.delete("isDollar");
    if (f.priceMin != null) params.set("min", String(f.priceMin));
    else params.delete("min");
    if (f.priceMax != null) params.set("max", String(f.priceMax));
    else params.delete("max");
    if (f.cityId != null) params.set("cityId", String(f.cityId));
    else params.delete("cityId");
    if (f.brandIds?.length) params.set("brandIds", f.brandIds.join(","));
    else params.delete("brandIds");
    if (f.optionIds?.length) params.set("optionIds", f.optionIds.join(","));
    else params.delete("optionIds");
    if (f.filterIds?.length) params.set("filterIds", f.filterIds.join(","));
    else params.delete("filterIds");
    params.set("sortBy", "updated");
    params.set("sortDir", "desc");
    params.delete("page");
    router.replace(`/${role}/search${params.toString() ? `?${params.toString()}` : ""}`);
    setFiltersOpen(false);
  };

  // -------------------------
  // موبایل: مرج/append + Observer
  // -------------------------
  const limit = query.limit || PAGE_LIMIT;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / limit)),
    [data.total, limit]
  );

  const [mergedItems, setMergedItems] = useState<MarketItemVM[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const mobilePageRef = useRef<number>(1);

  // Reset/Replace logic for mobile
  useEffect(() => {
    // If it's the first page, reset the list.
    if (page === 1) {
      setMergedItems(data.items);
      mobilePageRef.current = 1;
    } else if (isMobile) {
      // For subsequent pages, append new items if any have been fetched.
      if (data.items.length > 0) {
        setMergedItems((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = data.items.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }

    // *** FIX ***: Correctly determine if there are more items to load.
    // Calculate the prospective total by adding the length of items we just received
    // to the items we already had (from the previous render).
    const prospectiveTotalCount = mergedItems.length + data.items.length;
    hasMoreRef.current = prospectiveTotalCount < (data.total || 0);
  }, [data.items, data.total, page, isMobile, mergedItems.length]);

  // hasMore for mobile is now derived correctly from the ref
  const hasMore = isMobile ? hasMoreRef.current : page < totalPages;

  // نصب Observer فقط در موبایل
  useEffect(() => {
    if (!isMobile || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          isFetchingRef.current = true;
          const nextPage = mobilePageRef.current + 1;
          mobilePageRef.current = nextPage;
          setPage(nextPage);
        }
      },
      { rootMargin: "300px" }
    );

    const loaderEl = loaderRef.current;
    if (loaderEl) {
      observer.observe(loaderEl);
    }

    return () => {
      if (loaderEl) {
        observer.unobserve(loaderEl);
      }
    };
  }, [isMobile, loading, setPage]);

  useEffect(() => {
    if (!loading) {
      isFetchingRef.current = false;
    }
  }, [loading]);

  // -------------------------
  // دسکتاپ: صفحه‌بندی
  // -------------------------
  const onDesktopPageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(sp.toString());
      if (p > 1) {
        params.set("page", String(p));
      } else {
        params.delete("page");
      }
      router.replace(`/${role}/search${params.toString() ? `?${params.toString()}` : ""}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, role, sp]
  );

  const itemsToDisplay = isMobile ? mergedItems : data.items;

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

            {catId !== undefined && catId > 0 && (
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
      
      {/* Combined Section for Mobile and Desktop */}
      <section className="pt-3">
        {loading && itemsToDisplay.length === 0 && (
          <div className="py-4 text-center text-gray-500">{t.common.loading}</div>
        )}
        {!loading && itemsToDisplay.length === 0 && (
          <div className="text-center text-gray-500 py-8">{t.list.empty}</div>
        )}

        <ul className="flex flex-col divide-y">
          {itemsToDisplay.map((item) => (
            <MarketProductItem key={item.id} item={item} t={t} role={role} />
          ))}
        </ul>

        {/* Mobile Loader */}
        {isMobile && loading && itemsToDisplay.length > 0 && (
            <div className="py-4 text-center text-gray-500">{t.common.loading}</div>
        )}
        {isMobile && hasMore && <div ref={loaderRef} className="h-10" />}

        {/* Desktop Pagination */}
        {!isMobile && totalPages > 1 && (
           <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onDesktopPageChange}
            />
          </div>
        )}
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
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import type { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";

import ProductsToolbar from "@/app/components/userproduct/ProductsToolbar";
import ProductsHeader from "@/app/components/userproduct/ProductsHeader";
import ProductsList from "@/app/components/userproduct/ProductsList";
import DollarPriceModal from "@/app/components/userproduct/DollarPriceModal";
import { useDollarPriceAction } from "@/app/hooks/useDollarPriceAction";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { formatMoneyInput } from "@/app/components/shared/MonyInput";

import FilterControls, { type FilterControlsValue } from "@/app/components/shared/FilterControls";
import { ShopViewModel, UserProductView } from "@/app/types/userproduct/userProduct";
import Pagination from "@/app/components/shared/Pagination";

type Role = "wholesaler" | "retailer";

type Props = {
  role: Role;
  initialData: ShopViewModel;
  usdPrice: string | number;
  dollarUpdate:boolean;
  rounded:boolean;
  locale: string;
};

export default function MyproductsPage({
  role,
  initialData,
  usdPrice,
  dollarUpdate,
  rounded,
  locale,
}: Props) {
  const messages: UserProductMessages = useMemo(
    () => getUserProductMessages((locale as "fa" | "en") || "fa"),
    [locale]
  );

  const { data: session, status } = useSession();
  const { api } = useAuthenticatedApi();
  const canFetch = status === "authenticated" && !!(session?.user as any)?.id;

  // --- دلار ---
  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  const [localDollarUpdate, setLocalDollarUpdate] = useState<boolean>(dollarUpdate);
  const [localRounded, setLocalRounded] = useState<boolean>(rounded);
  const [openUsdModal, setOpenUsdModal] = useState(false);
  useEffect(() => { setLocalDollarUpdate(dollarUpdate); }, [dollarUpdate]);
  useEffect(() => { setLocalRounded(rounded); }, [rounded]);
  useEffect(() => { setLocalUsd(String(usdPrice ?? "")); }, [usdPrice]);
  const displayUsd = useMemo(() => formatMoneyInput(String(localUsd ?? ""), false), [localUsd]);
  const addHref = `/${role}/products/create`;

  // --- محصولات ---
  const [items, setItems] = useState<UserProductView[]>(initialData?.products ?? []);
  const [total, setTotal] = useState<number>(Number(initialData?.total ?? (initialData?.products?.length ?? 0)));
  const [loading, setLoading] = useState(false);

  // صفحه‌بندی (فقط برای دسکتاپ)
  const limit = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // فیلترها
  const lastFiltersRef = useRef<Partial<FilterControlsValue> | undefined>(undefined);

  // فقط موبایل؟
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(!!mql.matches);
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  // --- کنترل‌های مخصوص موبایل (ref-based برای جلوگیری از لوپ) ---
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const mobilePageRef = useRef(1);
  const loadedCountRef = useRef<number>(items.length);
  const totalRef = useRef<number>(total);

  // همگام‌سازی total/loaded با state (فقط وقتی state تغییر کرد)
  useEffect(() => { totalRef.current = total; }, [total]);
  useEffect(() => { loadedCountRef.current = items.length; }, [items.length]);

  // dedupe برای append
  const appendDedup = useCallback((prev: UserProductView[], next: UserProductView[]) => {
    const seen = new Set<number | string>();
    prev.forEach((p: any) => seen.add(p?.id ?? JSON.stringify(p)));
    const merged = [...prev];
    next.forEach((n: any) => {
      const key = n?.id ?? JSON.stringify(n);
      if (!seen.has(key)) { merged.push(n); seen.add(key); }
    });
    return merged;
  }, []);

  // یک متد عمومی fetch (دسکتاپ و موبایل استفاده می‌کنند)
  const fetchPage = useCallback(
    async (
      page: number,
      filters?: Partial<FilterControlsValue>,
      opts?: { append?: boolean } // append فقط برای موبایل
    ) => {
      if (!canFetch) return;

      // موبایل: قفل موازی و قطع موقت Observe
      if (opts?.append) {
        if (isFetchingRef.current || !hasMoreRef.current) return;
        isFetchingRef.current = true;
        // قطع موقت Observe برای جلوگیری از تریگرهای پشت‌سرهم
        if (ioRef.current && loaderRef.current) {
          ioRef.current.unobserve(loaderRef.current);
        }
      }

      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        const params = new URLSearchParams();
        const shopId = (session?.user as any)?.id;
        if (shopId) params.set("shopId", String(shopId));
        params.set("limit", String(limit));
        params.set("offset", String(offset));

        const f = filters ?? lastFiltersRef.current;
        if (f?.brandIds?.length) params.set("brandIds", f.brandIds.join(","));
        if (f?.categoryId) params.set("categoryId", String(f.categoryId));
        if (f?.subCategoryId) params.set("subCategoryId", String(f.subCategoryId));
        if (typeof f?.isDollar === "boolean") params.set("isDollar", f.isDollar ? "1" : "0");
        if (f?.search) params.set("search", f.search);
        if (f?.sortUpdated) params.set("sortUpdated", f.sortUpdated as string);
        params.set("_ts", String(Date.now())); // ضدکش

        const url = `/user-product/fetch-shop?${params.toString()}`;
        const res: ShopViewModel = await api.get({ url });

        const products: UserProductView[] = Array.isArray(res?.products) ? res.products : [];
        const t = Number((res as any)?.total ?? totalRef.current);

        if (opts?.append) {
          setItems(prev => appendDedup(prev, products));
          mobilePageRef.current = page;
          loadedCountRef.current = loadedCountRef.current + products.length;
          totalRef.current = t;
          hasMoreRef.current = loadedCountRef.current < totalRef.current && products.length > 0;
        } else {
          // دسکتاپ یا شروع جدید موبایل (پس از فیلتر/دلار)
          setItems(products);
          setCurrentPage(page); // فقط دسکتاپ ازش استفاده می‌کند
          setTotal(t);
          // ریست رفرنس‌های موبایل
          mobilePageRef.current = 1;
          loadedCountRef.current = products.length;
          totalRef.current = t;
          hasMoreRef.current = loadedCountRef.current < totalRef.current;
        }
      } catch (err) {
        console.error("[fetchPage][ERROR]", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
        // پس از اتمام، دوباره Observe کن تا برای دفعه بعد آماده باشه
        if (isMobile && ioRef.current && loaderRef.current && hasMoreRef.current) {
          ioRef.current.observe(loaderRef.current);
        }
      }
    },
    [api, canFetch, session?.user, appendDedup, isMobile]
  );

  // تغییر فیلترها ⇒ جایگزینی از صفحه ۱ و ریست موبایل
  const handleFilters = useCallback(
    async (filters: FilterControlsValue) => {
      lastFiltersRef.current = filters;
      isFetchingRef.current = false;
      hasMoreRef.current = true;
      mobilePageRef.current = 1;
      await fetchPage(1, filters, { append: false });
    },
    [fetchPage]
  );

  // دلار
  const { update, isSubmitting } = useDollarPriceAction(async (digits, options) => {
    setLocalUsd(digits);
    setOpenUsdModal(false);
    if (options) {
      setLocalDollarUpdate(options.dollarUpdate ?? false);
      setLocalRounded(options.rounded ?? false);
    }
    isFetchingRef.current = false;
    hasMoreRef.current = true;
    mobilePageRef.current = 1;
    await fetchPage(1, lastFiltersRef.current, { append: false });
  });

  // --- IntersectionObserver (فقط یک‌بار نصب، بدون وابستگی به state برای جلوگیری از لوپ) ---
  useEffect(() => {
    if (!isMobile) return;
    if (!loaderRef.current) return;

    ioRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isFetchingRef.current || !hasMoreRef.current) return;
        // هنگام شروع لود، Observe را قطع می‌کنیم (loop-breaker)
        if (ioRef.current && loaderRef.current) {
          ioRef.current.unobserve(loaderRef.current);
        }
        const nextPage = mobilePageRef.current + 1;
        fetchPage(nextPage, lastFiltersRef.current, { append: true });
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 }
    );

    ioRef.current.observe(loaderRef.current);
    return () => {
      ioRef.current?.disconnect();
      ioRef.current = null;
    };
  }, [isMobile, fetchPage]); // وابسته به تغییر حالت موبایل، نه به items/total/loading

  return (
    <div dir="rtl" className="container mx-auto px-3 py-4 lg:py-6 text-right">
      <div className="lg:flex lg:gap-6">
        {/* سایدبار */}
        <aside className="hidden lg:block lg:w-80 lg:sticky lg:top-20">
          <div className="rounded-2xl border bg-white p-3 space-y-4 shadow-sm">
            <ProductsToolbar
              usdPrice={displayUsd}
              addHref={addHref}
              onShareJpg={() => {}}
              onSharePdf={() => {}}
              onShare={() => {}}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}
            />
          </div>
          
        </aside>

        {/* لیست */}
        <main className="flex-1">
          {/* موبایل: تولبار */}
          <div className="lg:hidden mb-4">
            <ProductsToolbar
              usdPrice={displayUsd}
              addHref={addHref}
              onShareJpg={() => {}}
              onSharePdf={() => {}}
              onShare={() => {}}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}
            />
          </div>

          {/* فیلترها */}
          <div className="mb-3">
            <FilterControls
              messages={messages}
            
              onChange={handleFilters}
              visible={{
          
               
                priceType: true,
           
                search: true,
              }}
            />
          </div>

          <ProductsHeader count={total} messages={messages} />
          <ProductsList items={items} messages={messages} />

          {/* Loader: فقط موبایل */}
          <div ref={loaderRef} className="h-10 lg:hidden">
            {isMobile && loading && (
              <div className="flex justify-center items-center py-2">
                <svg
                  className="animate-spin h-6 w-6 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            )}
          </div>

          {/* صفحه‌بندی: فقط دسکتاپ */}
          <div className="hidden lg:block">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                // دسکتاپ: جایگزینی و اسکرول به بالا
                isFetchingRef.current = false;
                hasMoreRef.current = true;
                mobilePageRef.current = 1;
                fetchPage(p, lastFiltersRef.current, { append: false });
                // if (typeof window !== "undefined") {
                //   window.scrollTo({ top: 0, behavior: "smooth" });
                // }
              }}
            />
          </div>

          {loading && (
            <div className="mt-3 text-xs text-neutral-500">
              {messages.loading ?? "در حال بارگذاری..."}
            </div>
          )}
        </main>
      </div>

      {/* مودال دلار */}
      <DollarPriceModal
        open={openUsdModal}
        initialValue={localUsd}
        initialDollarUpdate={localDollarUpdate}
        initialRounded={localRounded}
        
        onClose={() => setOpenUsdModal(false)}
        onSubmit={async (digits, dollarUpdate, rounded) => {
          await update(digits, { dollarUpdate, rounded });
   
          await fetchPage(1, lastFiltersRef.current, { append: false });
        }}
        loading={isSubmitting}
      />
    </div>
  );
}

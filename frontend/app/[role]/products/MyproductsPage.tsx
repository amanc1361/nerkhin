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
import LoadingSpinnerMobile from "@/app/components/shared/LoadingSpinnerMobile";

type Role = "wholesaler" | "retailer";

type Props = {
  role: Role;
  initialData: ShopViewModel;
  usdPrice: string | number;
  locale: string;
};

export default function MyproductsPage({
  role,
  initialData,
  usdPrice,
  locale,
}: Props) {
  const messages: UserProductMessages = useMemo(
    () => getUserProductMessages((locale as "fa" | "en") || "fa"),
    [locale]
  );

  const { data: session, status } = useSession();
  const { api } = useAuthenticatedApi();
  const canFetch = status === "authenticated" && !!(session?.user as any)?.id;

  // --- USD modal state ---
  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  useEffect(() => {
    setLocalUsd(String(usdPrice ?? ""));
  }, [usdPrice]);
  const displayUsd = useMemo(
    () => formatMoneyInput(String(localUsd ?? ""), false),
    [localUsd]
  );
  const addHref = `/${role}/products/create`;
  const [openUsdModal, setOpenUsdModal] = useState(false);

  // --- محصولات + صفحه‌بندی ---
  const [items, setItems] = useState<UserProductView[]>(
    initialData?.products ?? []
  );
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [loading, setLoading] = useState(false);

  const firstFireRef = useRef(true);
  const lastFiltersRef = useRef<Partial<FilterControlsValue> | null>(null);

  // ---- fetch ----
  const doFetch = useCallback(
    async (
      v?: Partial<FilterControlsValue> | null,
      nextOffset = 0,
      replace = false
    ) => {
      if (!canFetch) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const shopId = (session?.user as any)?.id;
        if (shopId) params.set("shopId", String(shopId));
        params.set("limit", String(limit));
        params.set("offset", String(nextOffset));

        if (v?.brandIds?.length) params.set("brandIds", v.brandIds.join(","));
        if (v?.categoryId) params.set("categoryId", String(v.categoryId));
        if (v?.subCategoryId) params.set("subCategoryId", String(v.subCategoryId));
        if (typeof v?.isDollar === "boolean") {
          params.set("isDollar", v.isDollar ? "1" : "0");
        }
        if (v?.search) params.set("search", v.search);
        if (v?.sortUpdated) params.set("sortUpdated", v.sortUpdated as string);

        const url = `/user-product/fetch-shop?${params.toString()}`;
        const res: any = await api.get({ url });
        const payload: ShopViewModel = res?.data ?? res;

        setTotal(payload.total ?? 0);
        setOffset(nextOffset);

        if (replace || nextOffset === 0) {
          setItems(payload.products ?? []);
        } else {
          setItems((prev) => [...prev, ...(payload.products ?? [])]);
        }
      } catch (e) {
        console.error("[Products][fetch][ERROR]", e);
      } finally {
        setLoading(false);
      }
    },
    [api, canFetch, session?.user]
  );

  const fetchWithFilters = useCallback(
    async (v: FilterControlsValue) => {
      lastFiltersRef.current = v;
      if (firstFireRef.current) {
        firstFireRef.current = false;
        return;
      }
      await doFetch(v, 0, true);
    },
    [doFetch]
  );

  // --- Infinite Scroll فقط روی موبایل ---
  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        if (items.length < total) {
          doFetch(lastFiltersRef.current, offset + limit);
        }
      }
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [items, total, offset, loading, doFetch]);

  // --- Pagination دسکتاپ ---
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // --- آپدیت دلار ---
  const { update, isSubmitting } = useDollarPriceAction(async (digits) => {
    setLocalUsd(digits);
    setOpenUsdModal(false);
    await doFetch(lastFiltersRef.current, 0, true);
  });

  return (
    <div dir="rtl" className="container mx-auto px-3 py-4 lg:py-6 text-right">
      <div className="lg:flex lg:gap-6">
        {/* سایدبار راست */}
        <aside className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-20">
          <div className="rounded-2xl border bg-white p-3 space-y-4 shadow-sm text-right">
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

        {/* ستون چپ */}
        <main className="flex-1">
          {/* موبایل */}
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
              brands={[]}
              categories={[]}
              subCategories={[]}
              onChange={fetchWithFilters}
              visible={{
                brand: false,
                category: false,
                subCategory: false,
                priceType: true,
                sortUpdated: true,
                search: true,
              }}
            />
          </div>

          {/* هدر تعداد */}
          <ProductsHeader count={total ?? 0} messages={messages} />

          {/* لیست محصولات */}
          <ProductsList items={items ?? []} messages={messages} />

          {/* Loader فقط روی موبایل */}
          <div ref={loaderRef} className="h-10 lg:hidden">
            {loading && <LoadingSpinnerMobile />}
          </div>

          {/* Pagination فقط روی دسکتاپ */}
          <div className="hidden lg:block">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                const newOffset = (page - 1) * limit;
                doFetch(lastFiltersRef.current, newOffset, true);
              }}
            />
          </div>
        </main>
      </div>

      {/* مودال دلار */}
      <DollarPriceModal
        open={openUsdModal}
        initialValue={localUsd}
        onClose={() => setOpenUsdModal(false)}
        onSubmit={async (digits) => {
          await update(digits);
          await doFetch(lastFiltersRef.current, 0, true);
        }}
        loading={isSubmitting}
      />
    </div>
  );
}

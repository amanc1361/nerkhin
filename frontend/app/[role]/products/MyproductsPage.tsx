// app/[role]/products/MyproductsPage.tsx
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
import { formatMoneyInput, toEnDigits } from "@/app/components/shared/MonyInput";

import FilterControls, { type FilterControlsValue } from "@/app/components/shared/FilterControls";
import { UserProductVM } from "@/app/types/userproduct/userProduct";

type Role = "wholesaler" | "retailer";

type Props = {
  role: Role;
  initialItems: UserProductVM[]; // UserProductVM[]
  usdPrice: string | number;
  locale: string;
};

export default function MyproductsPage({
  role,
  initialItems,
  usdPrice,
  locale,
}: Props) {
  // i18n
  const messages: UserProductMessages = useMemo(
    () =>
      typeof getUserProductMessages === "function"
        ? getUserProductMessages((locale as "fa" | "en") || "fa")
        : ({} as any),
    [locale]
  );

  // session & api
  const { data: session, status } = useSession();
  const { api } = useAuthenticatedApi();
  const canFetch = status === "authenticated" && !!(session?.user as any)?.id;

  // --- USD modal state ---
  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  useEffect(() => { setLocalUsd(String(usdPrice ?? "")); }, [usdPrice]);
  const displayUsd = useMemo(() => formatMoneyInput(String(localUsd ?? ""), false), [localUsd]);
  const addHref = `/${role}/products/create`;
  const [openUsdModal, setOpenUsdModal] = useState(false);

  // --- products state ---
  const [items, setItems] = useState<any[]>(initialItems ?? []);
  const [loading, setLoading] = useState(false);

  // برای جلوگیری از شلیک درخواست روی mount اولیه‌ی FilterControls
  const firstFireRef = useRef(true);
  // آخرین فیلترها برای refetch بعد از تغییرات
  const lastFiltersRef = useRef<Partial<FilterControlsValue> | null>(null);

  // --- برندها از initialItems (بدون تغییر در ریکوئست) ---
  const brandOptions = useMemo(() => {
    const map = new Map<number, string>();
    (initialItems ?? []).forEach((it: any) => {
      const brandId =
        it?.brandId ??
        it?.product?.brandId ??
        it?.productBrandId ??
        it?.product?.brand_id ??
        null;
      const title =
        it?.product?.brandTitle ??
        it?.productBrand ??
        it?.brandTitle ??
        it?.product?.brand_title ??
        "";
      if (brandId && title && !map.has(Number(brandId))) {
        map.set(Number(brandId), String(title));
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [initialItems]);



  // ---- بدنه fetch (بدون تغییر در URL/Query/Headers) ----
  const doFetch = useCallback(
    async (v?: Partial<FilterControlsValue> | null) => {
      if (!canFetch) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        const shopId = (session?.user as any)?.id;
        if (shopId) params.set("shopId", String(shopId));

        if (v?.brandIds?.length) params.set("brandIds", v.brandIds.join(","));
        if (v?.categoryId) params.set("categoryId", String(v.categoryId));
        if (v?.subCategoryId) params.set("subCategoryId", String(v.subCategoryId));
        if (v?.isDollar !== null && typeof v?.isDollar === "boolean") {
          params.set("isDollar", v.isDollar ? "1" : "0");
        }
        if (v?.search) params.set("search", v.search);
        if (v?.sortUpdated) params.set("sortUpdated", v.sortUpdated as string);

        const url = `/user-product/fetch-shop${params.toString() ? `?${params.toString()}` : ""}`;
        const res: any = await api.get({ url });
       
        const payload = (res && typeof res === "object" && "data" in res) ? res.data : res;

        const products = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload)
          ? payload
          : [];

        // ⬅️ نرمالایز و سپس ست در state
        setItems(products);
      } catch (e) {
        console.error("[Products][fetch][ERROR]", e);
      } finally {
        setLoading(false);
      }
    },
    [api, canFetch, session?.user]
  );

  // --- تغییر فیلترها (بدون تغییر ساختار ریکوئست) ---
  const fetchWithFilters = useCallback(
    async (v: FilterControlsValue) => {
      lastFiltersRef.current = v;

      if (firstFireRef.current) {
        firstFireRef.current = false;
        return;
      }

      await doFetch(v);
    },
    [doFetch]
  );

  // --- خواندن نرخ دلار کاربر برای نمایش (بدون تغییر ریکوئست) ---
  useEffect(() => {
    if (!canFetch) return;
    const uid = (session?.user as any)?.id;
    (async () => {
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${uid}` });
        const payload = res && typeof res === "object" && "data" in res ? res.data : res;

        const toIntegerDigits = (v: any): string => {
          if (v == null) return "";
          if (typeof v === "number") return String(Math.trunc(v));
          if (typeof v === "string") {
            const s = toEnDigits(v).replace(/,/g, "").replace(/\s+/g, "").replace(/٫/g, ".");
            const intPart = s.split(".")[0];
            return intPart.replace(/[^0-9]/g, "");
          }
          if (typeof v === "object" && "value" in (v as any)) {
            return toIntegerDigits((v as any).value);
          }
          return toIntegerDigits(String(v));
        };

        const digits = toIntegerDigits(payload);
        if (digits !== "") setLocalUsd(digits);
      } catch (e) {
        console.log("[DollarPrice][ERROR] =>", e);
      }
    })();
  }, [canFetch, session?.user, api]);

  // --- آپدیت دلار: بعد از موفقیت، همان fetch قبلی + آخرین فیلترها ---
  const { update, isSubmitting } = useDollarPriceAction(async (digits) => {
    setLocalUsd(digits);
    setOpenUsdModal(false);
    await doFetch(lastFiltersRef.current);
  });

  const handleUsdSubmit = async (digits: string) => {
    await update(digits);
    await doFetch(lastFiltersRef.current);
  };

  // --- کلید ریمونت لیست: وابسته به id + finalPrice + updatedAt (برای رندر قطعی) ---
  const listKey = useMemo(() => {
    const sig = (items ?? [])
      .map((x: any) => {
        const id =
          x?.id ?? x?.productId ?? x?.product?.id ?? "";
        const fp =
          x?.finalPrice ??
          x?.final_price ??
          x?.product?.finalPrice ??
          x?.product?.final_price ??
          "";
        const up =
          x?.updatedAt ??
          x?.updated_at ??
          x?.product?.updatedAt ??
          x?.product?.updated_at ??
          "";
        return `${id}:${fp}:${up}`;
      })
      .join("|");
    return sig || "empty";
  }, [items]);

  // اشتراک‌گذاری‌ها
  const onShareJpg = () => {};
  const onSharePdf = () => {};
  const onShare = () => {};

  return (
    <div dir="rtl" className="container mx-auto px-3 py-4 lg:py-6 text-right">
      <div className="lg:flex lg:gap-6">
        {/* سایدبار راست */}
        <aside className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-20">
          <div className="rounded-2xl border bg-white p-3 space-y-4 shadow-sm text-right">
            <ProductsToolbar
              usdPrice={displayUsd}
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}
            />
          </div>
        </aside>

        {/* ستون چپ */}
        <main className="flex-1">
          {/* موبایل: تولبار بالا */}
          <div className="lg:hidden mb-4">
            <ProductsToolbar
              usdPrice={displayUsd}
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}
            />
          </div>

          {/* فیلترها */}
          <div className="mb-3">
            <FilterControls
              messages={messages}
              brands={brandOptions}
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
          <ProductsHeader count={items?.length ?? 0} messages={messages} />

          {/* لیست محصولات — با key برای remount در تغییر قیمت/آپدیت */}
          <ProductsList
            key={listKey}
            items={items ?? []}
            messages={messages}
          />

          {/* وضعیت بارگذاری */}
          {loading && (
            <div className="mt-3 text-xs text-neutral-500">
              {messages?.loading ?? "در حال بارگذاری..."}
            </div>
          )}
        </main>
      </div>

      {/* مودال قیمت دلار */}
      <DollarPriceModal
        open={openUsdModal}
        initialValue={localUsd}
        onClose={() => setOpenUsdModal(false)}
        onSubmit={handleUsdSubmit}
        loading={isSubmitting}
      />
    </div>
  );
}

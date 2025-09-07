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

import FilterControls, {
  type FilterControlsValue,
} from "@/app/components/shared/FilterControls";

type Role = "wholesaler" | "retailer";

type Props = {
  role: Role;
  initialItems: any[]; // UserProductVM[]
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
  useEffect(() => {
    setLocalUsd(String(usdPrice ?? ""));
  }, [usdPrice]);
  const displayUsd = useMemo(
    () => formatMoneyInput(String(localUsd ?? ""), false),
    [localUsd]
  );
  const addHref = `/${role}/products/create`;
  const [openUsdModal, setOpenUsdModal] = useState(false);

  // --- products state ---
  const [items, setItems] = useState<any[]>(initialItems ?? []);
  const [loading, setLoading] = useState(false);

  // آخرین فیلترهای اعمال‌شده (برای رفرش بعد از آپدیت دلار)
  const lastFiltersRef = useRef<Partial<FilterControlsValue> | null>(null);

  // برای جلوگیری از شلیک درخواست روی mount اولیه‌ی FilterControls
  const firstFireRef = useRef(true);

  // سیگنال محلی برای اجبار به رفرش بعد از آپدیت دلار
  const [usdUpdatedAt, setUsdUpdatedAt] = useState<number>(0);

  // --- brand options با brandId واقعی (هر جا موجود باشد) ---
  const brandOptions = useMemo(() => {
    const map = new Map<number, string>(); // brandId -> title
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

  // --- بدنه مشترک برای fetch محصولات با فیلترهای اختیاری ---
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
        params.set("sortUpdated", (v?.sortUpdated as string) || "desc");

        // Cache-busting برای اطمینان از عدم برگشت پاسخ کش‌شده
        params.set("_", String(Date.now()));

        const url = `/user-product/fetch-shop${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const res: any = await api.get({ url });
        const payload =
          res && typeof res === "object" && "data" in res ? res.data : res;

        const products = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload)
          ? payload
          : [];

        setItems(products);
      } catch (e) {
        console.error("[Products][fetch][ERROR]", e);
      } finally {
        setLoading(false);
      }
    },
    [api, canFetch, session?.user]
  );

  // ---- رفرش سادهٔ محصولات با آخرین فیلترهای ذخیره‌شده ----
  const refetchProducts = useCallback(async () => {
    await doFetch(lastFiltersRef.current);
  }, [doFetch]);

  // --- fetch روی تغییر فیلترها (با گارد firstFire) ---
  const fetchWithFilters = useCallback(
    async (v: FilterControlsValue) => {
      lastFiltersRef.current = v;

      // نادیده گرفتن اولین onChange هنگام mount
      if (firstFireRef.current) {
        firstFireRef.current = false;
        return;
      }

      await doFetch(v);
    },
    [doFetch]
  );

  // --- وقتی سیگنال usdUpdatedAt تغییر کرد، فوراً رفرش کن
  useEffect(() => {
    if (!usdUpdatedAt) return;
    void refetchProducts();
  }, [usdUpdatedAt, refetchProducts]);

  // --- خواندن نرخ دلار کاربر (نمایش) ---
  useEffect(() => {
    if (!canFetch) return;
    const uid = (session?.user as any)?.id;
    (async () => {
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${uid}` });
        const payload =
          res && typeof res === "object" && "data" in res ? res.data : res;

        const toIntegerDigits = (v: any): string => {
          if (v == null) return "";
          if (typeof v === "number") return String(Math.trunc(v));
          if (typeof v === "string") {
            const s = toEnDigits(v)
              .replace(/,/g, "")
              .replace(/\s+/g, "")
              .replace(/٫/g, ".");
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

  // --- آپدیت دلار: بعد از موفقیت، فقط رفرش محصولات ---
  const { update, isSubmitting } = useDollarPriceAction((digits) => {
    setLocalUsd(digits);
    setOpenUsdModal(false);
    setUsdUpdatedAt(Date.now()); // 👈 تریگر قطعی برای رفرش
  });

  // اگر update Promise برنگرداند، باز هم با این مسیر تریگر داریم
  const handleUsdSubmit = async (digits: string) => {
    try {
      await Promise.resolve(update(digits));
    } finally {
      // تضمینی؛ حتی اگر onSuccess فوق دیرتر بخورد
      setUsdUpdatedAt(Date.now());
    }
  };

  // اشتراک‌گذاری‌ها
  const onShareJpg = () => {};
  const onSharePdf = () => {};
  const onShare = () => {};

  // key برای remount کردن ProductsList وقتی ترکیب آیتم‌ها عوض می‌شود
  const listKey = useMemo(() => {
    const ids = (items ?? [])
      .map((x: any) => x?.id ?? x?.productId ?? "")
      .join("-");
    return ids || "empty";
  }, [items]);

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

          {/* لیست محصولات — با key برای remount در تغییر داده‌ها */}
          <ProductsList
            key={listKey}
            items={items ?? []}
            messages={messages}
            // onRefresh={refetchProducts} // اگر رفرش دستی خواستی
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

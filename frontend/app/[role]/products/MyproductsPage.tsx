// app/[role]/products/MyproductsPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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

// ← اضافه شد: کامپوننت واحد فیلترها
import FilterControls, { type FilterControlsValue } from "@/app/components/shared/FilterControls";

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
  // دیکشنری متن‌ها بر اساس locale
  const messages: UserProductMessages = useMemo(
    () =>
      typeof getUserProductMessages === "function"
        ? getUserProductMessages((locale as "fa" | "en") || "fa")
        : ({} as any),
    [locale]
  );

  // مقدار خام (digits) که برای ذخیره می‌فرستیم
  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  useEffect(() => {
    setLocalUsd(String(usdPrice ?? ""));
  }, [usdPrice]);

  // نمایش سه‌رقم‌سه‌رقم (فقط بخش صحیح)
  const displayUsd = useMemo(
    () => formatMoneyInput(String(localUsd ?? ""), false),
    [localUsd]
  );

  const addHref = `/${role}/products/create`;

  // مودال قیمت دلار + ذخیره
  const [openUsdModal, setOpenUsdModal] = useState(false);
  const { update, isSubmitting } = useDollarPriceAction((digits) => {
    setLocalUsd(digits); // UI فوری آپدیت
    setOpenUsdModal(false);
  });
  const handleUsdSubmit = (digits: string) => update(digits);

  // گرفتن نرخ دلار کاربر از بک‌اند (مثل فرم افزودن) — فقط بخش صحیح نگه داشته می‌شود
  const { data: session, status } = useSession();
  const { api } = useAuthenticatedApi();

  useEffect(() => {
    if (status !== "authenticated") return;
    const uid = (session?.user as any)?.id;
    if (!uid) return;

    (async () => {
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${uid}` });
        const payload = res && typeof res === "object" && "data" in res ? res.data : res;

        // فقط قسمت صحیح
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
  }, [status, session?.user, api]);

  // --- لیست محصولات: لود اولیه از props، سپس با فیلترها از سرور ---
  const [items, setItems] = useState<any[]>(initialItems ?? []);
  const [loading, setLoading] = useState(false);

  // (اختیاری) اگر برای برند/دسته/زیردسته API جدا داری، این‌ها را با data واقعی پر کن
  const brandOptions = useMemo(() => {
    // اگر فعلا brandId واقعی توی VM نداری، فقط لیست عنوان‌ها برای UI:
    const titles = new Set<string>();
    (initialItems ?? []).forEach((it: any) => {
      const t =
        it?.product?.brandTitle ??
        (it as any)?.productBrand ??
        (it as any)?.brandTitle ??
        "";
      if (t) titles.add(t);
    });
    return Array.from(titles).map((label, i) => ({ label, value: i + 1 }));
  }, [initialItems]);

  // فراخوانی سرور با فیلترها (همان اندپوینت قبلی، فقط با QueryString)
  const fetchWithFilters = async (v: FilterControlsValue) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // shopId: اگر سرور از کاربر فعلی استفاده می‌کند، می‌تونی نگذاری
      const shopId = (session?.user as any)?.id;
      if (shopId) params.set("shopId", String(shopId));

      if (v.brandIds?.length) params.set("brandIds", v.brandIds.join(","));
      if (v.categoryId) params.set("categoryId", String(v.categoryId));
      if (v.subCategoryId) params.set("subCategoryId", String(v.subCategoryId));
      if (v.isDollar !== null && typeof v.isDollar === "boolean") {
        params.set("isDollar", v.isDollar ? "1" : "0");
      }
      if (v.search) params.set("search", v.search);
      params.set("sortUpdated", v.sortUpdated);

      // اگر صفحه‌بندی نیاز شد:
      // params.set("limit", "50");
      // params.set("offset", "0");

      const url = `/user-product/fetch-shop${params.toString() ? `?${params.toString()}` : ""}`;
      const res: any = await api.get({ url });
      const payload = res && typeof res === "object" && "data" in res ? res.data : res;

      const products = Array.isArray(payload?.products) ? payload.products : Array.isArray(payload) ? payload : [];
      setItems(products);
    } catch (e) {
      console.error("[FilterFetch][ERROR]", e);
    } finally {
      setLoading(false);
    }
  };

  // اشتراک‌گذاری‌ها (در صورت نیاز بعداً پر می‌شوند)
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

        {/* ستون چپ: هدر و لیست محصولات */}
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

          {/* ← فیلترهای قابل استفاده مجدد (سمت سرور) */}
          <div className="mb-3">
            <FilterControls
              messages={messages}
              brands={brandOptions}
              categories={[]}     // اگر API داری پر کن
              subCategories={[]}  // اگر API داری پر کن
              onChange={fetchWithFilters}
            />
          </div>

          <ProductsHeader count={items?.length ?? 0} messages={messages} />

          {/* نکته: حالا items از سرور (بعد از فیلتر) جایگزین می‌شود */}
          <ProductsList
            items={items ?? []}
            messages={messages}
            // onRefresh={refetchProducts}
          />

          {loading && (
            <div className="mt-3 text-xs text-neutral-500">
              {messages?.loading }
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

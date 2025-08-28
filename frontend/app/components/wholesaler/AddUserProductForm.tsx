"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { useBrandsByCategory } from "@/app/hooks/useBrandCategory";
import { useProductsByBrand } from "@/app/hooks/useProductsBy‌Brand";
import { toast } from "react-toastify";


export default function AddUserProductForm({ subCategoryId }: { subCategoryId: number }) {
  const t = getUserProductMessages("fa");
  const { api } = useAuthenticatedApi();

  // برندها
  const { items: brands } = useBrandsByCategory(subCategoryId);
  const [brandId, setBrandId] = useState<number | "">("");

  // محصولاتِ همان برند (از هوک خودت)
  const { products, loading: loadingProducts, refresh } = useProductsByBrand(brandId || 0, 1);

  // جستجو روی لیست مدل‌ها
  const [q, setQ] = useState("");
  const filteredProducts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p: any) => (p.modelName || "").toLowerCase().includes(s));
  }, [products, q]);

  const [productId, setProductId] = useState<number | "">("");

  // حالت قیمت دلاری/ریالی
  const [isDollar, setIsDollar] = useState(true);
  const [dollarPrice, setDollarPrice] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [finalPrice, setFinalPrice] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setProductId("");
    setQ("");
    if (brandId) refresh();
  }, [brandId, refresh]);

  const canSubmit = useMemo(() => {
    if (!brandId || !productId) return false;
    return isDollar ? !!dollarPrice : !!finalPrice;
  }, [brandId, productId, isDollar, dollarPrice, finalPrice]);

  async function onSubmit() {
    if (!brandId) return toast.error(t.form.validations.brand);
    if (!productId) return toast.error(t.form.validations.product);
    if (isDollar && !dollarPrice) return toast.error(t.form.validations.dollarPrice);
    if (!isDollar && !finalPrice) return toast.error(t.form.validations.finalPrice);

    setSubmitting(true);
    try {
      await api.post({
        url: "/user-product/create",
        body: {
          productId: Number(productId),
          isDollar,
          dollarPrice: isDollar ? Number(dollarPrice || 0) : null,
          otherCosts: isDollar ? Number(otherCosts || 0) : null,
          finalPrice: isDollar ? null : Number(finalPrice || 0),
        },
      });
      toast.success(t.toasts.updated);
      // پاک‌سازی قیمت‌ها
      setDollarPrice(""); setOtherCosts(""); setFinalPrice("");
    } catch {
      toast.error(t.toasts.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir="rtl" className="grid gap-4">
      {/* کشوی برند */}
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">{t.form.brandLabel}</label>
        <select
          className="rounded-2xl border border-slate-200 p-3 outline-none"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">{t.form.brandLabel}</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>
      </div>

      {/* کشوی مدل با جستجو */}
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">{t.form.productLabel}</label>
        <input
          dir="rtl"
          className="rounded-2xl border border-slate-200 p-3 outline-none"
          placeholder={t.form.searchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={!brandId || loadingProducts}
        />
        <select
          className="mt-2 rounded-2xl border border-slate-200 p-3 outline-none"
          value={productId}
          onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : "")}
          disabled={!brandId || loadingProducts}
        >
          <option value="">{t.form.productLabel}</option>
          {filteredProducts.map((p: any) => (
            <option key={p.id} value={p.id}>{p.modelName}</option>
          ))}
        </select>
      </div>

      {/* سوییچ قیمت دلاری (استایل شبیه تصویر) */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
        <span className="text-sm text-slate-800">{t.form.toggleDollar}</span>
        <button
          type="button"
          onClick={() => setIsDollar(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition
            ${isDollar ? "bg-emerald-500" : "bg-slate-300"}`}
          aria-pressed={isDollar}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition
              ${isDollar ? "translate-x-5" : "translate-x-1"}`}
          />
        </button>
      </div>

      {/* ورودی‌ها مطابق وضعیت سوییچ */}
      {isDollar ? (
        <div className="grid gap-3">
          <input
            inputMode="decimal"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
            placeholder={t.form.dollarPriceLabel}
            value={dollarPrice}
            onChange={(e) => setDollarPrice(e.target.value)}
          />
          <input
            inputMode="decimal"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
            placeholder={t.form.otherCostsLabel}
            value={otherCosts}
            onChange={(e) => setOtherCosts(e.target.value)}
          />
        </div>
      ) : (
        <div className="grid gap-3">
          <input
            inputMode="decimal"
            className="rounded-2xl border border-slate-200 p-3 outline-none"
            placeholder={t.form.finalPriceLabel}
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
          />

          {/* نمایش باکس قیمت فروش شبیه تصویر (فقط وقتی مقدار دارد) */}
          {finalPrice && (
            <div className="rounded-2xl bg-teal-500 text-white text-center py-3 font-medium">
              {t.form.priceTitle} {" "}
              {Number(finalPrice).toLocaleString("fa-IR")} {t.form.currencySuffix}
            </div>
          )}
        </div>
      )}

      {/* نکات پایین فرم */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[13px] leading-6">
        <ul className="list-disc pr-5 space-y-1">
          <li>{t.form.notes.dailyDollar}</li>
          <li>{t.form.notes.fees}</li>
          <li>{t.form.notes.notFound}</li>
        </ul>
      </div>

      {/* دکمه‌ها */}
      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="px-6 py-2 rounded-2xl bg-teal-500 text-white disabled:opacity-50"
        >
          {t.form.addBtn}
        </button>

        <button
          type="button"
          className="px-6 py-2 rounded-2xl border border-teal-500 text-teal-600"
        >
          {t.form.requestBtn}
        </button>
      </div>
    </div>
  );
}

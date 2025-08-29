// app/components/wholesaler/AddUserProductForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { useBrandsByCategory } from "@/app/hooks/useBrandCategory";
import { useProductsByBrand } from "@/app/hooks/useProductsBy‌Brand";
import { toast } from "react-toastify";
import SearchableSelect from "../shared/SearchableSelect";
import MoneyInput from "../shared/MonyInput";


/* --- helpers: digit normalize & grouping --- */
const faToEnMap: Record<string, string> = {
  "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9",
  "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"
};
function toEnDigits(s: string) {
  return s.replace(/[0-9٠-٩۰-۹]/g, (d) => faToEnMap[d] ?? d);
}
function formatMoneyInput(input: string) {
  // اجازه‌ی یک اعشار؛ بقیه حذف
  let s = toEnDigits(input)
    .replace(/[^0-9.٫]/g, "")
    .replace(/٫/g, ".")
    .replace(/(\..*)\./g, "$1"); // فقط اولین نقطه
  const endsWithDot = s.endsWith(".");
  const [intPartRaw, decPart = ""] = s.split(".");
  const intPart = intPartRaw.replace(/^0+(?=\d)/, ""); // پیش‌صفر اضافی
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return endsWithDot ? grouped + "." : (decPart ? `${grouped}.${decPart}` : grouped);
}
function parseMoney(input: string): number {
  const clean = toEnDigits(input).replaceAll(",", "").replace(/٫/g, ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

export default function AddUserProductForm({ subCategoryId }: { subCategoryId: number }) {
  const t = getUserProductMessages("fa");
  const { api } = useAuthenticatedApi();

  // برندها
  const { items: brands } = useBrandsByCategory(subCategoryId);
  const [brandId, setBrandId] = useState<number | "">("");

  // محصولاتِ برند
  const { products, loading: loadingProducts, refresh } = useProductsByBrand(brandId || 0, 1);
  const [productId, setProductId] = useState<number | "">("");

  // حالت قیمت دلاری/ریالی
  const [isDollar, setIsDollar] = useState(true);
  const [dollarPrice, setDollarPrice] = useState(""); // formatted
  const [otherCosts, setOtherCosts] = useState("");   // formatted
  const [finalPrice, setFinalPrice] = useState("");   // formatted

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setProductId("");
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
          brandId: Number(brandId),  // ← اضافه شد
          categoryId: subCategoryId,                          // ← اضافه شد
          isDollar,
          dollarPrice:dollarPrice.replace(/,/g, ""),
          otherCosts: otherCosts.replace(/,/g, ""),
          finalPrice: finalPrice.replace(/,/g, ""),
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
      {/* برند */}
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

      {/* مدل (کمبوباکس قابل جستجو) */}
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">{t.form.productLabel}</label>
        <SearchableSelect
          dir="rtl"
          disabled={!brandId || loadingProducts}
          value={productId}
          onChange={(v) => setProductId(v === "" ? "" : Number(v))}
          items={products.map((p: any) => ({ value: p.id, label: p.modelName }))}
          placeholder={t.form.productLabel}
          searchPlaceholder={t.form.searchPlaceholder}
          noOptionsText={t.empty.title}
        />
      </div>

      {/* سوییچ دلاری */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
        <span className="text-sm text-slate-800">{t.form.toggleDollar}</span>
        <button
          type="button"
          onClick={() => setIsDollar(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition
            ${isDollar ? "bg-emerald-500" : "bg-slate-300"}`}
          aria-pressed={isDollar}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition
            ${isDollar ? "translate-x-5" : "translate-x-1"}`} />
        </button>
      </div>

      {/* ورودی‌ها با فرمت سه‌رقمی */}
      {isDollar ? (
  <div className="grid gap-3">
    <MoneyInput
      placeholder={t.form.dollarPriceLabel}
      value={dollarPrice}
      onChange={setDollarPrice}
      allowDecimal={true}
    />
    <MoneyInput
      placeholder={t.form.otherCostsLabel}
      value={otherCosts}
      onChange={setOtherCosts}
      allowDecimal={true}
    />
  </div>
) : (
  <div className="grid gap-3">
    <MoneyInput
      placeholder={t.form.finalPriceLabel}
      value={finalPrice}
      onChange={setFinalPrice}
      allowDecimal={false}   // قیمت نهایی معمولاً بدون اعشار
    />
    {finalPrice && (
      <div className="rounded-2xl bg-teal-500 text-white text-center py-3 font-medium">
        {t.form.priceTitle} {parseMoney(finalPrice).toLocaleString("fa-IR")} {t.form.currencySuffix}
      </div>
    )}
  </div>
)}


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

// app/components/wholesaler/AddUserProductForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { useBrandsByCategory } from "@/app/hooks/useBrandCategory";
import { useProductsByBrand } from "@/app/hooks/useProductsBy‌Brand";
import { toast } from "react-toastify";
import SearchableSelect from "../shared/SearchableSelect";
import MoneyInput, { formatMoneyInput, parseMoney, toEnDigits } from "../shared/MonyInput"; // ← فقط از همین‌ها استفاده می‌کنیم
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function AddUserProductForm({ subCategoryId }: { subCategoryId: number }) {
  const t = getUserProductMessages("fa");
  const { api } = useAuthenticatedApi();
  const { data: session, status } = useSession();

  // برندها
  const { items: brands } = useBrandsByCategory(subCategoryId);
  const [brandId, setBrandId] = useState<number | "">("");

  // محصولاتِ برند
  const { products, loading: loadingProducts, refresh } = useProductsByBrand(brandId || 0, 1);
  const [productId, setProductId] = useState<number | "">("");

  // نرخ دلار کاربر (به‌صورت digits؛ بخش صحیح، بدون اعشار)
  const [usdRateDigits, setUsdRateDigits] = useState<string>("");

  // حالت قیمت دلاری/ریالی
  const [isDollar, setIsDollar] = useState(true);
  const [dollarPrice, setDollarPrice] = useState(""); // formatted (می‌تواند اعشار داشته باشد)
  const [otherCosts, setOtherCosts] = useState("");   // formatted (تومان؛ بخش صحیح)
  const [finalPrice, setFinalPrice] = useState("");   // formatted (تومان)

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setProductId("");
    if (brandId) refresh();
  }, [brandId, refresh]);

  // گرفتن نرخ دلار کاربر از بک‌اند؛ اعشار حذف می‌شود (فقط بخش صحیح)
  useEffect(() => {
    if (status !== "authenticated") return;
    const uid = (session?.user as any)?.id;
    if (!uid) return;

    (async () => {
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${uid}` });
        const payload = res && typeof res === "object" && "data" in res ? res.data : res;
        const s = toEnDigits(String(payload ?? ""))
          .replace(/,/g, "")
          .replace(/٫/g, ".")
          .split(".")[0]            // ← حذف اعشار
          .replace(/[^0-9]/g, "");
        setUsdRateDigits(s);         // مثل "58000"
      } catch (e) {
        // اگر نداشت، محاسبه فقط با هزینه‌های اضافی انجام می‌شود
        console.log("[AddUserProduct][USD Rate][ERROR]", e);
      }
    })();
  }, [status, session?.user, api]);

  // محاسبهٔ خودکار قیمت نهایی وقتی دلاری است:
  useEffect(() => {
    if (!isDollar) return; // در حالت تومانی، کاربر خودش finalPrice را می‌نویسد

    const usdRate = parseInt(usdRateDigits || "0", 10);         // نرخ دلار (صحیح)
    const dUsd    = parseMoney(dollarPrice);                     // قیمت دلاری (ممکن است اعشار داشته باشد)
    const other   = Math.trunc(parseMoney(otherCosts));          // هزینه‌های اضافی (صحیح)

    const base  = Math.trunc(dUsd * (isNaN(usdRate) ? 0 : usdRate));
    const final = base + other;

    setFinalPrice(formatMoneyInput(String(final)));              // نمایش سه‌رقم‌سه‌رقم
  }, [isDollar, usdRateDigits, dollarPrice, otherCosts]);

  const canSubmit = useMemo(() => {
    if (!brandId || !productId) return false;
    return isDollar ? !!dollarPrice : !!finalPrice;
  }, [brandId, productId, isDollar, dollarPrice, finalPrice]);

  async function onSubmit() {
    if (!brandId) return toast.error(t.form.validations.brand);
    if (!productId) return toast.error(t.form.validations.product);
    if (isDollar && !dollarPrice) return toast.error(t.form.validations.dollarPrice);
    if (!isDollar && !finalPrice) return toast.error(t.form.validations.finalPrice);

    // محاسبهٔ مطمئن قبل از ارسال
    const usdRate = parseInt(usdRateDigits || "0", 10);
    const dUsd    = parseMoney(dollarPrice);
    const other   = Math.trunc(parseMoney(otherCosts));
    const computedFinal = isDollar
      ? Math.trunc(dUsd * (isNaN(usdRate) ? 0 : usdRate)) + other
      : Math.trunc(parseMoney(finalPrice)); // کاربر خودش زده

    setSubmitting(true);
    try {
      await api.post({
        url: "/user-product/create",
        body: {
          productId: Number(productId),
          brandId: Number(brandId),
          categoryId: subCategoryId,
          isDollar,
          dollarPrice: String(dUsd),                 // دلاری (ممکن است اعشاری باشد)
          otherCosts: String(other),                 // تومان (صحیح)
          finalPrice: String(computedFinal),         // تومان (صحیح)
          // usdRate: String(usdRate),               // ← اگر بک‌اند لازم دارد، این را هم بفرست
        },
      });
      toast.success(t.toasts.updated);
      // پاک‌سازی قیمت‌ها
      //setDollarPrice(""); setOtherCosts(""); setFinalPrice("");
      // هدایت به صفحه محصولات
      router.push('/wholesaler/products');
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
          {/* قیمت دلاری کالا (می‌تواند اعشار داشته باشد) */}
          <MoneyInput
            placeholder={t.form.dollarPriceLabel}
            value={dollarPrice}
            onChange={setDollarPrice}
            allowDecimal={true}
          />

          {/* هزینه‌های اضافی به تومان (بدون اعشار) */}
          <MoneyInput
            placeholder={t.form.otherCostsLabel}
            value={otherCosts}
            onChange={setOtherCosts}
            allowDecimal={false}
          />

          {/* نمایش قیمت نهایی محاسبه‌شده */}
          {finalPrice && (
            <div className="rounded-2xl bg-teal-500 text-white text-center py-3 font-medium">
              {t.form.priceTitle} {formatMoneyInput(finalPrice)} {t.form.currencySuffix}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {/* کاربر خودش قیمت نهایی را (تومان) وارد می‌کند */}
          <MoneyInput
            placeholder={t.form.finalPriceLabel}
            value={finalPrice}
            onChange={setFinalPrice}
            allowDecimal={false}   // تومان → بدون اعشار
          />

          {/* نمایش */}
          {finalPrice && (
            <div className="rounded-2xl bg-teal-500 text-white text-center py-3 font-medium">
              {t.form.priceTitle} {formatMoneyInput(finalPrice)} {t.form.currencySuffix}
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
        <Link href={"/wholesaler/products/request"}>
          <button
            type="button"
            className="px-6 py-2 rounded-2xl border border-teal-500 text-teal-600"
          >
            {t.form.requestBtn}
          </button>
        </Link>
      </div>
    </div>
  );
}

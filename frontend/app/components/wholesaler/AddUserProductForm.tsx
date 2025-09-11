// app/components/wholesaler/AddUserProductForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { useBrandsByCategory } from "@/app/hooks/useBrandCategory";
import { useProductsSmallByBrand } from "@/app/hooks/useProductsBy‌Brand";
import { toast } from "react-toastify";
import SearchableSelect from "../shared/SearchableSelect";
import MoneyInput, { formatMoneyInput, parseMoney, toEnDigits } from "../shared/MonyInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductSmallViewModel } from "@/app/types/product/product";

/** آیکن کوچکِ اطلاع‌رسانی (بدون نیاز به کتابخانه) */
function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="8" r="1.2" fill="currentColor" />
      <path d="M12 11.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** کارت راهنما برای نمایش نکته‌ها */
function TipsCard({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <ul className="space-y-2">
        {items.map((txt, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-6 text-slate-700">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{txt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AddUserProductForm({ subCategoryId }: { subCategoryId: number }) {
  const t = getUserProductMessages("fa");
  const { api } = useAuthenticatedApi();
  const { data: session, status } = useSession();

  // برندها
  const { items: brands } = useBrandsByCategory(subCategoryId);
  const [brandId, setBrandId] = useState<number | "">("");

  // محصولاتِ برند
  const { products, loading: loadingProducts, refresh } = useProductsSmallByBrand(brandId || 0);
  const [productId, setProductId] = useState<number | "">("");

  const [usdRateDigits, setUsdRateDigits] = useState<string>("");

  const [isDollar, setIsDollar] = useState(true);
  const [dollarPrice, setDollarPrice] = useState(""); // formatted
  const [otherCosts, setOtherCosts] = useState("");   // formatted (تومان)
  const [finalPrice, setFinalPrice] = useState("");   // formatted (تومان)

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setProductId("");
    if (brandId) refresh();
  }, [brandId, refresh]);

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
          .split(".")[0]
          .replace(/[^0-9]/g, "");
        setUsdRateDigits(s);
      } catch (e) {
        console.log("[AddUserProduct][USD Rate][ERROR]", e);
      }
    })();
  }, [status, session?.user, api]);

  // محاسبه خودکار قیمت نهایی در حالت دلاری
  useEffect(() => {
    if (!isDollar) return;
    const usdRate = parseInt(usdRateDigits || "0", 10);
    const dUsd = parseMoney(dollarPrice);
    const other = Math.trunc(parseMoney(otherCosts));
    const base = Math.trunc(dUsd * (isNaN(usdRate) ? 0 : usdRate));
    const final = base + other;
    setFinalPrice(formatMoneyInput(String(final)));
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

    const usdRate = parseInt(usdRateDigits || "0", 10);
    const dUsd = parseMoney(dollarPrice);
    const other = Math.trunc(parseMoney(otherCosts));
    const computedFinal = isDollar
      ? Math.trunc(dUsd * (isNaN(usdRate) ? 0 : usdRate)) + other
      : Math.trunc(parseMoney(finalPrice));

    setSubmitting(true);
    try {
      await api.post({
        url: "/user-product/create",
        body: {
          productId: Number(productId),
          brandId: Number(brandId),
          categoryId: subCategoryId,
          isDollar,
          dollarPrice: String(dUsd),
          otherCosts: String(other),
          finalPrice: String(computedFinal),
        },
      });
      toast.success(t.toasts.updated);
      router.push("/wholesaler/products");
    } catch {
      toast.error(t.toasts.error);
    } finally {
      setSubmitting(false);
    }
  }

  /** نکته‌ها */
  const tipsDollar: string[] = [
    "قیمت دلاری کالا را وارد کنید؛ قیمت نهایی به‌صورت خودکار با نرخ دلار و هزینه‌های اضافی محاسبه می‌شود.",
    "قیمت دلار را روزانه به‌روز کنید تا قیمت نهایی کالاها به‌روز باشد.",
    "در صورتی که هزینه‌هایی ریالی دارید مانند کرایه بار و… آن را وارد کنید.",
    "اگر محصول مورد نظر را در دیتابیس ما پیدا نکردید، گزینه درخواست محصول را بزنید.",
  ];

  const tipsRial: string[] = [
    "اگر محصول خود را دلاری خریده‌اید، کلید «قیمت دلاری» را فعال کنید.",
    "در حالت ریالی، قیمت نهایی را به تومان وارد کنید.",
    "اگر محصول موردنظر را در دیتابیس ما پیدا نکردید، گزینه درخواست محصول را بزنید.",
  ];

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
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>

      {/* محصول */}
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">{t.form.productLabel}</label>
        <SearchableSelect
          dir="rtl"
          disabled={!brandId || loadingProducts}
          value={productId}
          onChange={(v) => setProductId(v === "" ? "" : Number(v))}
          items={products.map((p: ProductSmallViewModel) => ({ value: p.id, label: p.modelName }))}
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
          onClick={() => setIsDollar((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            isDollar ? "bg-emerald-500" : "bg-slate-300"
          }`}
          aria-pressed={isDollar}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              isDollar ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* ⬇️ نکته‌ها: بسته به حالت دلاری/ریالی */}
      <TipsCard items={isDollar ? tipsDollar : tipsRial} />

      {/* ورودی‌ها */}
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
            allowDecimal={false}
          />
          {finalPrice && (
            <div className="rounded-2xl bg-teal-500 py-3 text-center font-medium text-white">
              {t.form.priceTitle} {formatMoneyInput(finalPrice)} {t.form.currencySuffix}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <MoneyInput
            placeholder={t.form.finalPriceLabel}
            value={finalPrice}
            onChange={setFinalPrice}
            allowDecimal={false}
          />
          {finalPrice && (
            <div className="rounded-2xl bg-teal-500 py-3 text-center font-medium text-white">
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
          className="rounded-2xl bg-teal-500 px-6 py-2 text-white disabled:opacity-50"
        >
          {t.form.addBtn}
        </button>
        <Link href={"/wholesaler/products/request"}>
          <button
            type="button"
            className="rounded-2xl border border-teal-500 px-6 py-2 text-teal-600"
          >
            {t.form.requestBtn}
          </button>
        </Link>
      </div>
    </div>
  );
}

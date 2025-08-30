// app/components/userproduct/UserProductEditModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { UpdateUserProductPayload, UserProductView } from "@/app/types/userproduct/userProduct";
import { getUserProductMessages, UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import MoneyInput, { formatMoneyInput, parseMoney, toEnDigits } from "../shared/MonyInput";

type Props = {
  open: boolean;
  onClose: () => void;
  item: UserProductView;
  onSubmit: (payload: UpdateUserProductPayload) => Promise<void> | void;
  messages?: UserProductMessages;
  subCategoryId?: number; // فقط برای سازگاری؛ استفاده نمی‌شود
};

export default function UserProductEditModal({
  open, onClose, item, onSubmit, messages,
}: Props) {
  const t = messages || getUserProductMessages("fa");
  const { data: session, status } = useSession();
  const { api } = useAuthenticatedApi();

  // حالت و قیمت‌ها
  const [isDollar, setIsDollar] = useState<boolean>((item as any)?.isDollar ?? true);
  const [dollarPrice, setDollarPrice] = useState<string>(
    (item as any)?.dollarPrice ? String(formatMoneyInput(String((item as any).dollarPrice))) : ""
  );
  const [otherCosts, setOtherCosts] = useState<string>(
    (item as any)?.otherCosts ? String(formatMoneyInput(String((item as any).otherCosts))) : ""
  );
  const [finalPrice, setFinalPrice] = useState<string>(
    (item as any)?.finalPrice ? String(formatMoneyInput(String((item as any).finalPrice))) : ""
  );

  // نرخ دلار کاربر (digits؛ بخش صحیح)
  const [usdRateDigits, setUsdRateDigits] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  // ری‌ست مقادیر هنگام باز شدن مودال
  useEffect(() => {
    if (!open) return;
    setIsDollar((item as any)?.isDollar ?? true);
    setDollarPrice((item as any)?.dollarPrice ? String(formatMoneyInput(String((item as any).dollarPrice))) : "");
    setOtherCosts((item as any)?.otherCosts ? String(formatMoneyInput(String((item as any).otherCosts))) : "");
    setFinalPrice((item as any)?.finalPrice ? String(formatMoneyInput(String((item as any).finalPrice))) : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, (item as any).id]);

  // گرفتن نرخ دلار از سرور، همانند فرم افزودن
  useEffect(() => {
    if (!open) return;
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
          .split(".")[0]            // حذف اعشار
          .replace(/[^0-9]/g, "");
        setUsdRateDigits(s);         // مثلا "58000"
      } catch (e) {
        // اگر نداشت، محاسبه صرفاً با سایر هزینه‌ها انجام می‌شود
        console.log("[EditUserProduct][USD Rate][ERROR]", e);
      }
    })();
  }, [open, status, session?.user, api]);

  // محاسبهٔ خودکار قیمت نهایی در حالت دلاری
  useEffect(() => {
    if (!isDollar) return;
    const usdRate = parseInt(usdRateDigits || "0", 10);
    const dUsd    = parseMoney(dollarPrice);            // ممکن است اعشار داشته باشد
    const other   = Math.trunc(parseMoney(otherCosts)); // تومان صحیح
    const base    = Math.trunc(dUsd * (isNaN(usdRate) ? 0 : usdRate));
    const final   = base + other;
    setFinalPrice(final ? formatMoneyInput(String(final)) : "");
  }, [isDollar, usdRateDigits, dollarPrice, otherCosts]);

  const canSubmit = useMemo(() => {
    return isDollar ? !!dollarPrice : !!finalPrice;
  }, [isDollar, dollarPrice, finalPrice]);

  async function handleSubmit() {
    const dUsd  = parseMoney(dollarPrice);
    const other = Math.trunc(parseMoney(otherCosts));
    const fin   = Math.trunc(parseMoney(finalPrice));

    // اگر دلاری است، finalPrice محاسبه‌شده را هم می‌فرستیم
    const computedFinal = isDollar
      ? (Math.trunc(dUsd * (parseInt(usdRateDigits || "0", 10) || 0)) + other)
      : fin;

    const payload: UpdateUserProductPayload = {
      id: (item as any).id,
      isDollar,
      ...(isDollar
        ? {
            dollarPrice: String(dUsd),
            otherCosts: String(other),
            finalPrice: String(computedFinal),
          }
        : {
            finalPrice: String(computedFinal),
          }),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" dir="rtl">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-slate-900">
            {t?.editModal?.title }
          </h3>
        </div>

        <div className="px-5 py-4 grid gap-4">
          {/* سوییچ دلاری */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
            <span className="text-sm text-slate-800">{t.form.toggleDollar}</span>
            <button
              type="button"
              onClick={() => setIsDollar(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isDollar ? "bg-emerald-500" : "bg-slate-300"}`}
              aria-pressed={isDollar}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isDollar ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>

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
              {!!finalPrice && (
                <div className="rounded-2xl bg-teal-500 text-white text-center py-3 font-medium">
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
              {!!finalPrice && (
                <div className="rounded-2xl bg-teal-500 text-white text-center py-3 font-medium">
                  {t.form.priceTitle} {formatMoneyInput(finalPrice)} {t.form.currencySuffix}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex gap-3 justify-start border-t">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-4 py-2 rounded-2xl bg-teal-600 text-white disabled:opacity-50"
          >
            {t?.editModal?.saveBtn}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-2xl border border-slate-300 text-slate-700">
            {t?.editModal?.cancelBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

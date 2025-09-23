// app/components/userproduct/AdjustRialPrices.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Minus, Percent, PercentSquareIcon, PercentCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useAdjustRialPrices } from "@/app/hooks/useAdjustRialPrices";
// مسیر خودت:
import ReusableModal from "../shared/generalModal";

type Labels = {
  button?: string;
  title?: string;
  help?: string;
  placeholder?: string;
  cancel?: string;
  submit?: string;
  footer?: string;
  invalidPercent?: string;
  genericError?: string;
  /** (اختیاری) برچسب‌های موبایل دو خطی */
  mobileLine1?: string; // پیش‌فرض: "تنظیم قیمت"
  mobileLine2?: string; // پیش‌فرض: "تومانی"
};

type Props = {
  className?: string;
  adjustUrl?: string;
  onDone?: () => void | Promise<void>;
  labels?: Labels;
  fullWidth?: boolean;
  step?: number;      // default 0.5
  min?: number;
  max?: number;
};

function stepDecimals(step: number) {
  const s = String(step);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}
function roundToStep(val: number, step: number) {
  if (!Number.isFinite(val)) return 0;
  const inv = 1 / step;
  return Math.round(val * inv) / inv;
}

export default function AdjustRialPrices({
  className,
  adjustUrl,
  onDone,
  labels,
  fullWidth = true,
  step = 0.5,
  min = -1000,
  max = 1000,
}: Props) {
  const {
    button = "تغییر قیمت محصولات تومانی",
    title = "تغییر قیمت محصولات تومانی",
    help = "با گام ۰٫۵٪ مقدار را تغییر دهید. مثال: 10 برای +۱۰٪ یا -5 برای −۵٪.",
    placeholder = "مثلاً 10 یا -5",
    cancel = "انصراف",
    submit = "اعمال تغییر",
    footer = "فقط روی محصولات غیر دلاری اعمال می‌شود .",
    invalidPercent = "درصد معتبر نیست.",
    genericError = "خطا در اعمال تغییر قیمت. دوباره تلاش کنید.",
    mobileLine1 = "تنظیم قیمت",
    mobileLine2 = "تومانی",
  } = labels || {};

  const decs = useMemo(() => stepDecimals(step), [step]);
  const fmt = (v: number) => v.toFixed(decs);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // برای پورتال
  const [percentStr, setPercentStr] = useState("");
  const { submit: doSubmit, isSubmitting, error, setError } = useAdjustRialPrices({ adjustUrl });

  useEffect(() => setMounted(true), []);

  const openModal = () => {
    setError(null);
    setPercentStr("");
    setOpen(true);
  };

  const parseVal = (s: string) => {
    const v = parseFloat(s.replace(/,/g, ""));
    return Number.isFinite(v) ? v : NaN;
  };
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const bump = (dir: 1 | -1) => {
    const cur = parseVal(percentStr);
    const base = Number.isFinite(cur) ? cur : 0;
    const next = clamp(roundToStep(base + dir * step, step));
    setPercentStr(fmt(next));
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); bump(1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); bump(-1); }
  };

  const onBlurSnap = () => {
    const cur = parseVal(percentStr);
    if (!Number.isFinite(cur)) return;
    const snapped = clamp(roundToStep(cur, step));
    setPercentStr(fmt(snapped));
  };

  const handleSubmit = async () => {
    setError(null);
    const raw = parseVal(percentStr);
    if (!Number.isFinite(raw)) {
      setError(invalidPercent);
      return;
    }
    const snapped = clamp(roundToStep(raw, step));
    try {
      await doSubmit(snapped);
      setOpen(false);
      setPercentStr("");
      await onDone?.();
    } catch {
      if (!error) setError(genericError);
    }
  };

  return (
    <>
      {/* موبایل: tile هم‌استایل با اسکرین‌شات */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={openModal}
          className="w-full group rounded-2xl border bg-white px-2 py-2.5 text-center shadow-sm active:scale-[0.98] transition"
          aria-label="تغییر قیمت تومانی"
          title="تغییر قیمت تومانی"
        >
          <div className="mx-auto grid place-items-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
            <PercentCircle className="w-5 h-5" />
          </div>
          <div className="mt-1.5 text-[11px] leading-4 text-neutral-800 font-medium">
            <span>{mobileLine1}</span>
            <br />
            <span>{mobileLine2}</span>
          </div>
        </button>
      </div>

      {/* دسکتاپ: دکمهٔ قبلی بدون تغییر */}
      <div className="hidden lg:block">
        <button
          type="button"
          onClick={openModal}
          className={[
            fullWidth ? "w-full" : "",
            "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium bg-amber-50 hover:bg-amber-100 border-amber-300",
            className || "",
          ].join(" ")}
        >
          {button}
        </button>
      </div>

      {/* پورتال: مودال داخل body رندر می‌شود */}
      {mounted && open && createPortal(
        <ReusableModal
          isOpen={open}
          onClose={() => !isSubmitting && setOpen(false)}
          title={title}
          size="md"
        >
          <div dir="rtl">
            <p className="text-xs text-neutral-500 mb-3">{help}</p>

            <div className="flex items-stretch gap-2" dir="ltr">
              <button
                type="button"
                onClick={() => bump(-1)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl border px-2 py-2"
                aria-label="decrease by step"
                title={`-${fmt(step)}%`}
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                inputMode="decimal"
                step={step}
                min={min}
                max={max}
                placeholder={placeholder}
                value={percentStr}
                onChange={(e) => setPercentStr(e.target.value)}
                onBlur={onBlurSnap}
                onKeyDown={onInputKeyDown}
                className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />

              <button
                type="button"
                onClick={() => bump(1)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl border px-2 py-2"
                aria-label="increase by step"
                title={`+${fmt(step)}%`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {error && <div className="mt-2 text-[12px] text-red-600">{error}</div>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                {cancel}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 text-sm disabled:opacity-60"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                )}
                {submit}
              </button>
            </div>

            <div className="mt-3 text-[11px] text-neutral-500">{footer}</div>
          </div>
        </ReusableModal>,
        document.body
      )}
    </>
  );
}

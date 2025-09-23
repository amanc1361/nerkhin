"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { ShareIcon, DollarSign, FileDown, PlusCircle, PercentSquareIcon } from "lucide-react";

// ⬇️ NEW
import AdjustRialPrices from "@/app/components/userproduct/AdjustRialPrices";

type Props = {
  usdPrice?: number | string | null;
  addHref: string;
  onShareJpg?: () => void;
  onSharePdf?: () => void;
  onShare?: () => void;
  messages: UserProductMessages;

  usdEditable?: boolean;
  onUsdChange?: (val: string) => void;
  onUsdSave?: () => void;

  /** اگر پاس داده شود، با کلیک روی «دلار» مودال باز می‌شود */
  onOpenUsdModal?: () => void;
};

export default function ProductsToolbar({
  usdPrice,
  addHref,
  onShareJpg,
  onSharePdf,
  onShare,
  messages,
  usdEditable = false,
  onUsdChange,
  onUsdSave,
  onOpenUsdModal,
}: Props) {
  const priceStr = String(usdPrice ?? "");
  const [localUsd, setLocalUsd] = useState<string>(priceStr);

  useEffect(() => {
    setLocalUsd(priceStr);
  }, [priceStr]);

  const share = () => {
    if (onShare) return onShare();
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any)
        .share({ title: messages.toolbar.priceList })
        .catch(() => {});
    }
  };

  const useModalForDollar = Boolean(onOpenUsdModal);

  return (
    <div dir="rtl" className="space-y-3">
      {/* ===== موبایل: هدر کوچک + ردیف سه‌تایی اکشن‌ها ===== */}
      <div className="lg:hidden space-y-2">
        {/* ردیف سه‌تایی جمع‌وجور (هر سه در یک ردیف) */}
        <div className="grid grid-cols-4 gap-2">
          {/* کاشی دلار */}
          <button
            type="button"
            onClick={onOpenUsdModal}
            className="group rounded-2xl border bg-white px-2 py-2.5 text-center shadow-sm active:scale-[0.98] transition"
            aria-label="تنظیم قیمت دلار"
            title="تنظیم قیمت دلار"
          >
            <div className="mx-auto grid place-items-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="mt-1.5 text-[11px] leading-4 text-neutral-600">
              {messages.toolbar.dollarPrice("")}{" "}
              <span className="font-medium text-neutral-800">
                {localUsd || "—"} $
              </span>
            </div>
          </button>
          <div className="">
          <AdjustRialPrices fullWidth step={0.5} />
        </div>

          {/* کاشی PDF */}
          <Link
            href={"/api/price-list"}
            className="group rounded-2xl border bg-white px-2 py-2.5 text-center shadow-sm active:scale-[0.98] transition"
            aria-label={messages.toolbar.pdf}
            title={messages.toolbar.pdf}
          >
            <div className="mx-auto grid place-items-center w-9 h-9 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100">
              <FileDown className="w-5 h-5" />
            </div>
            <div className="mt-1.5 text-[11px] leading-4 text-neutral-800 font-medium">
              {messages.toolbar.pdf}
            </div>
          </Link>

          {/* کاشی افزودن کالا */}
          <Link
            href={addHref}
            className="group rounded-2xl border bg-white px-2 py-2.5 text-center shadow-sm active:scale-[0.98] transition"
            aria-label={messages.toolbar.addProduct}
            title={messages.toolbar.addProduct}
          >
            <div className="mx-auto grid place-items-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="mt-1.5 text-[11px] leading-4 text-neutral-800 font-medium">
              {messages.toolbar.addProduct}
            </div>
          </Link>
        </div>

        {/* ⬇️ NEW: دکمهٔ تغییر قیمت ریالی (زیر ردیف سه‌تایی تا Grid به‌هم نخوره) */}
        
      </div>

      {/* ===== دسکتاپ: همان نسخه ستونی قبلی ===== */}
      <div className="hidden lg:block">
        <div className="rounded-2xl flex flex-col border bg-white p-3 space-y-3 shadow-sm">
          <div className="text-sm font-medium text-neutral-700 mb-1">
            {messages.toolbar.priceList}
          </div>

          <div className="flex flex-col gap-4 space-y-2">
            <Link href={"/api/price-list"}>
              <div className="flex w-full px-3 py-2 rounded-lg border text-rose-600 hover:bg-rose-50 items-center justify-center">
                {messages.toolbar.pdf}
              </div>
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            <label className="text-xs text-neutral-500">
              {messages.toolbar.dollarPrice("")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type={useModalForDollar ? "text" : "number"}
                inputMode={useModalForDollar ? "text" : "numeric"}
                readOnly={useModalForDollar || !usdEditable}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  useModalForDollar ? "cursor-pointer bg-white" : ""
                }`}
                value={localUsd}
                onClick={useModalForDollar ? onOpenUsdModal : undefined}
                onFocus={useModalForDollar ? onOpenUsdModal : undefined}
                onChange={(e) => {
                  if (useModalForDollar) return;
                  setLocalUsd(e.target.value);
                  onUsdChange?.(e.target.value);
                }}
                aria-label="قیمت دلار"
              />
              {!useModalForDollar && usdEditable && (
                <button
                  onClick={onUsdSave}
                  className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm"
                >
                  {messages.toolbar.save}
                </button>
              )}
            </div>
          </div>

          {/* ⬇️ NEW: دکمهٔ تغییر قیمت ریالی (قبل از افزودن کالا) */}
          <AdjustRialPrices fullWidth step={0.5} />

          <Link
            href={addHref}
            className="block w-full rounded-lg bg-neutral-100 text-center py-2.5 text-sm text-neutral-700"
          >
            {messages.toolbar.addProduct}
          </Link>
        </div>
      </div>
    </div>
  );
}

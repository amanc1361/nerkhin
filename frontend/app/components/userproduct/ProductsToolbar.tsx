"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { ShareIcon } from "lucide-react";

type Props = {
  usdPrice?: number | string | null;
  addHref: string;
  onShareJpg?: () => void;
  onSharePdf?: () => void;
  onShare?: () => void;
  messages: UserProductMessages;

  // حالت قبلی دسکتاپ (ورودی داخل خود تولبار)
  usdEditable?: boolean;
  onUsdChange?: (val: string) => void;
  onUsdSave?: () => void;

  // ← جدید: اگر پاس داده شود، از همین جا مودال را باز می‌کنیم
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
      (navigator as any).share({ title: messages.toolbar.priceList }).catch(() => {});
    }
  };

  // اگر مودال را از اینجا باز می‌کنیم، ورودی دسکتاپ فقط خواندنی باشد
  const useModalForDollar = Boolean(onOpenUsdModal);

  return (
    <div dir="rtl" className="space-y-3">
      {/* ======= موبایل (<= lg-) : همان چینش چیپ افقی قبلی ======= */}
      <div className="flex bg-gray-100 rounded-2xl items-center px-4 justify-between lg:hidden">
        <span>{messages.toolbar.priceList}</span>
        <div className="flex items-center gap-2">
          <div>
            
         
            <Link
              
              href={"/api/price-list"}
              
              
              className="rounded-full px-3 py-1.5 text-sm bg-rose-50 text-rose-600"
            >
              {messages.toolbar.pdf}
            </Link>

            <button
              type="button"
              onClick={onShareJpg}
              className="rounded-full px-3 py-1.5 text-sm bg-fuchsia-50 text-fuchsia-700"
            >
              {messages.toolbar.jpg}
            </button>

            <button
              type="button"
              onClick={share}
              title={messages.toolbar.share}
              className="rounded-full p-2.5 bg-sky-50 text-sky-700"
            >
              <ShareIcon className="h-5 w-5 text-sky-700" />
            </button>
          </div>
        </div>
      </div>

      {/* دکمه/نوار آبی (موبایل) → از همین‌جا مودال باز می‌شود */}
      <div className="lg:hidden w-full">
        <button
          type="button"
          onClick={onOpenUsdModal}
          className="w-full rounded-xl bg-blue-600 text-white text-center py-3 text-sm flex items-center justify-center gap-2"
          aria-label="تنظیم قیمت دلار"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth="1.6">
            <path d="M12 1v22" />
            <path d="M17 5.5c0-1.933-2.239-3.5-5-3.5S7 3.567 7 5.5 9.239 9 12 9s5 1.567 5 3.5S14.761 16 12 16 7 14.433 7 12.5" />
          </svg>
          {messages.toolbar.dollarPrice(localUsd || "—")} {" $"}
        </button>
      </div>

      <Link
        href={addHref}
        className="lg:hidden block w-full rounded-xl bg-neutral-100 text-center py-3 text-sm text-neutral-600"
      >
        {messages.toolbar.addProduct}
      </Link>

      {/* ======= دسکتاپ (lg+) : سایدبار عمودی در ستون راست ======= */}
      <div className="hidden lg:block">
        <div className="rounded-2xl border bg-white p-3 space-y-3 shadow-sm">
          {/* عنوان کوچک */}
          <div className="text-sm font-medium text-neutral-700 mb-1">
            {messages.toolbar.priceList}
          </div>

          {/* دکمه‌ها: JPG / PDF / اشتراک */}
          <div className="space-y-2">
            <button
              onClick={onShareJpg}
              className="w-full rounded-lg border px-3 py-2 text-sm text-fuchsia-700 hover:bg-fuchsia-50"
            >
              {messages.toolbar.jpg}
            </button>
            <Link
              href={"/api/price-list"}
              className="w-full rounded-lg border px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              {messages.toolbar.pdf}
            </Link>
            <button
              onClick={share}
              className="w-full rounded-lg border px-3 py-2 text-sm text-sky-700 hover:bg-sky-50 inline-flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="1.8">
                <path strokeLinecap="round" d="M12 5v7m0-7l-3 3m3-3l3 3" />
                <path d="M7 11a5 5 0 108 4h2a7 7 0 11-10-6z" />
              </svg>
              {messages.toolbar.share}
            </button>
          </div>

          {/* ورودی/نمایش قیمت دلار (جای اصلی خودش) */}
          <div className="mt-3 space-y-2">
            <label className="text-xs text-neutral-500">
              {messages.toolbar.dollarPrice("")}
            </label>

            {/* اگر onOpenUsdModal داشته باشیم، ورودی فقط‌خواندنی است و با کلیک مودال باز می‌شود */}
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
                  // فقط اگر مودال نداریم و حالت ادیت فعاله، تغییر را به والد بده
                  if (useModalForDollar) return;
                  setLocalUsd(e.target.value);
                  onUsdChange?.(e.target.value);
                }}
                aria-label="قیمت دلار"
              />

              {/* اگر مودال داریم، دکمهٔ ذخیرهٔ داخلی نمایش داده نشود */}
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

          {/* افزودن محصول */}
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

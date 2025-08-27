"use client";

import Link from "next/link";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";

type Props = {
  usdPrice?: number | string | null;
  addHref: string;
  onShareJpg?: () => void;
  onSharePdf?: () => void;
  onShare?: () => void;
  messages: UserProductMessages;
};

export default function ProductsToolbar({
  usdPrice,
  addHref,
  onShareJpg,
  onSharePdf,
  onShare,
  messages,
}: Props) {
  const priceLabel = messages.toolbar.dollarPrice(String(usdPrice ?? "—"));

  const share = () => {
    if (onShare) return onShare();
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any).share({ title: messages.toolbar.priceList }).catch(() => {});
    }
  };

  return (
    <div dir="rtl" className="space-y-3">
      {/* --- ردیف چیپ‌ها: لیست قیمت / PDF / JPG  +  دکمهٔ اشتراک (دایره آبی) --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* لیست قیمت: پس‌زمینه‌ی خاکستری خیلی روشن + آیکن فایل سمت راست متن */}
          <button
            type="button"
            title={messages.toolbar.priceList}
            className="flex flex-row-reverse items-center gap-1 rounded-2xl bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth="1.6">
              <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
              <path d="M14 3v5h5" />
            </svg>
            <span>{messages.toolbar.priceList}</span>
          </button>

          {/* PDF: چیپ قرمز کم‌رنگ */}
          <button
            type="button"
            onClick={onSharePdf}
            className="rounded-full px-3 py-1.5 text-sm bg-rose-50 text-rose-600"
          >
            {messages.toolbar.pdf}
          </button>

          {/* JPG: چیپ بنفش کم‌رنگ */}
          <button
            type="button"
            onClick={onShareJpg}
            className="rounded-full px-3 py-1.5 text-sm bg-fuchsia-50 text-fuchsia-700"
          >
            {messages.toolbar.jpg}
          </button>
        </div>

        {/* اشتراک: فقط آیکن در دایره‌ی آبی کم‌رنگ */}
        <button
          type="button"
          onClick={share}
          title={messages.toolbar.share}
          className="rounded-full p-2.5 bg-sky-50 text-sky-700"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth="1.8">
            <path strokeLinecap="round" d="M12 5v7m0-7l-3 3m3-3l3 3" />
            <path d="M7 11a5 5 0 108 4h2a7 7 0 11-10-6z" />
          </svg>
        </button>
      </div>

      {/* دکمه آبی «قیمت دلار: … $» */}
      <div className="w-full">
        <div className="w-full rounded-xl bg-blue-600 text-white text-center py-3 text-sm flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth="1.6">
            <path d="M12 1v22" />
            <path d="M17 5.5c0-1.933-2.239-3.5-5-3.5S7 3.567 7 5.5 9.239 9 12 9s5 1.567 5 3.5S14.761 16 12 16 7 14.433 7 12.5" />
          </svg>
          {priceLabel} {" $"}
        </div>
      </div>

      {/* دکمهٔ خاکستری افزودن محصول */}
      <Link href={addHref} className="block w-full rounded-xl bg-neutral-100 text-center py-3 text-sm text-neutral-600">
        {messages.toolbar.addProduct}
      </Link>
    </div>
  );
}

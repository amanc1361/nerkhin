"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ProductShop } from "@/app/types/userproduct/ProductInfoViewModel";
import { Phone } from "lucide-react";
import PersianDate from "@/app/utils/persiadate";
// ❌ Link را حذف کردیم تا a داخل a نشود
// import Link from "next/link";

type Messages = { call: string; city: string };
type Props = { t: Messages; item: ProductShop };

function absolutizeUploads(u?: string | null) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = u.replace(/^\/+/, "");
  return clean.startsWith("uploads/")
    ? `${host}/${clean}`
    : `${host}${prefix}/${clean}`;
}

const toPriceNum = (p: string | number) =>
  typeof p === "number" ? p : Number(String(p).replace(/[^\d.]/g, "")) || 0;

export default function ShopOfferItem({ t, item }: Props) {
  const [liked, setLiked] = useState(item.isLiked);
  const imgSrc = useMemo(() => absolutizeUploads(item.defaultImageUrl), [item.defaultImageUrl]);
  const dateTxt = useMemo(() => item.updatedAt, [item.updatedAt]);
  const price = useMemo(
    () => new Intl.NumberFormat("fa-IR").format(toPriceNum(item.finalPrice)),
    [item.finalPrice]
  );

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // جلوگیری از کلیک روی لینک والد
    setLiked((v) => !v);
    // TODO: اینجا ریکویست like/unlike خودت رو بزن
  };

  const handleTelClick = (ph: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // جلوگیری از تریگر شدن لینک والد
    window.location.href = `tel:${ph}`;
  };

  return (
    <div className="py-3" dir="rtl">
      {/* ردیف بالا */}
      <div className="flex justify-between gap-3">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
            {imgSrc ? (
              <Image src={imgSrc} alt={item.shopName ?? ""} fill sizes="56px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M4 5h16v14H4z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 15l3-3 3 3 3-4 3 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="1.5" />
                </svg>
              </div>
            )}
          </div>

          {/* متن کنار تصویر */}
          <div className="flex-1">
            <div className="text-lg font-extrabold leading-6">{price}</div>
            <div className="text-sm text-gray-700">
              {item.shopName || "—"} {item.shopCity}
            </div>
          </div>
        </div>

        {/* تاریخ */}
        <div className="text-xs text-gray-500 w-16 shrink-0 text-left">
          <PersianDate value={dateTxt} />
        </div>
      </div>

      {/* ردیف پایین */}
      <div className="mt-2 flex pt-2 border-t border-gray-100">
        {/* لایک */}
        <div className="flex gap-2 w-full items-center justify-center place-items-center border-l-2">
          <div>
            <button
              type="button"
              onClick={handleLikeClick}
              aria-label="favorite"
              className="ms-auto p-1"
              title="علاقه‌مندی"
            >
              {liked ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                  <path
                    d="M12 17.3l-6.2 3.7 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.7 7.1.6-5.4 4.7 1.6 7z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400">
                  <path
                    d="M12 17.3l-6.2 3.7 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.7 7.1.6-5.4 4.7 1.6 7z"
                    fill="currentColor"
                    opacity=".4"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="text-sm text-gray-700">{item.likesCount ?? 0}</div>
        </div>

        {/* تماس */}
        <div className="flex items-center gap-2 w-full justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {( [item.shopPhone1, item.shopPhone2, item.shopPhone3].filter(Boolean) as string[] )
              .slice(0, 1)
              .map((ph, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t.call}
                  onClick={handleTelClick(ph)}
                  className="inline-flex items-center gap-1 hover:text-gray-900"
                >
                  <Phone />
                  {ph}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

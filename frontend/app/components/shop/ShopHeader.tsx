"use client";

import { ShopViewModel } from "@/app/types/userproduct/userProduct";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Telegram from "../icon-components/Telegram";
import { jsx } from "react/jsx-runtime";
import Instagram from "../icon-components/Instagram";
import WhatsApp from "../icon-components/WhatsApp";

/* --- افزوده‌ها (بدون تغییر در ساختار اصلی) --- */
import { useMemo, useState, useCallback } from "react";

import { toast } from "react-toastify";
import { useFavoriteAccountActions } from "@/app/hooks/useFavoriteAccountAction";
// 🔧 اصلاح ۱: مسیر صحیحِ هوک (Actions جمع است)

/* --------------------------------------------- */

function absolutizeUploads(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = String(url).replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

type Props = {
  t: any;            // از getUserProductMessages
  info: ShopViewModel;
  onToggleLike?: () => void; // اختیاری: اگر خواستی از بیرون مدیریت لایک کنی
};

export default function ShopHeader({ t, info }: Props) {
  const router = useRouter();
  const title = info?.shopInfo?.shopName || (t?.shop?.titleFallback ?? "");
  const likes = info?.shopInfo?.likesCount ?? 0;

  /* --- افزوده‌ها: وضعیت لایک محلی و اکشن‌ها --- */
  const initialLiked = Boolean((info as any)?.shopInfo?.isLikedByViewer);
  const initialFavoriteId = (info as any)?.shopInfo?.favoriteId as number | null | undefined;

  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(likes);
  const [favoriteId, setFavoriteId] = useState<number | null | undefined>(initialFavoriteId);
 
  // استخراج شناسهٔ کاربر صاحب فروشگاه
  const targetUserId = useMemo(() => {
    return Number((info as any)?.shopInfo?.ownerUserId || (info as any)?.shopInfo?.userId || 0);
  }, [info]);

  const { addToFavorites, removeFavoritesByIds, isSubmitting } = useFavoriteAccountActions(() => {
    // بعد از موفقیت، اگر لازم بود SWR/state بیرونی را به‌روزرسانی کن
  });

  const handleInternalToggleLike = useCallback(async () => {
 
    if (!targetUserId) return;
    try {
      if (!liked) {
        // افزودن به علاقه‌مندی‌ها
        const id = await addToFavorites(targetUserId);
        if (typeof id === "number") setFavoriteId(id);
        setLiked(true);
        setLikesCount((n) => n + 1);
      } else {
        // حذف از علاقه‌مندی‌ها: نیاز به favoriteId
        if (favoriteId) {
          await removeFavoritesByIds([favoriteId]);
          setLiked(false);
          setLikesCount((n) => (n > 0 ? n - 1 : 0));
          setFavoriteId(null);
        } else {
          toast.warn("شناسهٔ علاقه‌مندی در دسترس نیست. لطفاً صفحه را رفرش کنید.");
        }
      }
    } catch {
      /* toast داخل هوک */
    }
  }, [liked, favoriteId, targetUserId, addToFavorites, removeFavoritesByIds]);
  /* ------------------------------------------------ */

  const handleShowMap = () => {
    if (info?.shopInfo?.lat && info?.shopInfo?.lng) {
      const q = `${info.shopInfo.lat},${info.shopInfo.lng}`;
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`, "_blank");
    }
  };

  const socials = [
    {
      key: "instagramUrl",
      label: "Instagram",
      href: info?.shopInfo?.instagramUrl,
      Component: (
        <a
          href={info?.shopInfo?.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <Instagram />
        </a>
      ),
    },
    { key: "telegramUrl", label: "Telegram", href: info?.shopInfo?.telegramUrl ,Component: <Telegram />},
    { key: "whatsappUrl", label: "WhatsApp", href: info?.shopInfo?.whatsappUrl ,Component: <WhatsApp />},
    { key: "websiteUrl", label: "Website", href: info?.shopInfo?.websiteUrl ,Component: <Telegram />},
  ].filter(x => !!x.href);

  return (
    <div dir="rtl" className="text-right">
      {/* ───── Hero ───── */}
      <div className="relative w-full h-64 md:h-64 rounded-2xl overflow-hidden">
        <Image
          src={absolutizeUploads(info?.shopInfo?.imageUrl) || "/images/placeholders/shop-banner.jpg"}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {/* overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

        {/* Back button (top-left) */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/90 hover:bg-white shadow"
          aria-label={t?.common?.back ?? "بازگشت"}
          title={t?.common?.back ?? "بازگشت"}
        >
          {/* chevron-right (RTL یعنی برگشت به عقب) */}
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M15 18L9 12l6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Like/Favorite (top-right) */}
        <button
          type="button"
          // 🔧 اصلاح ۲: اگر prop بیرونی نبود، هندلر داخلی اجرا شود
          onClick={ handleInternalToggleLike}
          
          // 🔧 اصلاح ۳: جلوگیری از کلیک‌های بی‌اثر
          // disabled={isSubmitting || !targetUserId}
          className={`absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-xl shadow ${
            liked ? "bg-yellow-400 text-white" : "bg-white/90 hover:bg-white"
          }`}
          aria-label={t?.shop?.likeBtn ?? "پسند"}
          title={t?.shop?.likeBtn ?? "پسند"}
        >
          {/* star */}
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
              fill="currentColor"/>
          </svg>
        </button>

        {/* Title & likes (centered) */}
        <div className="absolute inset-x-4 bottom-5 text-center text-white">
          <div className="text-lg font-bold drop-shadow">{title}</div>
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 text-sm">
            {/* small star */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                fill="currentColor"/>
            </svg>
            <span>{likesCount}</span>
            <span className="opacity-90">{t?.shop?.likes ?? "پسندها"}</span>
          </div>
        </div>
      </div>

      {/* ───── Actions row under hero ───── */}
      <div className="mt-3 px-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleShowMap}
          className="flex items-center justify-center gap-2 py-2 border rounded-2xl text-sm"
          aria-label={t?.shop?.showOnMap ?? "نمایش روی نقشه"}
          title={t?.shop?.showOnMap ?? "نمایش روی نقشه"}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
              fill="currentColor"/>
          </svg>
          {t?.shop?.showOnMap ?? "نمایش روی نقشه"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/report")}
          className="flex items-center justify-center gap-2 py-2 border rounded-2xl text-sm"
          aria-label={t?.shop?.report ?? "گزارش تخلف"}
          title={t?.shop?.report ?? "گزارش تخلف"}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M3 3h18v4H3V3zm0 6h18v12H3V9zm10 3H6v6h7v-6z" fill="currentColor"/>
          </svg>
          {t?.shop?.report ?? "گزارش تخلف"}
        </button>
      </div>

      {/* ───── Address / Phones / City ───── */}
      <div className="mt-3 px-4 space-y-3 text-sm">
        {info?.shopInfo?.shopAddress && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.address ?? "آدرس"}</span>
            <span className="leading-6">{info.shopInfo.shopAddress}</span>
          </div>
        )}

        {(info?.shopInfo?.shopPhone1 || info?.shopInfo?.shopPhone2) && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.phones ?? "تلفن"}</span>
            <span className="leading-6 ltr">
              {info.shopInfo?.shopPhone1 || ""}
              {info.shopInfo?.shopPhone1 && info.shopInfo?.shopPhone2 ? " | " : ""}
              {info.shopInfo?.shopPhone2 || ""}
            </span>
          </div>
        )}

        {info?.shopInfo?.city && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.city ?? "شهر"}</span>
            <span>{info.shopInfo.city}</span>
          </div>
        )}
      </div>

      {/* ───── Social icons ───── */}
      {socials.length > 0 && (
        <div className="mt-3 px-4 flex items-center justify_between gap-3">
          {socials.map((s) => (
            <a
              key={s.key}
              href={s.href as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border hover:bg-gray-50"
              aria-label={s.label}
              title={s.label}
            >
             
              {s.Component}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

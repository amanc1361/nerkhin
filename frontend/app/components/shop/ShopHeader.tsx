"use client";

import { ShopViewModel } from "@/app/types/userproduct/userProduct";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useFavoriteAccountActions } from "@/app/hooks/useFavoriteAccountAction";

import Telegram from "../icon-components/Telegram";
import Instagram from "../icon-components/Instagram";
import WhatsApp from "../icon-components/WhatsApp";
import ReportModal from "../report/ReportModal";
import { Globe } from "lucide-react";
import SocialIcons, { SocialItem } from "../shared/SocialItem";

function absolutizeUploads(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerrkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = String(url).replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

type Props = {
  t: any;            // پیام‌ها از buildShopLabels و دیکشنری‌های پروژه
  info: ShopViewModel;
  onToggleLike?: () => void;
};

export default function ShopHeader({ t, info }: Props) {
  const router = useRouter();
  const title = info?.shopInfo?.shopName || (t?.shop?.titleFallback ?? "");
  const likes = info?.shopInfo?.likesCount ?? 0;

  const initialLiked = Boolean((info as any)?.shopInfo?.isLikedByViewer);
  const initialFavoriteId = (info as any)?.shopInfo?.favoriteId as number | null | undefined;

  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(likes);
  const [favoriteId, setFavoriteId] = useState<number | null | undefined>(initialFavoriteId);

  // مودال گزارش
  const [showReport, setShowReport] = useState(false);

  // شناسه صاحب فروشگاه
  const targetUserId = useMemo(() => {
    return Number((info as any)?.shopInfo?.ownerUserId || (info as any)?.shopInfo?.userId || 0);
  }, [info]);

  const { addToFavorites, removeFavoritesByIds } = useFavoriteAccountActions(() => {});

  const handleInternalToggleLike = useCallback(async () => {
    if (!targetUserId) return;
    try {
      if (!liked) {
        const id = await addToFavorites(targetUserId);
        if (typeof id === "number") setFavoriteId(id);
        setLiked(true);
        setLikesCount((n) => n + 1);
      } else {
        if (favoriteId) {
          await removeFavoritesByIds([favoriteId]);
          setLiked(false);
          setLikesCount((n) => (n > 0 ? n - 1 : 0));
          setFavoriteId(null);
        } else {
          // پیام از t گرفته نمی‌شود تا هاردکد نشود؛ در صورت نیاز کلید متن مناسب به دیکشنری اضافه کن
          toast.warn("");
        }
      }
    } catch {
      // توست داخل هوک مدیریت می‌شود
    }
  }, [liked, favoriteId, targetUserId, addToFavorites, removeFavoritesByIds]);

  const handleShowMap = () => {
    console.log(info)
    if (info?.shopInfo?.latitude && info?.shopInfo?.longitude) {
      const q = `${info.shopInfo.latitude},${info.shopInfo.longitude}`;
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`, "_blank");
    }
  };

  const socials: SocialItem[] = [
    { key: "instagramUrl", label: "Instagram", href: info?.shopInfo?.instagramUrl, Icon: Instagram },
    { key: "telegramUrl",  label: "Telegram",  href: info?.shopInfo?.telegramUrl,  Icon: Telegram },
    { key: "whatsappUrl",  label: "WhatsApp",  href: info?.shopInfo?.whatsappUrl,  Icon: WhatsApp },
    { key: "websiteUrl",   label: "Website",   href: info?.shopInfo?.websiteUrl,   Icon: Globe },
  ];



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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/90 hover:bg-white shadow"
          aria-label={t?.common?.back ?? ""}
          title={t?.common?.back ?? ""}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M15 18L9 12l6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Like */}
        <button
          type="button"
          onClick={handleInternalToggleLike}
          className={`absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-xl shadow ${
            liked ? "bg-yellow-400 text-white" : "bg-white/90 hover:bg-white"
          }`}
          aria-label={t?.shop?.likeBtn ?? ""}
          title={t?.shop?.likeBtn ?? ""}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Title & likes */}
        <div className="absolute inset-x-4 bottom-5 text-center text-white">
          <div className="text-lg font-bold drop-shadow">{title}</div>
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 text-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path
                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                fill="currentColor"
              />
            </svg>
            <span>{likesCount}</span>
            <span className="opacity-90">{t?.shop?.likes ?? ""}</span>
          </div>
        </div>
      </div>

      {/* ───── Actions row ───── */}
      <div className="mt-3 px-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleShowMap}
          className="flex items-center justify-center gap-2 py-2 border rounded-2xl text-sm"
          aria-label={t?.shop?.showOnMap ?? ""}
          title={t?.shop?.showOnMap ?? ""}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="currentColor" />
          </svg>
          {t?.shop?.showOnMap ?? ""}
        </button>

        <button
          type="button"
          onClick={() => setShowReport(true)}
          className="flex items-center justify-center gap-2 py-2 border rounded-2xl text-sm"
          aria-label={t?.shop?.report ?? ""}
          title={t?.shop?.report ?? ""}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M3 3h18v4H3V3zm0 6h18v12H3V9zm10 3H6v6h7v-6z" fill="currentColor" />
          </svg>
          {t?.shop?.report ?? ""}
        </button>
      </div>

      {/* ───── Address / Phones / City ───── */}
      <div className="mt-3 px-4 space-y-3 text-sm">
        {info?.shopInfo?.shopAddress && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.address ?? "آدرس:"}</span>
            <span className="leading-6">{info.shopInfo.shopAddress}</span>
          </div>
        )}

        {(info?.shopInfo?.shopPhone1 || info?.shopInfo?.shopPhone2) && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.phones ?? "شماره تلفن:"}</span>
            <span className="leading-6 ltr">
              {info.shopInfo?.shopPhone1 || ""}
              {info.shopInfo?.shopPhone1 && info.shopInfo?.shopPhone2 ? " | " : ""}
              {info.shopInfo?.shopPhone2 || ""}
            </span>
          </div>
        )}

        {info?.shopInfo?.city && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.city ?? ""}</span>
            <span>{info.shopInfo.city}</span>
          </div>
        )}
      </div>

      {/* ───── Social icons ───── */}
      {socials.length > 0 && (
        <SocialIcons socials={socials} className="mt-3 px-4 flex items-center justify_between gap-3" />
      )}



      {/* ───── Report Modal ───── */}
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetUserId={targetUserId}
        t={{
          title: t?.report?.title,
          subtitle: t?.report?.subtitle,
          fields: {
            subject: t?.report?.fields?.subject,
            description: t?.report?.fields?.description,
          },
   
          actions: {
            submit: t?.report?.actions?.submit,
            cancel: t?.report?.actions?.cancel,
          },
          toasts: {
            success: t?.report?.toasts?.success,
            validation: t?.report?.toasts?.validation,
          },
         
        }}
      />
    </div>
  );
}

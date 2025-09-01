"use client";

import { ShopViewModel } from "@/app/types/userproduct/userProduct";
import Image from "next/image";
import { useRouter } from "next/navigation";

function absolutizeUploads(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = String(url).replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

export default function ShopHeader({
  t,
  info,
}: {
  t: any; // از getUserProductMessages می‌آید؛ ساختار را دست نمی‌زنیم
  info: ShopViewModel; // از داده‌های همان اکشن پر می‌شود؛ تایپ جدید نمی‌سازیم
}) {
  const router = useRouter();
  const title = info?.shopInfo?.shopName || (t?.shop?.titleFallback ?? "");

  const handleShowMap = () => {
    if (info?.shopInfo?.lat && info?.shopInfo?.lng) {
      const q = `${info.shopInfo.lat},${info.shopInfo.lng}`;
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`, "_blank");
    }
  };

  return (
    <div className="rtl text-right">
      {/* بنر بالا دقیقا مثل اسکرین‌شات */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden">
        <p>{info.shopInfo?.imageUrl}</p>
        <Image
          src={absolutizeUploads(info?.shopInfo?.imageUrl) || "/images/placeholders/shop-banner.jpg"}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* عنوان + پسندها + دکمه‌ها */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">{title}</h1>
          <span className="text-sm text-gray-500">|</span>
          <span className="text-sm text-gray-600">
            {(t?.shop?.like ?? "")} {info?.shopInfo?.likesCount ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShowMap}
            className="px-3 py-2 text-sm border rounded-xl"
            aria-label={t?.shop?.showOnMap ?? ""}
            title={t?.shop?.showOnMap ?? ""}
          >
            {t?.shop?.showOnMap ?? ""}
          </button>
          <button
            type="button"
            onClick={() => router.push("/report")}
            className="px-3 py-2 text-sm border rounded-xl"
            aria-label={t?.shop?.report ?? ""}
            title={t?.shop?.report ?? ""}
          >
            {t?.shop?.report ?? ""}
          </button>
        </div>
      </div>

      {/* آدرس/تلفن/شهر */}
      <div className="mt-3 space-y-2 text-sm">
        {info?.shopInfo?.address && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.address ?? ""}</span>
            <span className="leading-6">{info.shopInfo?.address}</span>
          </div>
        )}
        {(info?.shopInfo?.phone1 || info?.shopInfo?.phone2) && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.phones ?? ""}</span>
            <span className="leading-6 ltr">
              {info.shopInfo?.phone1 || ""}{info.shopInfo?.phone1 && info.shopInfo?.phone2 ? " | " : ""}{info.shopInfo?.phone2 || ""}
            </span>
          </div>
        )}
        {info?.shopInfo?.city && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-16">{t?.shop?.city ?? ""}</span>
            <span>{info.shopInfo?.city}</span>
          </div>
        )}
      </div>
    </div>
  );
}

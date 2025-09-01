"use client";
import { useEffect, useMemo, useState } from "react";
import Portal from "../shared/portal";
import Image from "next/image";
import { absolutizeUploads } from "@/app/utils/iamge";

// ⚠️ دقیقاً همان هوکی که در صفحه‌ی جستجو استفاده می‌کنی را ایمپورت کن.
// مثلا اگر اسمش useMarketSearch است و آنجا این‌طوری ایمپورت می‌کنید، همین را بگذارید.
import { useMarketSearch } from "@/app/hooks/useMarketSearch";
// خروجی مورد انتظار هوک: { data, loading, error }
// که data می‌تواند یک آرایه یا شیئی با data.items باشد (مثل صفحه‌ی جستجو)

type Item = {
  id: number;                       // = productId (یونیک برای هر محصول)
  modelName?: string | null;
  brandTitle?: string | null;
  description?: string | null;
  defaultImageUrl?: string | null;  // از imageUrl سرچ گرفته می‌شود
  finalPrice?: number | null;       // ارزان‌ترین قیمت
  updatedAt?: string | null;        // آخرین آپدیت برای همان ارزان‌ترین
};

export default function ComparePicker({
  open,
  onClose,
  brandId,
  currentProductId,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  brandId: number;
  currentProductId: number;
  onPick: (id: number) => void;
}) {
  const [q, setQ] = useState("");

  // داده‌ها را از همان هوکِ صفحهٔ جستجو می‌گیریم:
  // فقط همین برند، فقط آیتم‌های قابل‌نمایش (در صورت وجود این پارامتر در هوک).
  const { data, loading, error } = useMarketSearch({
    brandId: [brandId],
    onlyVisible: true,
    limit: 300,
    // اگر پارامتر q در هوک شما هست و می‌خواهی فیلتر سمت سرور باشد:
    // q,
  });

  // قفل اسکرول وقتی باز است
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // کمک‌تابع برای تبدیل قیمت‌های رشته‌ای به عدد
  const toNum = (v: unknown) => {
    if (typeof v === "number") return v;
    const s = String(v ?? "").replace(/[^\d.]/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  // نرمال‌سازی خروجی هوک به آرایه‌ای از آیتم‌های بازار (همون چیزی که صفحهٔ جستجو می‌گیره)
  const marketItems = useMemo(() => {
    // هوک شما ممکنه {items} بده یا خودش آرایه باشه—مثل همون صفحهٔ جستجو همین رو دارید.
    const arr = Array.isArray((data as any)?.items)
      ? (data as any).items
      : Array.isArray(data)
      ? (data as any)
      : [];
    return arr as Array<{
      productId: number;
      brandTitle?: string;
      modelName?: string;
      description?: string;
      imageUrl?: string | null;
      finalPrice?: string | number | null;
      updatedAt?: string | null;
    }>;
  }, [data]);

  // فقط قیمت‌دارها + تجمیع روی productId: ارزان‌ترین رکورد را نگه می‌داریم
  const baseList: Item[] = useMemo(() => {
    const map = new Map<number, Item>();
    for (const it of marketItems) {
      const pid = Number(it.productId);
      const price = toNum(it.finalPrice);
      if (!Number.isFinite(price) || price <= 0) continue; // فقط قیمت‌دار
      const prev = map.get(pid);
      if (!prev || price < (prev.finalPrice ?? Infinity)) {
        map.set(pid, {
          id: pid,
          brandTitle: it.brandTitle ?? null,
          modelName: it.modelName ?? null,
          description: it.description ?? null,
          defaultImageUrl: it.imageUrl ? absolutizeUploads(it.imageUrl) : null,
          finalPrice: price,
          updatedAt: it.updatedAt ?? null,
        });
      }
    }
    // حذف خودِ محصول جاری و مرتب‌سازی بر اساس قیمت
    return Array.from(map.values())
      .filter((x) => x.id !== currentProductId)
      .sort((a, b) => Number(a.finalPrice ?? Infinity) - Number(b.finalPrice ?? Infinity));
  }, [marketItems, currentProductId]);

  // جستجوی محلی (اگر q را به خود هوک ندادی)
  const filtered = useMemo(() => {
    if (!q.trim()) return baseList;
    const k = q.trim().toLowerCase();
    return baseList.filter(
      (x) =>
        String(x.modelName || "").toLowerCase().includes(k) ||
        String(x.brandTitle || "").toLowerCase().includes(k) ||
        String(x.description || "").toLowerCase().includes(k)
    );
  }, [baseList, q]);

  const formatPrice = (v?: number | null) =>
    Number(v ?? 0) > 0 ? new Intl.NumberFormat("fa-IR").format(Number(v)) : "—";

  const shortDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(+d)) return "";
    try {
      return d.toLocaleDateString("fa-IR");
    } catch {
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${mm}/${dd}`;
    }
  };

  const getImg = (p: Item) => p.defaultImageUrl || `https://nerkhin.com/uploads/${p.id}/1.webp`;

  const content = (
    <div className="max-w-lg w-full" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">انتخاب محصول برای مقایسه</h2>
        <button onClick={onClose} className="p-2" aria-label="close">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="جستجو در نام/مدل/توضیحات…"
        className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
      />

      <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-100">
        {loading ? (
          <div className="p-3 text-sm text-gray-500">در حال بارگذاری…</div>
        ) : (error as any) ? (
          <div className="p-3 text-sm text-red-600">خطا در دریافت نتایج.</div>
        ) : filtered.length ? (
          filtered.map((p) => (
            <button
              key={p.id}
              className="flex w-full text-right  p-3 hover:bg-gray-50"
              onClick={() => onPick(p.id)}
            >
              <div className="flex w-full justify-between  gap-3">
                <div className="flex items-center flex-row">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                  <Image
                    src={getImg(p)}
                    alt={p.modelName ?? ""}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {p.brandTitle ? `${p.brandTitle} — ` : ""}{p.modelName || `#${p.id}`}
                  </div>
                  <div className="text-xs text-gray-600">قیمت: {formatPrice(p.finalPrice)}</div>
                 
                </div>
                </div>
                {p.updatedAt ? (
                    <div className="text-xs  items-end text-gray-400">{shortDate(p.updatedAt)}</div>
                  ) : null}
              </div>
            </button>
          ))
        ) : (
          <div className="p-3 text-sm text-gray-500">چیزی پیدا نشد.</div>
        )}
      </div>
    </div>
  );

  return (
    <Portal>
      {/* دسکتاپ: مودال مرکزی */}
      <div className={`hidden md:block ${open ? "" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!open}
        >
          <div className="rounded-2xl bg-white p-4 shadow-2xl w-[90vw] max-w-lg">
            {content}
          </div>
        </div>
      </div>

      {/* موبایل: باتم‌شیت */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={onClose}
        />
        <div
          className={`fixed inset-x-0 bottom-0 z-[9999] transform transition-transform duration-300 ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-hidden={!open}
        >
          <div
            className="mx-auto max-w-md w-full rounded-t-2xl bg-white p-4 shadow-2xl"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
          >
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-200" />
            {content}
          </div>
        </div>
      </div>
    </Portal>
  );
}

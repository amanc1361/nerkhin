// app/components/.../FavoriteAccountsList.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import moment from "moment-jalaali";
import { useMemo, useState } from "react";
import { useFavoriteAccounts } from "@/app/hooks/useFavoriteAccounts";

const t = {
  empty: "چیزی پیدا نشد.",
  sort: "مرتب‌سازی",
  byNewest: "جدیدترین",
  byOldest: "قدیمی‌ترین",
  viewShop: "مشاهده فروشگاه",
};

function toJalali(iso?: string | null) {
  if (!iso) return "";
  moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });
  return moment(iso).format("jD jMMMM jYYYY");
}

export function FavoriteAccountsList({ role }: { role: string }) {
  const { data, isLoading, error } = useFavoriteAccounts();
  const [sort, setSort] = useState<"new" | "old">("new");

  const sorted = useMemo(() => {
    const arr = Array.isArray(data) ? [...data] : [];
    arr.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "new" ? db - da : da - db;
    });
    return arr;
  }, [data, sort]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-gray-500">{t.sort}</span>
        <select
          className="border rounded-xl px-2 py-1 text-sm bg-white dark:bg-zinc-900"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="new">{t.byNewest}</option>
          <option value="old">{t.byOldest}</option>
        </select>
      </div>

      {isLoading && <div className="text-sm text-gray-500">در حال بارگذاری…</div>}
      {error && <div className="text-sm text-red-500">خطا در دریافت داده</div>}
      {!isLoading && !error && sorted.length === 0 && (
        <div className="text-sm text-gray-500">{t.empty}</div>
      )}

      {!isLoading &&
        !error &&
        sorted.map((s) => {
          const name = s.shopName || s.fullName || s.title || "بدون نام";
          const img = s.shopImage??"";
          const createdAt = s.createdAt;
          const shopHref = s.shopId ? `/${role}/shop/${s.shopId}` : "#";

          return (
            <Link
              key={s.id}
              href={shopHref}
              className="block rounded-2xl border p-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
            >
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                  {img ? (
                    <Image
                      src={"https://nerrkhin.com/uploads/"+img}
                      alt={name}
                      fill
                      sizes="56px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      بدون تصویر
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[15px] VazirFontMedium">
                      {name}
                    </div>
                    <div className="text-[12px] text-gray-500">
                      {toJalali(createdAt)}
                    </div>
                  </div>

                  <div className="text-[12px] text-blue-600 mt-1">{t.viewShop}</div>
                </div>
              </div>
            </Link>
          );
        })}
    </div>
  );
}

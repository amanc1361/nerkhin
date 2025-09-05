"use client";

import Image from "next/image";
import Link from "next/link";
import moment from "moment-jalaali";
import { useMemo, useState, useCallback } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import type { FavoriteProductsViewModel } from "@/lib/server/fetchFavoriteProducts";

const useMessages = () => ({
  title: "پسندهای من",
  empty: "چیزی پیدا نشد.",
  sort: "مرتب‌سازی",
  byNewest: "جدیدترین",
  byOldest: "قدیمی‌ترین",
});

function absolutizeUploads(u?: string | null) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = u.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

export default function FavoriteProductsClient({
  role,
  initialItems,
}: {
  role: string;
  initialItems: FavoriteProductsViewModel[];
}) {
  const t = useMessages();
  const { api } = useAuthenticatedApi();
  const [items, setItems] = useState<FavoriteProductsViewModel[]>(initialItems || []);
  const [sort, setSort] = useState<"new" | "old">("new");

  const sorted = useMemo(() => {
    const arr = [...(items || [])];
    arr.sort((a, b) => {
      const da = new Date(a.productCreationAt).getTime();
      const db = new Date(b.productCreationAt).getTime();
      return sort === "new" ? db - da : da - db;
    });
    return arr;
  }, [items, sort]);

  const refresh = useCallback(async () => {
    const res = await api.get<FavoriteProductsViewModel[]>({
      url: "/favorite-product/my-favorite-products",
    });
    setItems(Array.isArray(res) ? res : []);
  }, [api]);

  const toJalali = (iso: string) => {
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });
    return moment(iso).format("jD jMMMM jYYYY");
  };

  const productHref = (productId: number) => `/${role}/product/${productId}`;

  return (
    <div dir="rtl" lang="fa" className="max-w-screen-md mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base VazirFontMedium text-gray-800 dark:text-gray-100">{t.title}</h1>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-sm text-gray-500">{t.empty}</div>
        ) : (
          sorted.map((it) => {
            const img = absolutizeUploads(it.productDefaultImageUrl);
            const title = [it.productCategoryTitle, it.productBrandTitle, it.productModelTitle]
              .filter(Boolean)
              .join(" - ");
            const price =
              typeof it.productPrice === "number"
                ? it.productPrice.toLocaleString("fa-IR")
                : (() => {
                    const n = Number(it.productPrice);
                    return isNaN(n) ? (it.productPrice || "") : n.toLocaleString("fa-IR");
                  })();

            return (
              <Link
                key={it.id}
                href={productHref(it.productId)}
                className="block rounded-2xl border p-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                 
                      <Image src={"https://nerkhin.com/uploads/"+it.productId+"/1.webp" } alt={title} fill sizes="64px" style={{ objectFit: "cover" }} />
                  
                  </div>

                  <div className="flex-1 min-w-0">
                   
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-[15px] VazirFontMedium">{title}</div>
                      <div className="text-[13px] text-gray-500">{toJalali(it.productCreationAt)}</div>
                    </div>
                  <div className="text-[15px] VazirFontBold">{price}</div>
                    {it.productShopCount > 0 && (
                      <div className="text-[12px] text-gray-500 mt-1">
                        {it.productShopCount.toLocaleString("fa-IR")} فروشگاه
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

     
    </div>
  );
}

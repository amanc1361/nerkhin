// app/hooks/useCitySubscriptions.ts
"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useAuthenticatedApi } from "./useAuthenticatedApi";

/** پلنی که به گرید می‌دیم */
export type CityPlan = { id: number; price: string; months: number };

/** نگاشت enum بک‌اند → تعداد ماه */
function periodEnumToMonths(n: number): number {
  switch (n) {
    case 1: return 1;   // OneMonth
    case 2: return 3;   // ThreeMonths
    case 3: return 6;   // SixMonths
    case 4: return 12;  // OneYear
    default: return Number(n) || 0;
  }
}

/**
 * دریافت پلن‌های «همان شهر» از اندپوینت:
 * GET /user-subscription/fetch/:cityId
 */
export function useCitySubscriptions(cityId?: number | null) {
  const { api } = useAuthenticatedApi();
  const [items, setItems] = useState<CityPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!cityId) { setItems([]); return; }

    (async () => {
      setLoading(true);
      try {
        // ✅ فقط از useAuthenticatedApi و url خام استفاده می‌کنیم
        const res = await api.get<any[]>({
          url: `/user-subscription/fetch/${encodeURIComponent(String(cityId))}`,
        });

        const list = Array.isArray(res) ? res : [];

        const mapped: CityPlan[] = list.map((s: any) => ({
          id: Number(s?.id),
          price: String(s?.price ?? s?.Price ?? ""),
          months: periodEnumToMonths(Number(s?.numberOfDays ?? s?.NumberOfDays)),
        })).filter(p => p.id && p.months);

        if (alive) setItems(mapped.sort((a, b) => a.months - b.months));
      } catch (e: any) {
        if (alive) setItems([]);
        toast.error(e?.message || "خطا در دریافت پلن‌های این شهر");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [api, cityId]);

  return { items, loading };
}

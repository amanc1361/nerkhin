// hooks/useUserSubscriptions.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { subscriptionApi } from "@/app/services/subscriptionApi";
import { toast } from "react-toastify";

export type UserSubscriptionVM = {
  id: number;
  userId: number;
  cityId: number;
  subscriptionId: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  price?: string;
  numberOfDays?: number;
};

type Options = {
  cityId?: number; // اگر بدهی از اندپوینت userByCity استفاده می‌شود
  auto?: boolean;  // پیش‌فرض true: روی mount واکشی شود
};

export function useUserSubscriptions(opts: Options = {}) {
  const { api } = useAuthenticatedApi();
  const { cityId, auto = true } = opts;

  const [items, setItems] = useState<UserSubscriptionVM[] | null>(null);
  const [loading, setLoading] = useState<boolean>(!!auto);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = cityId != null
        ? subscriptionApi.userByCity(cityId).url
        : subscriptionApi.userSubscriptionList.url;

      // ✅ طبق امضای useAuthenticatedApi.get: یک آبجکت با url بده
      const res = await api.get<UserSubscriptionVM[]>({ url });
      setItems(res ?? []);
    } catch (e: any) {
      const msg = e?.message || "خطا در دریافت اشتراک‌ها";
      setError(msg);
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [api, cityId]);

  useEffect(() => {
    if (!auto) return;
    let alive = true;
    (async () => {
      try {
        await fetcher();
      } finally {
        if (!alive) return;
      }
    })();
    return () => {
      alive = false;
    };
  }, [auto, fetcher]);

  return {
    items,        // آرایهٔ اشتراک‌ها (ممکن است خالی باشد)
    loading,      // وضعیت لودینگ
    error,        // پیام خطا در صورت وجود
    reload: fetcher, // دستی دوباره لود کن
  };
}

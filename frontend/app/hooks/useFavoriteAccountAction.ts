"use client";

import { useCallback, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";

/** درخواست/پاسخ‌های بک‌اند مطابق هندلرهایی که دادی */
type CreateFavoriteReq = { targetUserId: number };
type CreateFavoriteRes = { id: number };
type DeleteFavoriteReq = { ids: number[] };

/**
 * اکشن‌های علاقه‌مندی حساب/فروشگاه
 * - addToFavorites: افزودن فروشگاه کاربر هدف به علاقه‌مندی‌های کاربر جاری
 * - removeFavoritesByIds: حذف علاقه‌مندی‌ها با ID رکوردهای favorite
 */
export function useFavoriteAccountActions(onSuccess?: () => void) {
  const { api, isAuthenticated } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToFavorites = useCallback(
    async (targetUserId: number): Promise<number | undefined> => {
      if (!isAuthenticated) {
        toast.error("برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید.");
        return;
      }
      try {
        setIsSubmitting(true);
        const payload: CreateFavoriteReq = { targetUserId };
        // توجه: api.post<T> انتظار یک آبجکت با { url, body } دارد
        const res = await api.post<CreateFavoriteRes>({
          url: "/favorite-account/create",
          body: payload,
        });
        toast.success("به علاقه‌مندی‌ها اضافه شد.");
        onSuccess?.();
        return res?.id;
      } catch (err: any) {
        toast.error(err?.message || "خطا در افزودن به علاقه‌مندی‌ها.");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, isAuthenticated, onSuccess]
  );

  const removeFavoritesByIds = useCallback(
    async (ids: number[]): Promise<void> => {
      if (!ids || ids.length === 0) return;
      if (!isAuthenticated) {
        toast.error("برای حذف از علاقه‌مندی‌ها ابتدا وارد شوید.");
        return;
      }
      try {
        setIsSubmitting(true);
        const payload: DeleteFavoriteReq = { ids };
        await api.post<void>({
          url: "/favorite-account/delete",
          body: payload,
        });
        toast.success("از علاقه‌مندی‌ها حذف شد.");
        onSuccess?.();
      } catch (err: any) {
        toast.error(err?.message || "خطا در حذف علاقه‌مندی.");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, isAuthenticated, onSuccess]
  );

  return {
    addToFavorites,
    removeFavoritesByIds,
    isSubmitting,
  };
}

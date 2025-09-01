"use client";

import { useState, useCallback } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";

type FavoriteCreateReq = { productId: number };
type FavoriteDeleteReq = { productIds: number[] };

export function useFavoriteActions(initialIsFavorite: boolean, productId: number) {
  const { api } = useAuthenticatedApi();
  const [isFavorite, setIsFavorite] = useState<boolean>(!!initialIsFavorite);
  const [loading, setLoading] = useState<boolean>(false);

  const add = useCallback(async () => {
    try {
      setLoading(true);
      const payload: FavoriteCreateReq = { productId };
      await api.post({
        url: "/favorite-product/create",
        body: payload,
      });
      setIsFavorite(true);
      toast.success("به علاقه‌مندی‌ها اضافه شد.");
    } catch (err: any) {
      toast.error(err?.message || "خطا در افزودن به علاقه‌مندی‌ها");
    } finally {
      setLoading(false);
    }
  }, [api, productId]);

  const remove = useCallback(async () => {
    try {
      setLoading(true);
      const payload: FavoriteDeleteReq = { productIds: [productId] };
      // طبق Handler شما، حذف هم JSON می‌گیرد؛ معمولاً این روت POST است
      await api.post({
        url: "/favorite-product/delete",
        body: payload,
      });
      setIsFavorite(false);
      toast.info("از علاقه‌مندی‌ها حذف شد.");
    } catch (err: any) {
      toast.error(err?.message || "خطا در حذف از علاقه‌مندی‌ها");
    } finally {
      setLoading(false);
    }
  }, [api, productId]);

  const toggle = useCallback(async () => {
    if (isFavorite) {
      await remove();
    } else {
      await add();
    }
  }, [isFavorite, add, remove]);

  return { isFavorite, loading, add, remove, toggle };
}

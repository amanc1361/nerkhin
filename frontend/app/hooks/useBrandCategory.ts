"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { brandApi } from "@/app/services/brandapi"; // سرویس موجود خودت
// اگر تایپ Brand جای دیگری است، همان را ایمپورت کن
type Brand = { id: number; title: string; logoUrl?: string | null };

export function useBrandsByCategory(categoryId: number | string) {
  const { api } = useAuthenticatedApi();
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      // هماهنگ با useAuthenticatedApi: api.get فقط props می‌گیرد (url/params/...)
      const res = await api.get<Brand[]>(brandApi.getById(categoryId));
      // بعضی سرویس‌ها data را داخل data برمی‌گردانند؛ هر دو را پشتیبانی کنیم
      setItems(Array.isArray(res) ? res : (res as any)?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [api, categoryId]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, reload: load };
}

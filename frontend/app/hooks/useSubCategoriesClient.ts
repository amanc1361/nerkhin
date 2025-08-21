"use client";
import { useEffect, useState, useCallback } from "react";
import { Category } from "@/app/types/category/categoryManagement";
import { ApiError } from "@/app/services/apiService";
import { getSubCategories } from "@/lib/server/server-api";

export function useSubCategoriesClient(parentId: number | string, initial?: Category[]) {
  const [list, setList] = useState<Category[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial?.length);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSubCategories(parentId);
      setList(data ?? []);
      setError(null);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "خطا در دریافت زیرشاخه‌ها";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    if (!initial || initial.length === 0) refresh();
  }, [initial, refresh]);

  return { list, loading, error, refresh };
}

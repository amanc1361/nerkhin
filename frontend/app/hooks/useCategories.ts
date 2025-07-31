"use client";

import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { Category } from "@/app/types/category/categoryManagement";
import { ApiError } from "@/app/services/apiService";
import { getAllCategories } from "@/lib/server/server-api";


export const useCategories = () => {
  const { api } = useAuthenticatedApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategories(); // استفاده از تابع server-api
        setCategories(res ?? []);
        setError(null);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "خطا در دریافت دسته‌بندی‌ها";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [api]);

  return { categories, loading, error };
};

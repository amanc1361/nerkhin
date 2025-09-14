// app/hooks/useFavoriteAccounts.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";

/** اگر دیتاتایپ جداگانه نداری، اینو فعلاً استفاده کن و در صورت نیاز فیلدها رو اضافه کن */
export type FavoriteAccountViewModel = {
  id: number;
  shopId?: number;
  targetUserId?: number;
  shopName?: string;
  fullName?: string;
  title?: string;
  shopImage?: string;
  createdAt: string;
  // هر فیلد دیگری که سرور می‌فرستد...
  [k: string]: any;
};

type State = {
  data: FavoriteAccountViewModel[] | null;
  isLoading: boolean;
  error: string | null;
};

export function useFavoriteAccounts() {
  const { api } = useAuthenticatedApi();
  const [state, setState] = useState<State>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      const res = await api.get<FavoriteAccountViewModel[]>({
        url: "/favorite-account/my-favorite-accounts",
      });
      
      const list = Array.isArray(res) ? res : [];
      
      setState({ data: list, isLoading: false, error: null });
    } catch (e: any) {
      setState({ data: null, isLoading: false, error: e?.message || "خطا" });
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchData,
  };
}

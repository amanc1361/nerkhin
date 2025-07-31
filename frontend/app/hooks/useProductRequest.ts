"use client";

import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { ApiError } from "@/app/services/apiService";
import { ProductRequestViewModel } from "../types/product/productrequest";


export const useRequestedProducts = (refreshKey: number = 0) => {
  const { api } = useAuthenticatedApi();
  const [requests, setRequests] = useState<ProductRequestViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        const res = await api.get<ProductRequestViewModel[]>({
          url: "/product-request/fetch-all",
       
        });

        // فقط درخواست‌های جدید (NewRequest) را برمی‌گرداند
        const filtered = Array.isArray(res) ? res.filter((r) => r.state === 1) : [];
        setRequests(filtered);
        setError(null);
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : "خطا در دریافت کالاهای درخواستی";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [api, refreshKey]);

  return { requests, loading, error };
};

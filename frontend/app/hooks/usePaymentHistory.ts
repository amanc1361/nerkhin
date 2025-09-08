// app/hooks/usePaymentHistory.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { PaymentTransactionHistoryViewModel } from "../types/subscription/subscriptionManagement";
import { subscriptionApi } from "../services/subscriptionApi";


type UsePaymentHistoryOut = {
  items: PaymentTransactionHistoryViewModel[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function usePaymentHistory(): UsePaymentHistoryOut {
  const { api } = useAuthenticatedApi();
  const [items, setItems] = useState<PaymentTransactionHistoryViewModel[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const def = subscriptionApi.paymentHistory; // { url: "...", method: "get" }
      const res = await api.get<PaymentTransactionHistoryViewModel[]>({ url: def.url });
      console.log(res);
      setItems(res ?? []);
    } catch (e: any) {
      const msg = e?.message || "خطا در دریافت لیست واریزها";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, error, refetch: fetchData };
}

"use client";

import { useCallback, useState } from "react";

import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";

export function useDollarPriceAction(onSuccess?: (digits: string) => void) {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = useCallback(
    async (dollarPriceDigits: string) => {
      setIsSubmitting(true);
      try {
        await api.put({
          url: "/user/update-dollar-price",
          body: { dollarPrice: dollarPriceDigits }, // رشتهٔ عددی بدون ویرگول
        });
        toast.success("قیمت دلار با موفقیت ذخیره شد");
        onSuccess?.(dollarPriceDigits);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "خطا در ذخیره قیمت دلار";
        toast.error(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, onSuccess]
  );

  return { update, isSubmitting };
}

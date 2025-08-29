// hooks/useDollarPriceAction.ts
"use client";

import { useCallback, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";

export function useDollarPriceAction(onSuccess?: (digits: string) => void) {
  const { api } = useAuthenticatedApi();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [price, setPrice] = useState<string>(""); // ← قیمت فعلی/قبلی به صورت رشتهٔ اعداد

  /** ذخیره/به‌روزرسانی قیمت دلار (بدون ویرگول، فقط ارقام) */
  const update = useCallback(
    async (dollarPriceDigits: string) => {
      setIsSubmitting(true);
      try {
        await api.put({
          url: "/user/update-dollar-price",
          body: { dollarPrice: dollarPriceDigits },
        });
        setPrice(dollarPriceDigits);
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

  /** گرفتن قیمت دلار ذخیره‌شدهٔ کاربر */
  const fetch = useCallback(
    async (userId: number | string) => {
      setIsFetching(true);
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${userId}` });

        // پاسخ را انعطاف‌پذیر استخراج می‌کنیم (خالص / داخل data / یا شیء با value)
        const payload = res && typeof res === "object" && "data" in res ? res.data : res;

        let digits = "";
        if (payload == null) {
          digits = "";
        } else if (typeof payload === "number") {
          digits = String(Math.trunc(payload));
        } else if (typeof payload === "string") {
          digits = payload.replace(/[^0-9]/g, "");
        } else if (typeof payload === "object" && "value" in payload) {
          digits = String((payload as any).value).replace(/[^0-9]/g, "");
        } else {
          digits = String(payload).replace(/[^0-9]/g, "");
        }

        setPrice(digits);
        return digits;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "خطا در دریافت قیمت دلار";
        toast.error(msg);
        throw err;
      } finally {
        setIsFetching(false);
      }
    },
    [api]
  );

  return {
    // قبلی‌ها (سازگار به عقب)
    update,
    isSubmitting,

    // جدید برای گرفتن قیمت قبلی
    fetch,        // fetch(userId)
    price,        // آخرین قیمت واکشی/ذخیره‌شده به صورت digits
    isFetching,
  };
}

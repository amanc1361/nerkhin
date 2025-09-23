// app/hooks/useAdjustRialPrices.ts
"use client";

import { useCallback, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";

type Options = {
  /** آدرس روت بک‌اند؛ پیش‌فرض: "/user-product/prices/adjust" */
  adjustUrl?: string;
};

export function useAdjustRialPrices(options?: Options) {
  const { api, isAuthenticated, isLoading } = useAuthenticatedApi();
  const adjustUrl = options?.adjustUrl || "/user-product/prices/adjust";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ارسال درصد به بک‌اند (مثبت برای افزایش، منفی برای کاهش)
   * نمونه: submit(10) یا submit(-5)
   */
  const submit = useCallback(
    async (percent: number) => {
      setError(null);

      if (!isAuthenticated) {
        const e = new Error("لطفاً ابتدا وارد حساب کاربری شوید.");
        setError(e.message);
        throw e;
      }

      if (!Number.isFinite(percent)) {
        const e = new Error("درصد معتبر نیست (مثلاً 10 یا -5).");
        setError(e.message);
        throw e;
      }

      try {
        setIsSubmitting(true);
        // userId سمت سرور از سشن برداشته می‌شود؛ فقط percent ارسال می‌کنیم.
        await api.post({
          url: adjustUrl,
          body: { percent },
          // هدر JSON معمولاً در apiService ست می‌شود؛ در صورت نیاز خودت اضافه کن:
          // headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("[useAdjustRialPrices][submit][ERROR]", err);
        setError("خطا در اعمال تغییر قیمت. لطفاً دوباره تلاش کنید.");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, isAuthenticated, adjustUrl]
  );

  return {
    submit,          // (percent: number) => Promise<void>
    isSubmitting,    // وضعیت ارسال
    error,           // پیام خطا (در صورت وقوع)
    setError,        // برای پاک/تغییر پیام خطا
    isReady: !isLoading && isAuthenticated, // آماده‌ی استفاده بودن هوک
  };
}

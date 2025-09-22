// hooks/useDollarPriceAction.ts
"use client";

import { useCallback, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";

type UpdateOptions = {
  dollarUpdate?: boolean; // اگر undefined باشد، اصلاً این کلید را نفرست
  rounded?: boolean;      // اگر undefined باشد، اصلاً این کلید را نفرست
};

export function useDollarPriceAction(onSuccess?: (digits: string, options?: UpdateOptions) => void) {
  const { api } = useAuthenticatedApi();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [flagDollarUpdate, setFlagDollarUpdate] = useState<boolean>(false);
  const [flagRounded, setFlagRounded] = useState<boolean>(false);

  const update = useCallback(
    async (dollarPriceDigits: string, options?: UpdateOptions) => {
      setIsSubmitting(true);
      try {
        const body: Record<string, any> = { dollarPrice: dollarPriceDigits };

        // ⬇️ تفاوت اصلی: اگر مقدار undefined نبود، همان مقدار (true/false) را بفرست
        if (options && "dollarUpdate" in options) body.dollarUpdate = options.dollarUpdate;
        if (options && "rounded" in options) body.rounded = options.rounded;

        await api.put({ url: "/user/update-dollar-price", body });

        setPrice(dollarPriceDigits);
        if (options) {
          setFlagDollarUpdate(!!options.dollarUpdate);
          setFlagRounded(!!options.rounded);
        }

        toast.success("قیمت دلار با موفقیت ذخیره شد");
        onSuccess?.(dollarPriceDigits, options);
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

  const fetch = useCallback(
    async (userId: number | string) => {
      setIsFetching(true);
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${userId}` });
        const payload = res && typeof res === "object" && "data" in res ? res.data : res;

        let digits = "";
        if (payload == null) digits = "";
        else if (typeof payload === "number") digits = String(Math.trunc(payload));
        else if (typeof payload === "string") digits = payload.replace(/[^0-9]/g, "");
        else if (typeof payload === "object" && "value" in payload)
          digits = String((payload as any).value).replace(/[^0-9]/g, "");
        else digits = String(payload).replace(/[^0-9]/g, "");
        setPrice(digits);

        let du = false, ro = false;
        if (payload && typeof payload === "object") {
          if ("dollarUpdate" in payload) du = Boolean((payload as any).dollarUpdate);
          if ("rounded" in payload) ro = Boolean((payload as any).rounded);
          const inner = (payload as any).data;
          if (inner && typeof inner === "object") {
            if ("dollarUpdate" in inner) du = Boolean(inner.dollarUpdate);
            if ("rounded" in inner) ro = Boolean(inner.rounded);
          }
        }
        setFlagDollarUpdate(du);
        setFlagRounded(ro);

        return { digits, dollarUpdate: du, rounded: ro };
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
    update,
    isSubmitting,
    fetch,
    price,
    flagDollarUpdate,
    flagRounded,
    isFetching,
  };
}

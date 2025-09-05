// hooks/usePaymentGateway.ts
"use client";

import { useState, useCallback } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { subscriptionApi } from "@/app/services/subscriptionApi"; // فقط برای url استفاده می‌کنیم
import { toast } from "react-toastify";

export type FetchGatewayInfoDTO = {
  cityId: number;
  subscriptionId: number;
  callBackUrl: string;
};

export type PaymentGatewayInfo = {
  paymentUrl: string;
  authority: string;
};

export function usePaymentGateway(redirectOnSuccess = true) {
  const { api } = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);

  const requestGateway = useCallback(
    async (dto: FetchGatewayInfoDTO): Promise<PaymentGatewayInfo> => {
      setLoading(true);
      try {
        // ✅ طبق امضای useAuthenticatedApi: یک آبجکت با url و body بده
        const res = await api.post<PaymentGatewayInfo>({
          url: subscriptionApi.paymentGatewayInfo.url,
          body: {
            cityId: dto.cityId,
            subscriptionId: dto.subscriptionId,
            callBackUrl: dto.callBackUrl,
          },
        });

        if (!res?.paymentUrl) {
          throw new Error("Invalid payment gateway response");
        }

        if (redirectOnSuccess) {
          window.location.href = res.paymentUrl;
        }

        return res;
      } catch (err: any) {
        toast.error(err?.message || "خطا در دریافت درگاه پرداخت");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, redirectOnSuccess]
  );

  return { requestGateway, loading };
}

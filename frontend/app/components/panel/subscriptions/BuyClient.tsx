// app/[role]/account/subscriptions/BuyClient.tsx
"use client";

import { useCallback } from "react";
import SubscriptionGrid from "@/app/components/subscriptions/SubscriptionGrid";

import { getSubscriptionMessages } from "@/lib/server/texts/subscriptionMessages";
import { usePaymentGateway } from "@/app/hooks/usePaymentGetway";

type Item = { id: number; price: string; months: number };

export default function BuyClient({ items }: { items: Item[] }) {
  // ⚠️ پیام‌ها را همین‌جا (سمت کلاینت) دریافت می‌کنیم تا تابعی از سرور پاس ندهیم
  const t = getSubscriptionMessages("fa");

  const { requestGateway } = usePaymentGateway(true);

  const onBuy = useCallback(
    async (subId: number) => {
      const cityId = Number(sessionStorage.getItem("selectedCityId") || 1);
      const base = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, "");
      const cb = `${base}/payment/callback`;
      await requestGateway({ cityId, subscriptionId: subId, callBackUrl: cb });
    },
    [requestGateway]
  );

  return (
    <SubscriptionGrid
      items={items}
      t={{ buy: t.buy, tomans: t.tomans, periodLabel: t.periodLabel }}
      onBuy={onBuy}
    />
  );
}

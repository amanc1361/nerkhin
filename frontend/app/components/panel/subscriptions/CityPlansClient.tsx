// app/[role]/account/subscriptions/CityPlansClient.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getSubscriptionMessages } from "@/lib/server/texts/subscriptionMessages";
import { useCitySubscriptions } from "@/app/hooks/useCitySubscriptions";
import SubscriptionGrid from "@/app/components/subscriptions/SubscriptionGrid";
import { usePaymentGateway } from "@/app/hooks/usePaymentGetway";


type City = { id: number; title: string };

export default function CityPlansClient({ cities }: { cities: City[] }) {
  const t = getSubscriptionMessages("fa");

  // انتخاب اولیه شهر از sessionStorage (اگر قبلاً کاربر انتخاب کرده)
  const initialCityId = useMemo(() => {
    const raw = typeof window !== "undefined" ? window.sessionStorage.getItem("selectedCityId") : null;
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : (cities[0]?.id || 0);
  }, [cities]);

  const [cityId, setCityId] = useState<number>(initialCityId);
  const { items, loading } = useCitySubscriptions(cityId);
  const { requestGateway } = usePaymentGateway(true);

  useEffect(() => {
    if (!cityId) return;
    sessionStorage.setItem("selectedCityId", String(cityId));
  }, [cityId]);

  const onBuy = useCallback(async (subId: number) => {
    const base = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, "");
    const cb = `${base}/payment/callback`;
    await requestGateway({ cityId, subscriptionId: subId, callBackUrl: cb });
  }, [cityId, requestGateway]);

  return (
    <div className="space-y-4">
      {/* انتخاب شهر */}
      <div>
        <label className="block mb-2 text-sm text-gray-600">{/* ترجمه در پیام‌ها اگر خواستی */}انتخاب شهر</label>
        <select
          value={cityId || 0}
          onChange={(e) => setCityId(Number(e.target.value))}
          className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900"
        >
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* گرید پلن‌های همان شهر */}
      {loading ? (
        <p className="text-center text-gray-500">در حال بارگذاری...</p>
      ) : items.length ? (
        <SubscriptionGrid
          items={items}
          t={{ buy: t.buy, tomans: t.tomans, periodLabel: t.periodLabel }}
          onBuy={onBuy}
        />
      ) : (
        <p className="text-center text-gray-500">{t.empty}</p>
      )}
    </div>
  );
}

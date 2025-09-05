"use client";

import { SubscriptionCard } from "./SubscriptionCard";

type Item = {
  id: number;
  price: string;
  months: number;
};

type Props = {
  items: Item[];
  t: {
    buy: string;
    tomans: (n: string | number) => string;
    periodLabel: (m: number) => string;
  };
  onBuy: (subId: number) => void;
};

export default function SubscriptionGrid({ items, t, onBuy }: Props) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it) => (
        <SubscriptionCard
          key={it.id}
          priceText={t.tomans(it.price)}
          periodText={t.periodLabel(it.months)}
          buyText={t.buy}
          onBuy={() => onBuy(it.id)}
        />
      ))}
    </div>
  );
}

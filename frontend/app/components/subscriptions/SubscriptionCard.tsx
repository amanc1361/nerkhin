"use client";

import { memo } from "react";
import City from "@/public/city.png";
import Image from "next/image";
type Props = {
  priceText: string;
  periodText: string;
  buyText: string;
  onBuy?: () => void;
};

function Placeholder() {
  return (
    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
      <span className="text-sm">🖼️</span>
    </div>
  );
}

export const SubscriptionCard = memo(function SubscriptionCard({
  priceText,
  periodText,
  buyText,
  onBuy,
}: Props) {
  return (
    <div className="p-4 border rounded-2xl shadow-sm bg-white dark:bg-gray-900">
      <Image
       src={City}
       height={164}
       alt={buyText}
      >

      </Image>
      <div className="mt-3 text-center text-sm text-gray-700 dark:text-gray-300">{periodText}</div>
      <div className="mt-2 text-center font-semibold">{priceText}</div>
      <button
        type="button"
        onClick={onBuy}
        className="w-full mt-3 py-2 rounded-xl bg-cyan-600 text-white text-sm hover:opacity-90"
      >
        {buyText}
      </button>
    </div>
  );
});

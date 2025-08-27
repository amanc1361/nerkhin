// app/[role]/products/_components/ProductsToolbar.tsx
"use client";

import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import Link from "next/link";


type Props = {
  usdPrice?: number | string | null;
  addHref: string;
  onShareJpg?: () => void;
  onSharePdf?: () => void;
  messages: UserProductMessages; // 👈 به‌جای ReturnType<...>
};

export default function ProductsToolbar({
  usdPrice,
  addHref,
  onShareJpg,
  onSharePdf,
  messages,
}: Props) {
  const priceLabel = messages.toolbar.dollarPrice(String(usdPrice ?? "—"));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onShareJpg}
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        >
          {messages.toolbar.jpg}
        </button>

        <button
          type="button"
          onClick={onSharePdf}
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        >
          {messages.toolbar.pdf}
        </button>

        <div className="flex items-center justify-center rounded-xl border px-3 py-2 text-sm">
          {messages.toolbar.share}
        </div>
      </div>

      <div className="w-full">
        <div className="w-full rounded-xl bg-blue-600 text-white text-center py-3 text-sm">
          {priceLabel}
        </div>
      </div>

      <Link
        href={addHref}
        className="block w-full rounded-xl bg-neutral-100 text-center py-3 text-sm"
      >
        {messages.toolbar.addProduct}
      </Link>
    </div>
  );
}

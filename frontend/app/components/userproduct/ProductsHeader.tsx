// app/[role]/products/_components/ProductsHeader.tsx
"use client";

import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";



type Props = {
  count: number;
  messages: UserProductMessages;
};

export default function ProductsHeader({ count, messages }: Props) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-sm text-neutral-600">
        <div>{messages.summary(count)}</div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">↔</span>
            {messages.headers.currency}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">⇅</span>
            {messages.headers.sort}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="opacity-70">☰</span>
            {messages.headers.product}
          </span>
        </div>
      </div>
    </div>
  );
}

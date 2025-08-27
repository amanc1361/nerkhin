"use client";

import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";

type Props = {
  count: number;
  messages: UserProductMessages;
};

export default function ProductsHeader({ count, messages }: Props) {
  return (
    <div dir="rtl" className="mt-2">
      {/* تیتر تعداد محصولات */}
      <div className="text-sm text-neutral-600 mb-2">
        {messages.summary(count)}
      </div>

      {/* هدر ستون‌ها: ارز / ترتیب / کالا */}
      <div className="flex items-center text-xs text-neutral-500 px-1 py-2 border-b">
        <div className="w-10 text-center">{messages.headers.currency}</div>

        <div className="w-12 flex items-center justify-center gap-1">
          {messages.headers.sort}
          <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="1.6">
            <path d="M8 7l4-4 4 4M16 17l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex-1">{messages.headers.product}</div>
      </div>
    </div>
  );
}

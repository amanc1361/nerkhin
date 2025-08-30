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

      {/* هدر ستون‌ها: ارز / ترتیب / کالا (با آیکن‌ها مثل عکس) */}
      <div className="flex items-center text-xs text-neutral-500 px-1 py-2 border-b">
        <div className="flex-1 text-left"></div>
      
      </div>
    </div>
  );
}

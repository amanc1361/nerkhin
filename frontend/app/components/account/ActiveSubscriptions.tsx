// app/components/account/ActiveSubscriptions.tsx
"use client";

import type { FC } from "react";
import { getAccountMessages } from "@/lib/server/texts/accountMessages";
import { SubscriptionStatusVM } from "@/app/types/account/subscriptionstatus";


type Props = {
  locale?: "fa" | "en";
  items: SubscriptionStatusVM[]; // فقط فعال‌ها را بهش بده
};

const ActiveSubscriptions: FC<Props> = ({ locale = "fa", items }) => {
  const t = getAccountMessages(locale);

  if (!Array.isArray(items) || items.length === 0) {
    // نمایش ندادن چیزی وقتی فعال نداریم؛
    // متن "بدون اشتراک" قبلاً در HeaderCard هندل می‌شود.
    return null;
  }

  return (
    <section className="mt-4">
      {/* هدینگ با دیکشنری؛ اگر کلید در دیکشنری موجود نباشد، از نمایش هدینگ صرف‌نظر می‌کنیم */}
      {"subs" in t && t.header?.activeTitle ? (
        <h3 className="mb-2 text-sm font-semibold text-gray-800">{t.header.activeTitle}</h3>
      ) : null}

      <ul className="flex flex-wrap justify-end gap-2">
        {items.map((s) => {
          // فقط نام شهر و یک نشان کوچک از روزهای باقی‌مانده؛ بدون متن هاردکد
          const title =
            ("header" in t && t.header?.days
              ? `${s.daysRemaining} ${t.header.days}`
              : `${s.daysRemaining}`);
          return (
            <li
              key={`${s.subscriptionId}-${s.cityId}`}
              title={title}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
            >
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="truncate max-w-[12rem]">{s.city || `#${s.cityId}`}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ActiveSubscriptions;

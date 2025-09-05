"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import type { MyCustomersViewModel } from "@/app/types/account/account";

type T = {
  shopLink: string;    // "فروشگاه"
  retailer: string;    // "خرده فروش"
  wholesaler: string;  // "عمده فروش"
  person: string;      // "کاربر"
  empty: string;
};

function resolveRole(
  shopType?: number | null,
  roleText?: string | null,
  t?: T
) {
  // کدهای رایج برای نقش‌ها
  const retailerCodes = new Set([4]);
  const wholesalerCodes = new Set([3]);

  // اولویت 1: متن نقش اگر موجود باشد
  const rt = (roleText || "").toLowerCase();
  if (rt.includes("wholesale") || rt.includes("عمده")) {
    return { label: t?.wholesaler ?? "عمده فروش", slug: "wholesaler" as const };
  }
  if (rt.includes("retail") || rt.includes("خرده")) {
    return { label: t?.retailer ?? "خرده فروش", slug: "retailer" as const };
  }

  // اولویت 2: کُد عددی
  if (typeof shopType === "number") {
    if (wholesalerCodes.has(shopType)) {
      return { label: t?.wholesaler ?? "عمده فروش", slug: "wholesaler" as const };
    }
    if (retailerCodes.has(shopType)) {
      return { label: t?.retailer ?? "خرده فروش", slug: "retailer" as const };
    }
  }

  // پیش‌فرض
  return { label: t?.person ?? "کاربر", slug: "user" as const };
}

export default function MyCustomersList({
  t,
  items,
  shopBase = "/shop", // بخش ثابت بعد از نقش
}: {
  t: T;
  items: MyCustomersViewModel[];
  shopBase?: string;
}) {
  if (!items?.length) {
    return <div className="text-center text-gray-500 py-8">{t.empty}</div>;
  }

  return (
    <div className="divide-y" dir="rtl">
      {items.map((it) => {
        // اگر بک‌اند میدان role متنی دارد، اینجا پاس بده (اختیاری)
        // @ts-expect-error: فیلد اختیاری ممکن است در ViewModel شما وجود داشته باشد
        const customerRoleText: string | undefined = it.customerRole;

        const { label: roleLabel, slug: roleSlug } = resolveRole(
          it.customerShopType,
          customerRoleText,
          t
        );

        // لینک صحیح: /<role>/shop/<userId>
        const shopUrl = `/${roleSlug}${shopBase}/${it.userId}`;

        return (
          <div key={it.id} className="flex items-center justify-between py-3">
            {/* نام مشتری سمت راست */}
            <div className="text-gray-900">{it.customerName || "—"}</div>

            {/* لینک فروشگاه + نقش کنار آیکن */}
            <div className="min-w-[220px] flex items-center justify-start gap-2">
              <Link
                href={shopUrl}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {t.shopLink}
                <Store className="w-5 h-5" />
              </Link>

              {/* دقیقا کلمات «عمده فروش / خرده فروش / کاربر» */}
              <span className="text-gray-700 text-sm">{roleLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// app/payment/callback/page.tsx

import { createUserSubscriptionSSR } from "@/lib/server/sunScriptionAction";
import { redirect } from "next/navigation";

export default async function PaymentCallback({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const authority = String(searchParams["Authority"] || searchParams["authority"] || "");
  if (!authority) {
    // اگر Authority نبود برگرد به صفحه اشتراک
    redirect("/subscriptions");
  }

  // ایجاد اشتراک کاربر در سرور
  await createUserSubscriptionSSR(authority);

  // بعد از موفقیت، به لیست اشتراک‌های کاربر یا داشبورد هدایت کن
  redirect("/subscriptions");
}

// app/payment/success/SubscriptionSuccessClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type RoleLike = string | number | null | undefined;

function roleToSlug(role: RoleLike): "wholesaler" | "retailer" {
  if (role === 3 || role === "3" || String(role).toLowerCase() === "wholesaler") return "wholesaler";
  if (role === 4 || role === "4" || String(role).toLowerCase() === "retailer")   return "retailer";
  // در صورت نقش‌های مدیریتی یا نامشخص، پیش‌فرض retailer
  return "retailer";
}

export default function SubscriptionSuccessClient({ role }: { role: RoleLike }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        // کمی صبر تا Verify بک‌اند قطعی شود
        await new Promise((r) => setTimeout(r, 900));

        // 1) رفرش توکن (سرور: کوکی سشن NextAuth را آپدیت می‌کند)
        const rf = await fetch("/api/session/force-refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        // اندکی تا ثبت Set-Cookie در مرورگر
        await new Promise((r) => setTimeout(r, 120));

        // 2) اگر رفرش موفق بود، سشن جدید را بخوان تا نقش تازه را از همان‌جا بگیریم
        let slug = roleToSlug(role);
        if (rf.ok) {
          try {
            const sessRes = await fetch("/api/auth/session", { credentials: "include" });
            const sess = await sessRes.json().catch(() => null);
            const freshRole = (sess as any)?.user?.role ?? (sess as any)?.role;
            slug = roleToSlug(freshRole ?? role);
          } catch {
            // اگر نشد، از prop استفاده می‌کنیم
            slug = roleToSlug(role);
          }
          // مقصد نهایی پس از موفقیت
          window.location.assign(`/${slug}/account`);
        } else {
          // در صورت خطا: برگرد صفحهٔ اشتراک کاربر خودش
          window.location.replace(`/${slug}/account/subscriptions?justPaid=1`);
        }
      } catch {
        const slug = roleToSlug(role);
        window.location.replace(`/${slug}/account/subscriptions?justPaid=1`);
      }
    })();
  }, [role, router]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 max-w-md w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">پرداخت موفقیت‌آمیز بود</h1>
          <p className="text-gray-600 dark:text-gray-300">در حال نهایی‌سازی حساب…</p>
        </div>
      </div>
    </main>
  );
}

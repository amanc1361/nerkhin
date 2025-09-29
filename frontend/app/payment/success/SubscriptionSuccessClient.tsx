"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionSuccessClient({ role }: { role: string }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // مقصد نهایی بعد از تازه‌سازی کوکی سشن
    const next = `/${role}/shop`;
    // اگر به هر دلیل رفرش شکست خورد
    const fallback = `/${role}/account/subscriptions?justPaid=1`;

    // کمی مکث تا Verify بک‌اند نهایی شود، سپس GET رفرش را بزن
    const t = setTimeout(() => {
      window.location.assign(`/api/auth/force-refresh?next=${encodeURIComponent(next)}&fallback=${encodeURIComponent(fallback)}`);
    }, 900);

    return () => clearTimeout(t);
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
          <p className="text-gray-600 dark:text-gray-300">در حال نهایی‌سازی حساب …</p>
        </div>
      </div>
    </main>
  );
}

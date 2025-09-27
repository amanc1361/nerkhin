"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SubscriptionSuccessClient({ role }: { role: string }) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  // جلوگیری از اجرای دوباره در StrictMode (Dev)
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const refreshOnceAndGo = async () => {
      try {
        // ⏱ کمی صبر تا Verify سمت بک‌اند نهایی شود (race را حذف می‌کند)
        await new Promise((r) => setTimeout(r, 1800));

        // ✅ فقط یک بار رفرش سشن (توکن) — همین!
        const updated = await updateSession();

        const fresh = updated as any;
        const freshRole =
          fresh?.user?.role ??
          fresh?.role ??
          role;

        // اگر اشتراک فعال شد برو فروشگاه؛ وگرنه برگرد صفحهٔ اشتراک
        const subOK =
          (fresh?.subscriptionStatus === "active" || fresh?.subscriptionStatus === "trial") &&
          !!fresh?.subscriptionExpiresAt &&
          new Date(fresh.subscriptionExpiresAt).getTime() > Date.now();

        const destination = subOK
          ? `/${freshRole}/shop`
          : `/${freshRole}/account/subscriptions?justPaid=1`;

        // یه مکث کوچک تا کوکی ست بشه، بعد هدایت
        timer = setTimeout(() => {
          router.replace(destination);
        }, 300);
      } catch (err) {
        console.error("خطا در رفرش یک‌بارهٔ توکن:", err);
        router.replace("/");
      }
    };

    refreshOnceAndGo();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [router, updateSession, role]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 max-w-md w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-500 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            پرداخت موفقیت‌آمیز بود
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            اشتراک شما با موفقیت فعال شد. در حال آماده‌سازی حساب شما هستیم…
          </p>
        </div>
      
      </div>
    </main>
  );
}

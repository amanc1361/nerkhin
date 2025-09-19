"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SubscriptionSuccessClient({ role }: { role: string }) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  useEffect(() => {
    const updateUserAndRedirect = async () => {
      try {
        await updateSession();

        const destination = `/${role}/shop`;

        setTimeout(() => {
          router.replace(destination);
        }, 1500); // 1.5 ثانیه تأخیر

      } catch (error) {
        console.error("خطا در به‌روزرسانی نشست یا هدایت کاربر:", error);
        router.replace("/");
      }
    };

    updateUserAndRedirect();

  }, []); 

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
            اشتراک شما با موفقیت فعال شد. از اعتماد شما سپاسگزاریم!
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse pt-4">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            در حال به‌روزرسانی حساب شما و هدایت به فروشگاه...
          </p>
        </div>
      </div>
    </main>
  );
}

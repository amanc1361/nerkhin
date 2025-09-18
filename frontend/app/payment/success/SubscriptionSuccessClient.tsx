"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// این کامپوننت یک "Client Component" است.
// به همین دلیل، می‌تواند از هوک‌های ری‌اکت مانند useEffect و useRouter استفاده کند.
// پارامترها (props) که از یک Server Component به آن پاس داده می‌شوند، باید ساده و قابل سریال‌سازی باشند (مانند رشته، عدد، آبجکت ساده).
export default function SubscriptionSuccessClient({ role }: { role: string }) {
  const router = useRouter();
  // هوک useSession برای دسترسی به وضعیت نشست در سمت کلاینت استفاده می‌شود.
  // تابع update باعث می‌شود که اطلاعات نشست مجدداً از سرور دریافت شود.
  const { update: updateSession } = useSession();

  useEffect(() => {
    // این تابع async داخل useEffect تعریف شده تا بتوانیم از await استفاده کنیم.
    // این کار باعث می‌شود که منطق ما به صورت ناهمزمان و بدون بلاک کردن UI اجرا شود.
    const updateUserAndRedirect = async () => {
      try {
        // ۱. به‌روزرسانی نشست کاربر:
        // این تابع، اطلاعات نشست (session) را در سمت کلاینت با سرور همگام‌سازی می‌کند.
        // مثلاً اگر وضعیت اشتراک در دیتابیس تغییر کرده باشد، اینجا آپدیت می‌شود.
        await updateSession();

        // ۲. ساخت مسیر مقصد:
        // بر اساس نقشی که از سرور به عنوان prop دریافت کرده‌ایم، کاربر را به صفحه مربوطه هدایت می‌کنیم.
        const destination = `/${role}/shop`;

        // ۳. هدایت کاربر با یک تأخیر کوتاه:
        // این تأخیر به کاربر فرصت می‌دهد تا پیام موفقیت‌آمیز بودن پرداخت را ببیند.
        setTimeout(() => {
          // router.replace به جای router.push استفاده شده تا کاربر نتواند با دکمه "Back" به این صفحه برگردد.
          router.replace(destination);
        }, 1500); // 1.5 ثانیه تأخیر

      } catch (error) {
        console.error("خطا در به‌روزرسانی نشست یا هدایت کاربر:", error);
        // در صورت بروز خطا، می‌توانید کاربر را به یک صفحه خطا یا صفحه اصلی هدایت کنید.
        router.replace("/");
      }
    };

    // اجرای تابع در اولین رندر کامپوننت
    updateUserAndRedirect();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // این افکت فقط یک بار بعد از اولین رندر اجرا می‌شود، بنابراین آرایه وابستگی خالی است.

  return (
    // طراحی ظاهری صفحه بدون تغییر باقی می‌ماند
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

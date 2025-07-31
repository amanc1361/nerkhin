// app/auth/status/page.tsx (یا مسیر و نام دلخواه شما)
"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


 import { authStatusMessages } from '@/app/constants/string';


const AuthStatusPage: React.FC = () => {
  const router = useRouter();

  const handleBackToLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/auth/login'); // مسیر صفحه لاگین شما
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-6 overflow-y-auto VazirFont pt-10 pb-12 dark:bg-gray-900 sm:pt-12">
      {/* ^-- min-h-screen برای پر کردن ارتفاع صفحه و کمی تغییر در padding/gap */}
      <div>
        <Image
          src="/icons/sent/sent.svg" // مسیر آیکون در پوشه public
          alt={authStatusMessages.sentIconAlt}
          width={96}
          height={96}
          priority // اگر این تصویر مهم است
        />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold text-blue-dark dark:text-blue-400">
          {authStatusMessages.statusLabel}
        </h1>
      </div>

      {/* نمایش پیام موفقیت (به جای button از div یا p استفاده شده) */}
      <div 
        className="w-1/2 max-md:w-5/6 rounded-xl px-8 sm:px-16 py-3 sm:py-4 text-center bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200 text-lg font-bold"
        // ^-- استایل شبیه به دکمه اما با تگ div برای نمایش پیام
      >
        {authStatusMessages.signUpSuccessMessage}
      </div>

      <div className="w-full max-w-md px-4 text-center text-gray-700 dark:text-gray-300 md:w-1/3">
        {/* ^-- max-w-md برای محدود کردن عرض متن و خوانایی بهتر */}
        <p>
          {authStatusMessages.approvalPendingInfo}
        </p>
      </div>

      <div className="w-full max-w-xs px-4 md:w-1/2 lg:w-1/3">
        {/* ^-- محدود کردن عرض دکمه برای ظاهر بهتر */}
        <button
          type="button" // همیشه type را برای دکمه‌های غیر submit مشخص کنید
          onClick={handleBackToLogin}
          className="w-full rounded-xl bg-blue-dark px-8 py-3 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {authStatusMessages.backToLoginButton}
        </button>
      </div>
    </div>
  );
};

export default AuthStatusPage;
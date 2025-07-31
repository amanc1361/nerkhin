// layout/AuthLayout.tsx (یا مسیر دلخواه شما)
"use client"; // این Layout برای بخش‌های کلاینت ساید است

import React from 'react';
import SharedHeader from '@/app/components/layout/shareheader'; // ایمپورت هدر جدید

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
 
      <div className="flex flex-col items-center max-sm:flex-col-reverse h-screen VazirFont bg-gray-50 dark:bg-gray-900"> {/* یک رنگ پس‌زمینه برای کل صفحه اضافه شد */}
        {/* Desktop Header */}
        <header className="w-full bg-white dark:bg-gray-800 hidden sm:block text-gray-dark dark:text-gray-200 shadow-lg shadow-[#1C4A610D] dark:shadow-gray-700/50">
          <div className="container mx-auto px-4 sm:px-10 lg:px-20"> {/* استفاده از container برای مدیریت بهتر عرض و padding */}
            <SharedHeader innerContainerClassName="justify-between py-4" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full h-full overflow-y-auto flex-grow">
          {/* flex-grow باعث می‌شود این بخش فضای باقی‌مانده را پر کند */}
          <div className="w-full h-full"> {/* یا max-h-full اگر محتوا خودش ارتفاع را کنترل می‌کند */}
            {children}
          </div>
        </main>

        {/* Mobile Header (که به خاطر flex-col-reverse در بالا نمایش داده می‌شود) */}
        <header className="w-full bg-white dark:bg-gray-800 sm:hidden text-gray-dark dark:text-gray-200 shadow-lg shadow-[#1C4A610D] dark:shadow-gray-700/50">
          <div className="container mx-auto px-4"> {/* padding کمتر برای موبایل */}
            <SharedHeader innerContainerClassName="justify-around py-3" /> {/* py کمتر برای موبایل */}
          </div>
        </header>
      </div>
 
  );
};

export default AuthLayout;
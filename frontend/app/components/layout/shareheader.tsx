// components/layout/SharedHeader.tsx (یا مسیر دلخواه شما)
"use client"; // چون از Link استفاده می‌کند و بخشی از UI تعاملی است

import Link from 'next/link';
import Logo2 from '@/app/components/Logo/logo3'; // مسیر ایمپورت را بررسی کنید
import PersianDate from '@/app/utils/persiadate'; // مسیر ایمپورت را بررسی کنید (به نظر می‌رسد getData نام فایل و PersianDate کامپوننت است)
import React from 'react';

interface SharedHeaderProps {
  /** کلاس‌های Tailwind CSS برای کنترل justify-content و padding های داخلی */
  innerContainerClassName?: string;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({ innerContainerClassName }) => {
  return (
    <div className={`h-full flex items-center ${innerContainerClassName}`}>
      <Link href="/bazaar" className="flex flex-row items-center gap-x-2 sm:gap-x-4">
        <Logo2 /> {/* فرض می‌کنیم Logo2 نیازی به props ندارد */}
      </Link>
      <nav className="flex flex-row items-center">
        <div className="flex flex-row justify-end gap-x-2 sm:gap-x-4 text-lg sm:text-xl">
          <PersianDate /> {/* فرض می‌کنیم PersianDate نیازی به props ندارد */}
        </div>
      </nav>
    </div>
  );
};

export default SharedHeader;
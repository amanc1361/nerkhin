import React, { Suspense } from 'react';
import LoadingSpinner from '@/app/components/Loading/Loading';
import { getCitiesForFiltering } from 'lib/server/server-api';
import { SignUpForm } from '@/app/components/bazar/sign-up-form';

// ⬇️ این خط صفحه را از Static Generation خارج می‌کند و خطای «dynamic server usage» را رفع می‌کند.
export const dynamic = 'force-dynamic';
/*
  در صورت تمایل می‌توانید به‌جای خط بالا از یکی از گزینه‌های زیر استفاده کنید:
  export const revalidate = 3600;           // SSG با رفرش هر ۱ ساعت
  export const fetchCache = 'force-no-store'; // معادل dynamic کامل
*/

export default async function SignUpPage() {
  // دریافت لیست شهرها در سمت سرور
  const cities = await getCitiesForFiltering();

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:p-8">
          {/* فرم ثبت‌نام کلاینت‌ساید */}
          <SignUpForm cities={cities} />
        </div>
      </Suspense>
    </main>
  );
}

'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import LoginForm from '@/app/components/bazar/login-form';

/**
 * پیام‌های ثابت صفحه لاگین
 */
const authPageMessages = {
  accessDenied: 'دسترسی ندارید لطفا دوباره وارد شوید',
  roleError: 'خطایی در دریافت نقش کاربر رخ داده است. لطفاً دوباره وارد شوید',
} as const;


function LoginQueryHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const access   = searchParams.get('access');
    const roleErr  = searchParams.get('error');

    if (access === 'false') toast.error(authPageMessages.accessDenied);
    if (roleErr === 'true') toast.error(authPageMessages.roleError);
  }, [searchParams]);

  return <LoginForm />;
}

/**
 * صفحهٔ لاگین – از نوع Client Component و دارای مرز Suspense برای CSR Bailout.
 */
export default function AuthLoginPage() {
  return (
    <div className="w-full flex flex-col gap-4 items-center pt-10 sm:pt-12 VazirFont">
      {/* مرز Suspense برای ارضای محدودیت useSearchParams */}
      <Suspense fallback={null}>
        <LoginQueryHandler />
      </Suspense>
    </div>
  );
}

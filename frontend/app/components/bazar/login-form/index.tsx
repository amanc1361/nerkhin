// فایل: components/auth/LoginForm.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLoginHandler } from '@/app/hooks/useLoginHandler';
; // مسیر به فرم تایید کد
import LoadingSpinner from '@/app/components/Loading/Loading';
import Image from 'next/image';
import VerifyCodeForm from '../verify-code-form';
import { loginFormMessages } from '@/app/constants/string';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const {
    phone,
    setPhone,
    isLoading,
    showVerifyCode,
    handlePhoneSubmit,
  } = useLoginHandler();

  // اگر در حال ارسال شماره تلفن هستیم، یک لودر تمام صفحه نمایش می‌دهیم
  if (isLoading) {
    return <LoadingSpinner mode="overlay" />;
  }

  // اگر سرور با موفقیت کد را ارسال کرده باشد، فرم ورود کد را نمایش بده
  if (showVerifyCode) {
    return <VerifyCodeForm phone={phone} />;
  }

  // در غیر این صورت، فرم اولیه برای دریافت شماره تلفن را نمایش بده
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 VazirFont">
      <div className="h-24 w-24">
        <Image src="/icons/login/login.svg" alt="ورود" width={96} height={96} priority />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ورود | ثبت نام</h1>
      
      <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col gap-4">
        <div className="w-full">
          <label htmlFor="phone" className="sr-only">{loginFormMessages.phoneNumberLabel}</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            placeholder={loginFormMessages.phoneNumberPlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-center text-lg tracking-wider outline-none focus:border-blue-dark dark:border-gray-600 dark:bg-gray-700"
            dir="ltr"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading} 
          className="w-full rounded-xl bg-blue-dark p-3 font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
        >
          {loginFormMessages.sendVerificationCode}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
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
import Link from 'next/link';
// utils/normalizeDigits.ts
export function toEnglishDigits(input: string): string {
  if (!input) return input;
  // ارقام فارسی (۰–۹) و عربی (٠–٩)
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  return input
    // جایگزینی کاراکترهای RTL/فضای نامرئی متداول
    .replace(/\u200c|\u200f|\u202a|\u202b|\u202c|\u202d|\u202e/g, "")
    // تبدیل تک‌به‌تک کاراکترها
    .replace(/./g, (ch) => {
      const faIdx = fa.indexOf(ch);
      if (faIdx > -1) return String(faIdx);
      const arIdx = ar.indexOf(ch);
      if (arIdx > -1) return String(arIdx);
      return ch;
    });
}

// مخصوص ورودی تلفن: فقط + و رقم را نگه می‌دارد
export function normalizePhoneInput(input: string): string {
  const en = toEnglishDigits(input);
  // حذف جداکننده‌ها و هر چیزی غیر از رقم و +
  return en.replace(/[^\d+]/g, "");
}

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
    <div className="flex w-full max-w-md flex-col p-9 items-center gap-6 VazirFont">
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
            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
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
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center pt-2">
  حساب کاربری ندارید؟{' '}
  <Link
    href="/auth/signup"
    className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 font-semibold"
  >
    ثبت‌نام
  </Link>
</p>
    </div>
  );
};

export default LoginForm;
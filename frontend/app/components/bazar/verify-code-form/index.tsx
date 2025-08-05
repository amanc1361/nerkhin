"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/app/components/Loading/Loading';

const verifyCodeMessages = {
  formTitle: "کد تایید به شماره {phone} ارسال شد",
  codeInputPlaceholder: "کد تایید",
  submitButton: "تایید و ورود",
  success: "ورود موفقیت آمیز! در حال انتقال به داشبورد...",
  invalidCodeError: "کد تایید نامعتبر است یا خطایی رخ داده است.",
  emptyCodeError: "کد تایید نمی‌تواند خالی باشد.",
};

interface VerifyCodeFormProps {
  phone: string;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ phone }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error(verifyCodeMessages.emptyCodeError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        phone,
        code,
        redirect: false,
      });

      if (!result || !result.ok) {
        throw new Error(result?.error || "ورود ناموفق");
      }

      toast.success(verifyCodeMessages.success);

      // نقش را از session بخوان
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      console.log("✅ Logged in, role =", role);

      if (role === 1 || role === 2 || role === "admin") {
        router.replace("/panel");
      } else {
        router.replace("/bazaar");
      }
    } catch (error: any) {
      toast.error(error.message || verifyCodeMessages.invalidCodeError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        const form = e.target instanceof Element ? e.target.closest('form') : null;
        if (form) {
          form.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md flex flex-col gap-6 items-center VazirFont p-4 sm:p-0"
    >
      <div className="text-center">
        <span className="text-gray-700 dark:text-gray-300">
          {verifyCodeMessages.formTitle.replace('{phone}', phone)}
        </span>
      </div>

      <div className="w-full sm:w-3/4 flex flex-col items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          placeholder={verifyCodeMessages.codeInputPlaceholder}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 sm:p-4 border border-gray-light dark:border-gray-600 rounded-xl outline-none focus:border-primary-main text-center tracking-[0.5em] dark:bg-gray-700 dark:text-white"
          dir="ltr"
          autoComplete="one-time-code"
          disabled={isLoading}
          required
        />
      </div>

      <div className="w-full sm:w-3/4">
        <button
          type="submit"
          disabled={isLoading || code.length < 4}
          className="w-full font-medium rounded-xl px-8 sm:px-16 py-3 sm:py-4 bg-primary-main text-blue-dark hover:bg-primary-dark transition disabled:opacity-60"
        >
          {verifyCodeMessages.submitButton}
        </button>
      </div>
    </form>
  );
};

export default VerifyCodeForm;

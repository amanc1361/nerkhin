// "use client";

// import React, { useState, useEffect, FormEvent } from 'react';
// import { signIn, getSession } from 'next-auth/react'; // ⬅️ اضافه شد
// import { useRouter, useSearchParams } from 'next/navigation';
// import { toast } from 'react-toastify';
// import LoadingSpinner from '@/app/components/Loading/Loading';

// const verifyCodeMessages = {
//   formTitle: "کد تایید به شماره {phone} ارسال شد",
//   codeInputPlaceholder: "کد تایید",
//   submitButton: "تایید و ورود",
//   success: "ورود موفقیت آمیز! در حال انتقال به داشبورد...",
//   invalidCodeError: "کد تایید نامعتبر است یا خطایی رخ داده است.",
//   emptyCodeError: "کد تایید نمی‌تواند خالی باشد.",
// };

// interface VerifyCodeFormProps {
//   phone: string;
// }

// const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ phone }) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [code, setCode] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!code.trim()) {
//       toast.error(verifyCodeMessages.emptyCodeError);
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const result = await signIn("credentials", {
//         phone,
//         code,
//         redirect: false, // نگه می‌داریم
//       });

//       if (!result || !result.ok) {
//         throw new Error(result?.error || "ورود ناموفق");
//       }

//       toast.success(verifyCodeMessages.success);

//       // ⬇️ کلید حل مشکل: رفرش رندر و خواندن سشن به‌روز از next-auth
//       await router.refresh();
//       const session = await getSession();

//       const role =
//         (session as any)?.role ??
//         (session?.user as any)?.role ??
//         (session as any)?.userRole ??
//         (session?.user as any)?.userRole ??
//         null;

//       console.log("✅ Logged in, role =", role);

//       // نقش‌های شما (هم عددی هم متنی)
//       if (role === 1 || role === 2 || role === "admin") {
//         router.replace("/panel");
//       } else if (role === "wholesaler" || role === 3) {
//         router.replace("/wholesaler");
//       } else if (role === "retailer" || role === 4) {
//         router.replace("/retailer");
//       } else {
//         // نقش نامشخص → نریز به bazaar؛ بگذار برود خانه تا middleware/SSR نقش را مشخص کند
//         router.replace("/");
//       }
//     } catch (error: any) {
//       toast.error(error.message || verifyCodeMessages.invalidCodeError);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Enter' && !isLoading) {
//         e.preventDefault();
//         const form = e.target instanceof Element ? e.target.closest('form') : null;
//         if (form) {
//           (form as HTMLFormElement).requestSubmit();
//         }
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isLoading]);

//   if (isLoading) return <LoadingSpinner />;

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="w-full max-w-md flex flex-col gap-6 items-center VazirFont p-4 sm:p-0"
//     >
//       <div className="text-center">
//         <span className="text-gray-700 dark:text-gray-300">
//           {verifyCodeMessages.formTitle.replace('{phone}', phone)}
//         </span>
//       </div>

//       <div className="w-full sm:w-3/4 flex flex-col items-center gap-2">
//         <input
//           type="text"
//           inputMode="numeric"
//           pattern="\d*"
//           maxLength={6}
//           placeholder={verifyCodeMessages.codeInputPlaceholder}
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           className="w-full p-3 sm:p-4 border border-gray-light dark:border-gray-600 rounded-xl outline-none focus:border-primary-main text-center tracking-[0.5em] dark:bg-gray-700 dark:text-white"
//           dir="ltr"
//           autoComplete="one-time-code"
//           disabled={isLoading}
//           required
//         />
//       </div>

//       <div className="w-full sm:w-3/4">
//         <button
//           type="submit"
//           disabled={isLoading || code.length < 4}
//          className="w-full rounded-xl bg-blue-dark p-3 font-medium text-white transition hover:bg-blue-light disabled:opacity-60"
//         >
//           {verifyCodeMessages.submitButton}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default VerifyCodeForm;
"use client";

import React, { useState, FormEvent, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/app/components/Loading/Loading';
import FingerprintJS from '@fingerprintjs/fingerprintjs'; // <--- ADDED

const verifyCodeMessages = {
  formTitle: "کد تایید به شماره {phone} ارسال شد",
  codeInputPlaceholder: "کد تایید",
  submitButton: "تایید و ورود",
  success: "ورود موفقیت آمیز! در حال انتقال...",
  invalidCodeError: "کد تایید نامعتبر است یا خطایی رخ داده است.",
  emptyCodeError: "کد تایید نمی‌تواند خالی باشد.",
  fingerprintError: "خطا در شناسایی دستگاه. لطفا صفحه را رفرش کنید.",
};

interface VerifyCodeFormProps {
  phone: string;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ phone }) => {
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error(verifyCodeMessages.emptyCodeError);
      return;
    }

    setIsLoading(true);

    try {
      // --- ADDED: Fingerprint Generation ---
      let deviceId = '';
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        deviceId = result.visitorId;
      } catch (fpError) {
        console.error("FingerprintJS error:", fpError);
        toast.error(verifyCodeMessages.fingerprintError);
        setIsLoading(false);
        return;
      }
      // ------------------------------------
      
      const result = await signIn("credentials", {
        phone,
        code,
        deviceId, // <--- ADDED
        redirect: false,
      });

      if (!result || !result.ok) {
        // next-auth throws an error for non-200 responses, which is caught below
        // result.error will contain the message from the backend
        throw new Error(result?.error || "ورود ناموفق");
      }


      
      // router.refresh() is a good practice to update server-side rendered data after login

      
      // Instead of complex role checking here, let the middleware handle the redirect.
      // This simplifies client logic and centralizes routing rules.
      router.replace('/'); 

    } catch (error: any) {
      // The error message from `signIn` (forwarded from the backend) is now here
      toast.error(error.message || verifyCodeMessages.invalidCodeError);
    } finally {
      setIsLoading(false);
    }
  }, [phone, code, router]);

  if (isLoading) return <LoadingSpinner mode="overlay" />;

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
          disabled={isLoading || code.length < 6}
          className="w-full rounded-xl bg-blue-dark p-3 font-medium text-white transition hover:bg-blue-light disabled:opacity-60"
        >
          {verifyCodeMessages.submitButton}
        </button>
      </div>
    </form>
  );
};

export default VerifyCodeForm;
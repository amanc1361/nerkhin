
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react"; 
const BackButton: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <button
      type="button" 
      className="font-medium flex flex-row justify-center items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors duration-150"
      onClick={handleGoBack}
      aria-label="بازگشت به صفحه قبل" // برای دسترسی‌پذیری بهتر، به خصوص اگر متن "بازگشت" وجود نداشت
    >
      <Image
        src="/icons/back/back.svg" // مطمئن شوید این مسیر در پوشه public صحیح است
        className="pt-0.5" // تنظیم دقیق‌تر برای هم‌ترازی عمودی آیکون با متن
        alt="" // برای آیکون تزئینی در کنار متن، مناسب است
        width={20} // اندازه را می‌توان کمی تنظیم کرد
        height={20}
        priority={false} // آیکون‌های کوچک معمولاً نیازی به priority ندارند
      />
      <span>بازگشت</span>
    </button>
  );
};

export default BackButton;
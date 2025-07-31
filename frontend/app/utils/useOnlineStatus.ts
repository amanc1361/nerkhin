"use client";
import { useEffect, useState } from "react";

const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    // مقدار پیش‌فرض برای SSR. این مقدار در سمت کلاینت توسط useEffect به‌روز خواهد شد.
    // مقدار true از نمایش یک لحظه‌ای "آفلاین" قبل از تشخیص وضعیت واقعی در کلاینت جلوگیری می‌کند.
    return true;
  });

  useEffect(() => {
    // این تابع در سمت کلاینت پس از hydration اجرا می‌شود
    const updateStatus = (): void => {
      if (typeof navigator !== "undefined") {
        setIsOnline(navigator.onLine);
      }
    };

    // تنظیم وضعیت صحیح اولیه در کلاینت
    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []); // آرایه وابستگی خالی به معنای اجرای یکباره پس از mount و پاک‌سازی پس از unmount است

  return isOnline;
};

export default useOnlineStatus;
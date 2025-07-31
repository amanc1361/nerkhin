"use client";

import { useState, useEffect, useCallback } from 'react';
import { getAccessToken, setAccessToken, refreshAccessToken, clearAuthSessionAndRedirect } from '../services/auth'; // مسیر صحیح به authService

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean; // وضعیت بارگذاری اولیه برای بررسی توکن
  userAccessToken: string | null; // برای دسترسی به خود توکن در صورت نیاز (اختیاری)
  checkAuthStatus: () => Promise<void>; // برای بررسی مجدد وضعیت (مثلا پس از یک عملیات خاص)
  logout: () => Promise<void>; // تابع برای لاگ اوت
}

const useAuth = (): AuthState => {
  const [userAccessToken, setUserAccessTokenState] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // این تابع برای به‌روزرسانی state داخلی هوک بر اساس وضعیت authService است
  // برای واکنش‌پذیری کامل، این باید با یک سیستم subscribe/publish یا Context ترکیب شود.
  const updateAuthState = useCallback(() => {
    const currentToken = getAccessToken();
    setUserAccessTokenState(currentToken);
  }, []);

  // بررسی اولیه وضعیت احراز هویت هنگام mount شدن هوک
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    let currentToken = getAccessToken();

    if (!currentToken) {
      try {
        // اگر توکن در حافظه نیست، سعی کن با رفرش توکن یک نشست جدید بگیری
        // این حالت برای زمانی است که کاربر صفحه را رفرش کرده و رفرش توکن معتبر دارد
        console.log("useAuth: No access token in memory, attempting refresh...");
        currentToken = await refreshAccessToken(); // این تابع توکن را در authService هم set می‌کند
      } catch (error) {
        console.warn("useAuth: Refresh attempt failed on initial load.", error);
        // اگر رفرش ناموفق بود، یعنی کاربر لاگین نیست یا رفرش توکن نامعتبر است
        // clearAuthSessionAndRedirect() در خود refreshAccessToken در صورت شکست نهایی فراخوانی می‌شود
        currentToken = null;
      }
    }
    setUserAccessTokenState(currentToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();

    // --- بخش مهم برای واکنش‌پذیری ---
    // در اینجا باید یک مکانیزم برای گوش دادن به تغییرات توکن در authService پیاده‌سازی کنید.
    // مثال ساده با یک event listener سفارشی (نیاز به پیاده‌سازی event emitter در authService دارد):
    // const handleAuthChange = () => updateAuthState();
    // authService.subscribe(handleAuthChange);
    // return () => authService.unsubscribe(handleAuthChange);

    // یا اگر از Context API استفاده می‌کنید، این هوک از آن Context مقدار می‌خواند.
    // برای سادگی فعلی، این بخش را خالی می‌گذاریم اما اهمیت آن را در نظر داشته باشید.
    // بدون این، هوک به تغییرات پس از بارگذاری اولیه واکنش نشان نمی‌دهد مگر اینکه checkAuthStatus دستی فراخوانی شود.

  }, [checkAuthStatus, updateAuthState]);


  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await clearAuthSessionAndRedirect(); // این تابع توکن را پاک کرده و کاربر را به صفحه لاگین هدایت می‌کند
    setUserAccessTokenState(null);
    setIsLoading(false);
  };


  return {
    isAuthenticated: !!userAccessToken,
    isLoading,
    userAccessToken,
    checkAuthStatus, // تابع برای بررسی مجدد وضعیت به صورت دستی
    logout,
  };
};

export default useAuth;
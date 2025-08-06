"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession, signOut } from "next-auth/react";
import { refreshAccessToken } from "@/app/services/auth"; // مسیر صحیح به authService

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userAccessToken: string | null;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const useAuth = (): AuthState => {
  const [userAccessToken, setUserAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* واکشی توکن از Session */
  const fetchTokenFromSession = async () => {
    const session = await getSession();
    return (session?.accessToken as string | undefined) || null;
  };

  /* بررسی اولیه یا دستیِ وضعیت احراز هویت */
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);

    let currentToken = await fetchTokenFromSession();

    if (!currentToken) {
      try {
        console.log("useAuth: No token in session, attempting refresh…");
        currentToken = await refreshAccessToken(); // انتظار می‌رود سرور توکن جدید برگرداند
      } catch (err) {
        console.warn("useAuth: Refresh attempt failed.", err);
        currentToken = null;
      }
    }

    setUserAccessToken(currentToken);
    setIsLoading(false);
  }, []);

  /* اجرا در mount */
  useEffect(() => {
    checkAuthStatus();
    // ✔ اگر بعداً سیستم Pub/Sub اضافه کردید، اینجا subscribe کنید
  }, [checkAuthStatus]);

  /* خروج از حساب */
  const logout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/auth/login" }); // مسیر لاگین شما
    setUserAccessToken(null);
    setIsLoading(false);
  };

  return {
    isAuthenticated: !!userAccessToken,
    isLoading,
    userAccessToken,
    checkAuthStatus,
    logout,
  };
};

export default useAuth;

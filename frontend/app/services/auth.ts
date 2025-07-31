// فایل: services/authService.ts
import Router from "next/router";
import { API_BASE_URL, REFRESH_TOKEN_API_PATH } from "../config/apiConfig"; // ایمپورت از فایل کانفیگ

let inMemoryAccessToken: string | null = null;
let refreshTokenPromise: Promise<string | null> | null = null;


export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
  if (token === null && typeof window !== "undefined") {
 
    localStorage.removeItem("userInfo"); 
  }
};


export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};


export const clearAuthSessionAndRedirect = async (): Promise<void> => {
  setAccessToken(null);

  if (typeof window !== "undefined") {
    Router.push("/auth/login"); // مسیر صفحه لاگین خود را جایگزین کنید
  }
};

/**
 * درخواست Access Token جدید با استفاده از Refresh Token.
 * کوکی HTTP-Only حاوی Refresh Token باید به صورت خودکار توسط مرورگر ارسال شود.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      console.log("Attempting to refresh access token...");
      const response = await fetch(`${API_BASE_URL}${REFRESH_TOKEN_API_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // برخی سرورها انتظار بدنه خالی JSON دارند
        credentials: "include", // برای اطمینان از ارسال کوکی‌ها حتی در درخواست‌های cross-origin (اگر API شما روی دامنه دیگری است)
      });

      if (!response.ok) {
        console.error("Failed to refresh token, status:", response.status);
        await clearAuthSessionAndRedirect(); // پاک کردن نشست و هدایت به لاگین
        throw new Error(`Session expired or refresh failed (${response.status}). Please login again.`);
      }

      const data = await response.json();

      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        console.log("Access token refreshed successfully.");
        return data.accessToken;
      } else {
        console.error("New access token not found in refresh response body:", data);
        await clearAuthSessionAndRedirect();
        throw new Error("Failed to obtain new access token from refresh response.");
      }
    } catch (error: any) {
      console.error("Error during token refresh process:", error.message);
      // اگر clearAuthSessionAndRedirect قبلاً به دلیل خطای HTTP اجرا نشده، اینجا اجرا شود
      if (!error.message.includes("Session expired")) {
          await clearAuthSessionAndRedirect();
      }
      throw error;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};
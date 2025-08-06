// مسیر: app/services/authService.ts
import Router from "next/router";
import { getSession, signOut } from "next-auth/react";
import { API_BASE_URL, REFRESH_TOKEN_API_PATH } from "../config/apiConfig";

/**
 * رفرش AccessToken با RefreshToken (بدون تکیه به RAM)
 */
export async function refreshAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session?.accessToken) return null; // هنوز لاگین نیست

  try {
    const res = await fetch(`${API_BASE_URL}${REFRESH_TOKEN_API_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: (session as any).refreshToken }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: { accessToken: string; accessTokenExpiresAt: number } = await res.json();
    // NextAuth خودش در callback.jwt توکن را آپدیت مى‌کند، امّا اگر مى‌خواهید فوراً در session قابل‌دسترس باشد:
    await signOut({ redirect: false, callbackUrl: Router.asPath }); // ۱- پاک‌سازی
    // ۲- لاگین سایلنت با signIn("credentials") در صورت نیاز (بسته به API شما)
    return data.accessToken;
  } catch (err) {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
    return null;
  }
}

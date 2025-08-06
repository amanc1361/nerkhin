// مسیر: app/services/authapi.ts
import {
  API_BASE_URL,
  INTERNAL_GO_API_URL,
} from "@/app/config/apiConfig";
import {
  RefreshTokenApiResponse,
  SignUpResponse,
  VerifyCodeApiResponse,
} from "@/app/types/auth/authtypes";

export interface SignUpFormData {
  phone: string;
  cityId: number;
  role: number;
  fullName: string;
}

/* ─────────── Helper مشترک برای همهٔ درخواست‌ها ─────────── */
const baseURL =
  typeof window === "undefined" ? INTERNAL_GO_API_URL : API_BASE_URL;

async function postJson<T>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${baseURL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

/* ─────────── توابع اصلی بدون تغییر در امضا ─────────── */

export function initiateSignInAPI(phone: string) {
  return postJson<{ success: boolean; message: string }>(
    "/auth/login",
    { phone }
  );
}

export function userSignUpAPI(data: SignUpFormData) {
  return postJson<SignUpResponse>("/auth/register", data);
}

export function verifyCodeAPI(
  phone: string,
  code: string
) {
  return postJson<VerifyCodeApiResponse>(
    "/auth/verify-code",
    { phone, code }
  );
}

export function refreshAccessTokenAPI(
  refreshToken: string
) {
  return postJson<RefreshTokenApiResponse>(
    "/auth/refresh-token",
    { refreshToken }
  );
}

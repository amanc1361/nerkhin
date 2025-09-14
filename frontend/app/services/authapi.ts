// app/services/authapi.ts
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
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

function join(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

// روی سرور مستقیم به backend container، روی کلاینت از nginx
const baseURL = typeof window === "undefined" && INTERNAL_GO_API_URL
  ? INTERNAL_GO_API_URL
  : API_BASE_URL;

// اگر به هر دلیل مسیر اشتباه شد، همین‌جا فریاد بزن:
if (baseURL.includes("/api/auth")) {
  // این یعنی قطعاً جای config اشتباهه
  // در prod یک بار لاگ می‌شود و کمک می‌کند سریع پیدا کنی
  console.error("[authapi] MISCONFIG: baseURL points to /api/auth ->", baseURL);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = join(baseURL, path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

/* ─────────── API های ورود/ثبت‌نام ─────────── */
export function initiateSignInAPI(phone: string) {
  return postJson<{ success: boolean; message: string }>(
    "/auth/login",            // ← نتیجه باید بشه /api/go/auth/login
    { phone }
  );
}

export function userSignUpAPI(data: SignUpFormData) {
  return postJson<SignUpResponse>("/auth/register", data);
}

export function verifyCodeAPI(phone: string, code: string, deviceId: string) {
  return postJson<VerifyCodeApiResponse>("/auth/verify-code", { phone, code, deviceId });
}

export function refreshAccessTokenAPI(refreshToken: string) {
  return postJson<RefreshTokenApiResponse>("/auth/refresh-token", { refreshToken });
}

// lib/server/serverApiService.ts
import "server-only";
import { getServerSession } from "next-auth";
import { INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { authOptions } from "./authOptions";

async function serverFetch(url: string, options: RequestInit = {}) {
  const session = await getServerSession(authOptions);
  const token   = session?.accessToken;

  /* ---------- هدرها ---------- */
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  /* ---------- ساخت URL کامل ---------- */
  if (url.startsWith("http")) {
    // کاربر خودش URL کامل داده
    url = url.replace(/\/{2,}/g, "/");       // // را به / تبدیل کن (ایمنی)
  } else {
    const base = INTERNAL_GO_API_URL.replace(/\/$/, ""); // حذف اسلش انتهایی
    const path = url.startsWith("/") ? url : `/${url}`;  // اطمینان از اسلش ابتدایی
    url = `${base}${path}`;
  }

  /* ---------- فراخوانی ---------- */
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Server-side API Error ➜", { url, status: response.status, body });
    throw new Error(`API request failed: ${response.status}`);
  }

  // 204 یا بدنه‌ی خالی
  if (response.status === 204 || +response.headers.get("content-length")! === 0) {
    return null;
  }
  return response.json();
}

/* ---------- اکسپورت ↓ ---------- */
export const serverApiService = {
  get : <T = any>(url: string, opts: RequestInit = {}) =>
    serverFetch(url, { ...opts, method: "GET" }) as Promise<T>,
  post: <T = any>(url: string, body: Record<string, any>, opts: RequestInit = {}) =>
    serverFetch(url, { ...opts, method: "POST", body: JSON.stringify(body) }) as Promise<T>,
  // اگر لازم بود:
  // put : ...
  // delete: ...
};

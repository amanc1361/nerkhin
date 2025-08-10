// lib/server/serverApiService.ts
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { authOptions } from "./authOptions";
import { refreshAccessTokenAPI } from "@/app/services/authapi"; // ← استفاده از سرویس خودت

type Json = Record<string, unknown> | unknown[];

interface ExtraInit extends RequestInit {
  /** اگر false باشد، Authorization ست نمی‌کنیم */
  needAuth?: boolean;
}

const REFRESH_COOKIE_NAME = process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME || "";

async function getAccessTokenFromSession(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return (session as any)?.accessToken as string | undefined;
}

async function tryRefreshViaCookie(): Promise<string | null> {
  if (!REFRESH_COOKIE_NAME) return null;
  const rt = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (!rt) return null;

  try {
    const r = await refreshAccessTokenAPI(rt);
    // فرض بر اینکه پاسخ -> { accessToken, accessTokenExpiresAt, refreshToken? }
    return r?.accessToken || null;
  } catch (e) {
    // رفرش ناموفق
    return null;
  }
}

async function fetchWithAuthRetry(
  fullUrl: string,
  init: RequestInit,
  needAuth: boolean
): Promise<Response> {
  // مرحله 1: تلاش با توکن سشن
  const hdr = new Headers(init.headers);
  if (needAuth) {
    const access = await getAccessTokenFromSession();
    if (access && !hdr.has("Authorization")) {
      hdr.set("Authorization", `Bearer ${access}`);
    }

    // کوکی‌های جاری را هم پاس بده (برای هر وابستگی بک‌اند به کوکی)
    const jar = (await cookies()).getAll().map(c => `${c.name}=${c.value}`).join("; ");
    if (jar && !hdr.has("Cookie")) hdr.set("Cookie", jar);
  }

  let res = await fetch(fullUrl, { ...init, headers: hdr, cache: "no-store" });

  // مرحله 2: اگر 401 → یک بار رفرش و retry
  if (needAuth && res.status === 401) {
    const newAccess = await tryRefreshViaCookie();
    if (newAccess) {
      const retryHeaders = new Headers(hdr);
      retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(fullUrl, { ...init, headers: retryHeaders, cache: "no-store" });
    }
  }

  // مرحله 3: اگر هنوز 401 → به صفحه‌ی لاگین
  if (needAuth && res.status === 401) {
    redirect("/auth/login");
  }

  return res;
}

async function serverFetch<T = any>(
  path: string,
  { needAuth = true, ...init }: ExtraInit = {}
): Promise<T> {
  // فقط اگر بدنه JSON معمولی است
  const hdr = new Headers(init.headers);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof ReadableStream)
  ) {
    hdr.set("Content-Type", "application/json");
  }
  hdr.set("Accept", "application/json");

  // URL کامل (بدون تغییر در /api/go یا هرچی که خودت ست کردی)
  const base = INTERNAL_GO_API_URL.replace(/\/$/, "");
  const fullUrl =
    path.startsWith("http")
      ? path
      : `${base}${path.startsWith("/") ? path : `/${path}`}`.replace(/([^:]\/)\/+/g, "$1");

  const res = await fetchWithAuthRetry(fullUrl, { ...init, headers: hdr }, needAuth);

  if (!res.ok) {
    let body: unknown = await safeParseBody(res);
    console.error("Server-side API Error ➜", {
      url: fullUrl,
      status: res.status,
      body,
    });
    throw new Error(
      `API request failed: ${res.status} ${(body as any)?.message || res.statusText}`
    );
  }

  // 204 یا بدنه خالی
  if (res.status === 204 || !(await res.clone().text())) return null as any;

  return (await safeParseBody(res)) as T;
}

/* ---------- کمک‌تابع ---------- */
async function safeParseBody(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json().catch(() => ({}));
  return res.text().catch(() => "");
}

/* ---------- اکسپورت ---------- */
export const serverApiService = {
  get: <T = any>(url: string, opts: ExtraInit = {}) =>
    serverFetch<T>(url, { ...opts, method: "GET" }),

  post: <T = any>(url: string, body: Json | FormData, opts: ExtraInit = {}) =>
    serverFetch<T>(url, {
      ...opts,
      method: "POST",
      body:
        body instanceof FormData || body instanceof Blob
          ? (body as BodyInit)
          : JSON.stringify(body),
    }),

  put: <T = any>(url: string, body: Json | FormData, opts: ExtraInit = {}) =>
    serverFetch<T>(url, {
      ...opts,
      method: "PUT",
      body:
        body instanceof FormData || body instanceof Blob
          ? (body as BodyInit)
          : JSON.stringify(body),
    }),

  delete: <T = any>(url: string, opts: ExtraInit = {}) =>
    serverFetch<T>(url, { ...opts, method: "DELETE" }),
};

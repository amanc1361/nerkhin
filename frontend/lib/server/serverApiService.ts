// lib/server/serverApiService.ts
import "server-only";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { authOptions } from "./authOptions";

type Json = Record<string, unknown> | unknown[];

interface ExtraInit extends RequestInit {
  /** ←‌ اگر درخواست عمومی است و نباید Authorization ست شود */
  needAuth?: boolean;
}

async function serverFetch<T = any>(
  path: string,
  { needAuth = true, ...init }: ExtraInit = {}
): Promise<T> {
  /* ---------- سشن / توکن ---------- */
  let token: string | undefined;
  if (needAuth) {
    const session = await getServerSession(authOptions);
    token = (session as any)?.accessToken;
  }

  /* ---------- هدرها ---------- */
  const hdr = new Headers(init.headers);

  // فقط اگر بدنه JSON معمولی است
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof ReadableStream)
  ) {
    hdr.set("Content-Type", "application/json");
  }

  hdr.set("Accept", "application/json");
  if (token) hdr.set("Authorization", `Bearer ${token}`);

  // کوکی‌های جاری (برای هر نوع احراز هویت که روی کوکی سوار است)
  const cookieStr = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (cookieStr) hdr.set("Cookie", cookieStr);

  /* ---------- URL کامل ---------- */
  const base = INTERNAL_GO_API_URL.replace(/\/$/, "");
  const fullUrl =
    path.startsWith("http")
      ? path
      : `${base}${path.startsWith("/") ? path : `/${path}`}`.replace(
          /([^:]\/)\/+/g,
          "$1"
        ); // // → /

  /* ---------- فراخوانی ---------- */
  const res = await fetch(fullUrl, {
    cache: "no-store",
    ...init,
    headers: hdr,
  });

  /* ---------- مدیریت خطا ---------- */
  if (!res.ok) {
    let body: unknown = await safeParseBody(res);
    console.error("Server-side API Error ➜", {
      url: fullUrl,
      status: res.status,
      body,
    });
    throw new Error(
      `API request failed: ${res.status} ${
        (body as any)?.message || res.statusText
      }`
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

  post: <T = any>(
    url: string,
    body: Json | FormData,
    opts: ExtraInit = {}
  ) =>
    serverFetch<T>(url, {
      ...opts,
      method: "POST",
      body:
        body instanceof FormData || body instanceof Blob
          ? (body as BodyInit)
          : JSON.stringify(body),
    }),

  put: <T = any>(
    url: string,
    body: Json | FormData,
    opts: ExtraInit = {}
  ) =>
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

// lib/server/serverApiService.ts
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { authOptions } from "./authOptions";
import { refreshAccessTokenAPI } from "@/app/services/authapi";

type Json = Record<string, unknown> | unknown[];

interface ExtraInit extends RequestInit {
  needAuth?: boolean;
}

const REFRESH_COOKIE_NAME = process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME || "";

async function getAccessTokenFromSession(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return (session as any)?.accessToken as string | undefined;
}

/* 🔧 جدید: single-flight برای refresh تا همزمان چندبار صدا نشود */
const refreshInFlight = new Map<string, Promise<string | null>>();

async function tryRefreshViaCookie(): Promise<string | null> {
  if (!REFRESH_COOKIE_NAME) return null;
  const rt = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (!rt) return null;

  if (refreshInFlight.has(rt)) {
    return await refreshInFlight.get(rt)!;
  }

  const p = (async () => {
    try {
      const r = await refreshAccessTokenAPI(rt);
      return r?.accessToken || null;
    } catch {
      return null;
    } finally {
      // بعد از کوتاه‌زمان، اجازه‌ی تلاش مجدد
      setTimeout(() => refreshInFlight.delete(rt), 1500);
    }
  })();

  refreshInFlight.set(rt, p);
  return await p;
}

async function fetchWithAuthRetry(
  fullUrl: string,
  init: RequestInit,
  needAuth: boolean
): Promise<Response> {
  const hdr = new Headers(init.headers);

  if (needAuth) {
    const access = await getAccessTokenFromSession();
    if (access && !hdr.has("Authorization")) {
      hdr.set("Authorization", `Bearer ${access}`);
    }
    const jar = (await cookies()).getAll().map(c => `${c.name}=${c.value}`).join("; ");
    if (jar && !hdr.has("Cookie")) hdr.set("Cookie", jar);
  }

  let res = await fetch(fullUrl, { ...init, headers: hdr, cache: "no-store" });

  if (needAuth && res.status === 401) {
    const newAccess = await tryRefreshViaCookie();

    // 🔧 اگر رفرش نبود/ناموفق بود → مستقیم لاگین، نه تلاش‌های بیشتر
    if (!newAccess) {
      redirect("/auth/login");
    }

    // retry یک‌باره
    const retryHeaders = new Headers(hdr);
    retryHeaders.set("Authorization", `Bearer ${newAccess!}`);
    res = await fetch(fullUrl, { ...init, headers: retryHeaders, cache: "no-store" });
  }

  // اگر باز هم 401 → لاگین
  if (needAuth && res.status === 401) {
    redirect("/auth/login");
  }

  return res;
}

async function serverFetch<T = any>(
  path: string,
  { needAuth = true, ...init }: ExtraInit = {}
): Promise<T> {
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

  if (res.status === 204 || !(await res.clone().text())) return null as any;
  return (await safeParseBody(res)) as T;
}

async function safeParseBody(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json().catch(() => ({}));
  return res.text().catch(() => "");
}

export const serverApiService = {
  get: <T = any>(url: string, opts: ExtraInit = {}) =>
    serverFetch<T>(url, { ...opts, method: "GET" }),
  post: <T = any>(url: string, body: Json | FormData, opts: ExtraInit = {}) =>
    serverFetch<T>(url, {
      ...opts,
      method: "POST",
      body: body instanceof FormData || body instanceof Blob ? (body as BodyInit) : JSON.stringify(body),
    }),
  put: <T = any>(url: string, body: Json | FormData, opts: ExtraInit = {}) =>
    serverFetch<T>(url, {
      ...opts,
      method: "PUT",
      body: body instanceof FormData || body instanceof Blob ? (body as BodyInit) : JSON.stringify(body),
    }),
  delete: <T = any>(url: string, opts: ExtraInit = {}) =>
    serverFetch<T>(url, { ...opts, method: "DELETE" }),
};

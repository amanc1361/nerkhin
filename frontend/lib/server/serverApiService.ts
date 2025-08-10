// lib/server/serverApiService.ts
import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { authOptions } from "./authOptions";

type Json = Record<string, unknown> | unknown[];
interface ExtraInit extends RequestInit { needAuth?: boolean; }

const AUTH_INVALID_FLAG = "auth_invalid";

async function serverFetch<T = any>(
  path: string,
  { needAuth = true, ...init }: ExtraInit = {}
): Promise<T> {
  const hdr = new Headers(init.headers);

  // اگر روی صفحهٔ لاگین/ثبت‌نام هستیم، احراز هویت را خاموش کن
  const isAuthPage = (await headers()).get("x-auth-page") === "1";
  if (isAuthPage) needAuth = false;

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof ReadableStream)
  ) {
    hdr.set("Content-Type", "application/json");
  }
  hdr.set("Accept", "application/json");

  if (needAuth) {
    const session = await getServerSession(authOptions);
    const access = (session as any)?.accessToken as string | undefined;

    if (!access) {
      // توکن نداریم → پرچم و ریدایرکت
      (await
        // توکن نداریم → پرچم و ریدایرکت
        cookies()).set(AUTH_INVALID_FLAG, "1", { path: "/", httpOnly: true, sameSite: "lax" });
      redirect("/auth/login");
    }

    if (!hdr.has("Authorization")) hdr.set("Authorization", `Bearer ${access}`);

    const jar = (await cookies()).getAll().map(c => `${c.name}=${c.value}`).join("; ");
    if (jar && !hdr.has("Cookie")) hdr.set("Cookie", jar);
  }

  const base = INTERNAL_GO_API_URL.replace(/\/$/, "");
  const fullUrl =
    path.startsWith("http")
      ? path
      : `${base}${path.startsWith("/") ? path : `/${path}`}`.replace(/([^:]\/)\/+/g, "$1");

  const res = await fetch(fullUrl, { ...init, headers: hdr, cache: "no-store" });

  if (res.status === 401 && needAuth) {
    // توکن باطل (مثلاً بعد از ری‌استارت سرور) → پرچم و ریدایرکت
    if (!(await cookies()).get(AUTH_INVALID_FLAG)) {
      (await cookies()).set(AUTH_INVALID_FLAG, "1", { path: "/", httpOnly: true, sameSite: "lax" });
    }
    redirect("/auth/login");
  }

  if (!res.ok) {
    const body = await safeParseBody(res);
    console.error("Server-side API Error ➜", { url: fullUrl, status: res.status, body });
    throw new Error(`API request failed: ${res.status} ${(body as any)?.message || res.statusText}`);
  }

  // موفق شد → پرچم را پاک کن
  if ((await cookies()).get(AUTH_INVALID_FLAG)) {
    (await cookies()).set(AUTH_INVALID_FLAG, "", { path: "/", httpOnly: true, maxAge: 0 });
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
  get:    <T = any>(url: string, opts: ExtraInit = {}) => serverFetch<T>(url, { ...opts, method: "GET" }),
  post:   <T = any>(url: string, body: Json | FormData, opts: ExtraInit = {}) =>
    serverFetch<T>(url, { ...opts, method: "POST", body: body instanceof FormData || body instanceof Blob ? (body as BodyInit) : JSON.stringify(body) }),
  put:    <T = any>(url: string, body: Json | FormData, opts: ExtraInit = {}) =>
    serverFetch<T>(url, { ...opts, method: "PUT",  body: body instanceof FormData || body instanceof Blob ? (body as BodyInit) : JSON.stringify(body) }),
  delete: <T = any>(url: string, opts: ExtraInit = {}) => serverFetch<T>(url, { ...opts, method: "DELETE" }),
};

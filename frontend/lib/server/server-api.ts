// lib/server/server-api.ts      («use server» بالای فایل باقی بماند)
import "server-only";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { ApiError } from "@/app/services/apiService";
import { authOptions } from "./authOptions";

/* ---------- Base URL (یک بار تعریف) ---------- */
const BASE = (process.env.INTERNAL_GO_API_URL || "").replace(/\/$/, "");

if (!BASE.startsWith("http")) {
  throw new Error(
    '❌ INTERNAL_GO_API_URL باید URL کامل باشد (با http/https). ' +
      'الان مقدار آن: ' +
      (process.env.INTERNAL_GO_API_URL || "undefined")
  );
}

/* ---------- کمک‌تابع اتصال مسیر ---------- */
const join = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`.replace(
  /([^:]\/)\/+/g,
  "$1" // حذف // اضافی بعد از پروتکل
);

/* ---------- ⚡️ PUBLIC FETCH ---------- */
async function publicFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = join(path);

  try {
    const res = await fetch(url, { ...options, cache: "no-store" });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new ApiError(
        errBody.message || "Public API request failed",
        res.status,
        errBody
      );
    }
    return res.status === 204 ? (null as any) : res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new Error(
      (err as Error).message || `Public fetch to ${url} failed.`
    );
  }
}

/* ---------- ⚡️ AUTHENTICATED FETCH ---------- */
async function authenticatedFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  if (!token)
    throw new Error("User is not authenticated for a server-side API request.");

  /* هدرها */
  const hdr = new Headers(options.headers);
  if (!hdr.has("Content-Type") && !(options.body instanceof FormData))
    hdr.set("Content-Type", "application/json");
  hdr.set("Authorization", `Bearer ${token}`);

  /* کوکی‌ها (اگر بک‌اند به آن‌ها نیاز داشته باشد) */
  const cookieStr = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (cookieStr) hdr.set("Cookie", cookieStr);

  const url = path.startsWith("http") ? path : join(path);

  try {
    const res = await fetch(url, { ...options, headers: hdr, cache: "no-store" });

    /* برای دیباگ – حتماً در Production خاموش کنید */
    // const raw = await res.clone().text();
    // console.log("RAW RES ➜", url, raw);

    if (!res.ok) {
      const errData =
        (await res.json().catch(() => ({}))) || { message: res.statusText };
      throw new ApiError(errData.message, res.status, errData);
    }
    return res.status === 204 ? (null as any) : res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error(`Network error calling ${url}:`, err);
    throw new Error("An unexpected server-side network error occurred.");
  }
}

/* ---------- 🧩 DATA FUNCTIONS ---------- */

export async function getCitiesForFiltering() {
  return publicFetch("/city/fetch-all", { method: "GET" });
}

export async function getPaginatedUsers(filters: any) {
  return authenticatedFetch("/user/fetch-users", {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

export async function getNewUsersForDashboard() {
  return authenticatedFetch("/user/fetch-users", {
    method: "POST",
    body: JSON.stringify({ state: 1 }),
  });
}

export async function getProductRequestsForDashboard() {
  const list = await authenticatedFetch("/product-request/fetch-all", {
    method: "GET",
  });
  return Array.isArray(list) ? list.filter((p: any) => p.state === 0) : [];
}

export async function getAllCategories() {
  return authenticatedFetch("/product-category/fetch-main-categories", {
    method: "GET",
  });
}

/* … سایر توابع (getBrandDetails, getModelsByBrand, getFiltersByCategory, …) بدون تغییر */

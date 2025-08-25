// lib/server/shopaction.ts
"use server";

/**
 * فقط Server Actions اینجا باشند و همگی async.
 * هیچ تابع sync اینجا export نشود (تا ارور نگیری).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import type { AccountUser } from "@/app/types/account/account";

/* ---------------- helpers مشابه بقیه فایل‌ها ---------------- */

const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function resolveRootBase(publicBase: string, internalBase: string) {
  const pb = clean(publicBase || "/api/go");
  const ib = clean(internalBase || "");
  if (isAbs(pb)) return pb;
  if (!ib) return withLeadingSlash(pb);
  const tail = withLeadingSlash(pb);
  if (ib.endsWith(tail)) return ib;
  return ib + tail;
}

function joinUrl(base: string, path: string) {
  const cleanBase = (base || "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
}

async function getAuthHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

/* ---------------- Server Actions (همه async) ---------------- */

/** دریافت اطلاعات کاربر برای پر کردن فرم ویرایش فروشگاه */
export async function fetchUserInfoForEdit(): Promise<AccountUser> {
  const headers = await getAuthHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user/fetch-user");

  const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
  if (!res.ok) {
    try {
      const j = await res.json();
      throw new Error(j?.message || "Failed to fetch user");
    } catch {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Failed to fetch user");
    }
  }
  return (await res.json()) as AccountUser;
}

/** آپلود/ویرایش فروشگاه – ممکن است 204 برگردد، پس JSON parse نکن */
export async function updateShop(form: FormData): Promise<void> {
  const headers = await getAuthHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user/update-shop");

  const res = await fetch(url, {
    method: "PUT",
    headers,           // Content-Type را نگذار؛ FormData خودش boundary می‌سازد
    body: form,
    cache: "no-store",
  });

  if (!res.ok) {
    try {
      const j = await res.json();
      throw new Error(j?.message || "API request failed");
    } catch {
      const t = await res.text().catch(() => "");
      throw new Error(t || "API request failed");
    }
  }
  return;
}

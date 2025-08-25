// app/[role]/account/edit/server-api.ts
"use server";

/**
 * این فایل کامل و هم‌راستا با ساختار فعلی پروژه‌ست:
 * - از تایپ موجود: AccountUser (app/types/account/account.ts) استفاده می‌کند.
 * - URLها با منطق resolve/join ساخته می‌شوند (مثل سایر server-apiها).
 * - fetchUserInfoForEdit: برای پر کردن فرم ویرایش فروشگاه.
 * - buildUpdateShopForm: ساخت FormData مطابق انتظار بک‌اند (data + images).
 * - updateShop: ارسال فرم؛ روی موفقیت JSON parse نمی‌کند (جلوگیری از Unexpected end of JSON input).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import type { AccountUser } from "@/app/types/account/account";

/* ---------------- helpers (هم‌راستا با سایر فایل‌ها) ---------------- */

const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

/** ریشهٔ درست را می‌سازد؛ چه INTERNAL تهش /api/go داشته باشد چه نداشته باشد */
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

/* ---------------- auth header ---------------- */

async function getAuthHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

/* ---------------- متدهای صفحه ویرایش ---------------- */

/** دریافت اطلاعات کاربر جهت پر کردن فرم ویرایش فروشگاه */
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

/** ورودی‌های مجاز برای ساخت JSON فیلد `data` (داخل FormData) */
export type UpdateShopPayload = {
  shopName?: string;
  shopPhone1?: string;
  shopPhone2?: string;
  shopPhone3?: string;
  shopAddress?: string;
  telegramUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  websiteUrl?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

/**
 * ساخت FormData مطابق انتظار بک‌اند:
 * - data: رشته JSON
 * - images: فایل (اختیاری)
 */
export function buildUpdateShopForm(
  payload: UpdateShopPayload,
  imageFile?: File | null
): FormData {
  const fd = new FormData();
  fd.set(
    "data",
    JSON.stringify({
      shopName: payload.shopName ?? "",
      shopPhone1: payload.shopPhone1 ?? "",
      shopPhone2: payload.shopPhone2 ?? "",
      shopPhone3: payload.shopPhone3 ?? "",
      shopAddress: payload.shopAddress ?? "",
      telegramUrl: payload.telegramUrl ?? "",
      instagramUrl: payload.instagramUrl ?? "",
      whatsappUrl: payload.whatsappUrl ?? "",
      websiteUrl: payload.websiteUrl ?? "",
      latitude:
        payload.latitude === null || payload.latitude === undefined
          ? ""
          : String(payload.latitude),
      longitude:
        payload.longitude === null || payload.longitude === undefined
          ? ""
          : String(payload.longitude),
    })
  );

  if (imageFile && imageFile.size > 0) {
    // کلید باید دقیقاً "images" باشد (طبق هندلر Go)
    fd.append("images", imageFile);
  }
  return fd;
}

/**
 * آپلود/ویرایش فروشگاه.
 * نکتهٔ مهم: روی موفقیت، بدنه ممکن است خالی باشد (۲۰۴) → هیچ JSONی parse نکن.
 */
export async function updateShop(form: FormData): Promise<void> {
  const headers = await getAuthHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user/update-shop");

  const res = await fetch(url, {
    method: "PUT",
    headers, // ❌ Content-Type را ست نکن؛ FormData خودش boundary می‌سازد
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

  // ✅ موفقیت: ممکن است پاسخ خالی باشد → کاری نکن
  return;
}

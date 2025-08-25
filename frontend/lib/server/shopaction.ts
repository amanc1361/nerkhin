// lib/server/shopaction.ts
"use server";

/**
 * ✅ فایل واحد برای اکشن‌های سروری ویرایش فروشگاه:
 * - fetchUserInfoForEdit(): Promise<AccountUser>
 * - updateShop(form: FormData): Promise<void>
 * - updateShopAction(prevState, formData): Promise<UpdateShopResult>
 *
 * نکته‌ها:
 * - همه توابع export شده async هستن (الزام Next.js برای Server Actions).
 * - ساخت FormData داخل همین فایل انجام می‌شه ولی export نمی‌شه.
 * - روی موفقیتِ درخواست، JSON parse نمی‌کنیم (ممکنه 204 برگرده).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import type { AccountUser } from "@/app/types/account/account";

/* ---------------- helpers هم‌راستا با سایر فایل‌ها ---------------- */

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

/** دریافت اطلاعات کاربر برای فرم ویرایش فروشگاه */
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

/** ارسال فرم به /user/update-shop — ممکن است 204 برگردد، پس JSON parse نکن */
export async function updateShop(form: FormData): Promise<void> {
  const headers = await getAuthHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user/update-shop");

  const res = await fetch(url, {
    method: "PUT",
    headers, // ❌ Content-Type را ست نکن؛ FormData خودش boundary می‌سازه
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

/* ---------- نوع نتیجه برای useFormState ---------- */
export type UpdateShopResult = { ok: true } | { ok: false; error: string };

/* ---------- کمک‌تابع داخلی (export نشده) برای ساخت FormData ---------- */
function buildUpdateShopFormLocal(payload: {
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
}, imageFile?: File | null): FormData {
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
    // 👈 طبق بک‌اند کلید باید "images" باشد
    fd.append("images", imageFile);
  }

  return fd;
}

/**
 * اکشن سازگار با useFormState(prevState, formData)
 * name فیلدهای فرم باید این‌ها باشد:
 * image, shopName, shopPhone1, shopPhone2, shopPhone3, shopAddress,
 * telegramUrl, instagramUrl, whatsappUrl, websiteUrl, latitude, longitude
 */
export async function updateShopAction(
  _prevState: UpdateShopResult | null,
  formData: FormData
): Promise<UpdateShopResult> {
  try {
    const payload = {
      shopName: (formData.get("shopName") ?? "").toString(),
      shopPhone1: (formData.get("shopPhone1") ?? "").toString(),
      shopPhone2: (formData.get("shopPhone2") ?? "").toString(),
      shopPhone3: (formData.get("shopPhone3") ?? "").toString(),
      shopAddress: (formData.get("shopAddress") ?? "").toString(),
      telegramUrl: (formData.get("telegramUrl") ?? "").toString(),
      instagramUrl: (formData.get("instagramUrl") ?? "").toString(),
      whatsappUrl: (formData.get("whatsappUrl") ?? "").toString(),
      websiteUrl: (formData.get("websiteUrl") ?? "").toString(),
      latitude: (formData.get("latitude") ?? "").toString(),
      longitude: (formData.get("longitude") ?? "").toString(),
    };

    const file = formData.get("image") as File | null;
    const fd = buildUpdateShopFormLocal(payload, file);

    await updateShop(fd);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "خطای ناشناخته" };
  }
}

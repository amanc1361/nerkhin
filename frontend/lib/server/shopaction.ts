// lib/server/shopaction.ts
"use server";

/**
 * ✅ اکشن‌های سروری حساب/فروشگاه + لاگ کامل:
 * - fetchUserInfoForEdit(): Promise<AccountUser>  ← اینجا imageUrl را مطلق می‌کنیم و placeholder امن می‌گذاریم
 * - updateShop(form: FormData): Promise<void>
 * - updateShopAction(prevState, formData): Promise<UpdateShopResult>  ← شامل revalidatePath
 *
 * نکات:
 * - همه توابع export شده async هستند (قانون Server Actions).
 * - روی موفقیتِ درخواست، JSON parse نمی‌کنیم (ممکن است 204 برگردد).
 * - اگر DEBUG_SHOP=1 باشد، تمام ورودی/خروجی‌ها لاگ می‌شوند.
 */

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import type { AccountUser } from "@/app/types/account/account";

/* ---------------- Debug helpers ---------------- */

const DEBUG = process.env.DEBUG_SHOP === "1";
function dbg(...args: any[]) {
  if (DEBUG) console.log("[shopaction]", ...args);
}
function maskToken(token?: string) {
  if (!token) return "";
  return token.length <= 12 ? "***" : token.slice(0, 12) + "...";
}

/* ---------------- URL helpers (طبق الگوی پروژه) ---------------- */

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

/* ---------------- auth header ---------------- */

async function getAuthHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!token) throw new Error("Not authenticated");
  dbg("Auth token:", maskToken(token));
  return { Authorization: `Bearer ${token}` };
}

/* ---------------- image resolver ---------------- */

/**
 * سرور معمولاً فقط filename یا مسیر نسبی می‌دهد؛ این متد آن را مطلق می‌کند.
 * می‌تونی این دو env را در .env.frontend تنظیم کنی، وگرنه پیش‌فرض امن داریم:
 *   NEXT_PUBLIC_FILE_HOST=https://nerkhin.com
 *   NEXT_PUBLIC_FILE_PREFIX=/uploads
 */
const FILE_HOST =
  (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
const FILE_PREFIX = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "").replace(/\/+$/, "");

function absolutizeImageUrl(img?: string | null): string | undefined {
  if (!img) return undefined;
  const val = String(img).trim();
  if (!val) return undefined;
  if (/^https?:\/\//i.test(val)) return val;

  // اگر مسیر نسبی کامل باشد (مثلاً "uploads/xxx.webp" یا "/uploads/xxx.webp")
  if (/^\/?uploads\//i.test(val)) {
    const cleaned = val.replace(/^\/+/, ""); // حذف اسلش ابتدایی
    return `${FILE_HOST}/${cleaned}`;
  }

  // اگر فقط filename است (بدون دایرکتوری)
  const file = val.replace(/^\/+/, "");
  return `${FILE_HOST}${FILE_PREFIX}/${file}`;
}

/** placeholder امن (data URL) تا اگر فایل نبود 404 نگیریم */
const FALLBACK_AVATAR_DATA = `data:image/svg+xml;utf8,` + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
     <defs>
       <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='%23EEE'/>
         <stop offset='1' stop-color='%23DDD'/>
       </linearGradient>
     </defs>
     <rect width='100%' height='100%' fill='url(%23g)'/>
     <circle cx='64' cy='48' r='24' fill='%23bbb'/>
     <rect x='20' y='84' width='88' height='28' rx='14' fill='%23c9c9c9'/>
   </svg>`
);

/* ---------------- Server Actions (همه async) ---------------- */

export async function fetchUserInfoForEdit(): Promise<AccountUser> {
  const headers = await getAuthHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user/fetch-user");

  dbg("GET", url);
  const res = await fetch(url, { method: "GET", headers, cache: "no-store" });

  dbg("Response(fetch-user):", res.status, res.statusText);
  if (!res.ok) {
    try {
      const j = await res.json();
      dbg("Error body(JSON):", j);
      throw new Error(j?.message || "Failed to fetch user");
    } catch {
      const t = await res.text().catch(() => "");
      dbg("Error body(text):", t);
      throw new Error(t || "Failed to fetch user");
    }
  }

  const data = (await res.json()) as AccountUser;

  // ✅ تصویر را مطلق کن (اگر فقط filename یا مسیر نسبی بود)
  const resolved = absolutizeImageUrl(data?.imageUrl as any);
  data.imageUrl = resolved || FALLBACK_AVATAR_DATA;

  dbg("Received user:", {
    id: data?.id,
    fullName: data?.fullName,
    imageUrl: data?.imageUrl,
    hasShop: !!(data?.shopName || data?.shopAddress),
  });
  return data;
}

/* ---------- نوع نتیجه برای useFormState ---------- */
export type UpdateShopResult = { ok: true } | { ok: false; error: string };

/* ---------- کمک‌تابع داخلی (export نشده) برای ساخت FormData ---------- */
function buildUpdateShopFormLocal(
  payload: {
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
  },
  imageFile?: File | null
): FormData {
  const fd = new FormData();

  const dataString = JSON.stringify({
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
  });

  fd.set("data", dataString);

  if (imageFile && imageFile.size > 0) {
    fd.append("images", imageFile); // طبق هندلر Go
  }

  if (DEBUG) {
    const img = imageFile
      ? { name: (imageFile as any)?.name, size: imageFile.size, type: imageFile.type }
      : null;
    dbg("Outgoing FormData:", {
      dataLen: dataString.length,
      hasImage: !!imageFile,
      imageMeta: img,
    });
  }

  return fd;
}

/** ارسال فرم به /user/update-shop — ممکن است 204 برگردد، پس JSON parse نکن */
export async function updateShop(form: FormData): Promise<void> {
  const headers = await getAuthHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user/update-shop");

  if (DEBUG) {
    const dataField = form.get("data") as string | File | null;
    const dataStr =
      typeof dataField === "string"
        ? dataField
        : dataField
        ? "[File]"
        : "[null]";
    const img = form.get("images") as File | null;
    dbg("PUT", url, {
      hasData: !!dataField,
      dataPreview: typeof dataField === "string" ? dataField.slice(0, 200) : dataStr,
      hasImage: !!img,
      imageMeta: img ? { name: (img as any)?.name, size: img.size, type: img.type } : null,
    });
  }

  const res = await fetch(url, {
    method: "PUT",
    headers, // ❌ Content-Type را ست نکن؛ FormData خودش boundary می‌سازد
    body: form,
    cache: "no-store",
  });

  dbg("Response(update-shop):", res.status, res.statusText);

  if (!res.ok) {
    try {
      const j = await res.json();
      dbg("Error body(JSON):", j);
      throw new Error(j?.message || "API request failed");
    } catch {
      const t = await res.text().catch(() => "");
      dbg("Error body(text):", t);
      throw new Error(t || "API request failed");
    }
  }

  try {
    const ct = res.headers.get("content-type");
    dbg("Success headers:", { "content-type": ct });
  } catch {}
  return;
}

/**
 * اکشن سازگار با useFormState(prevState, formData)
 * name فیلدهای فرم باید این‌ها باشد:
 * image, shopName, shopPhone1, shopPhone2, shopPhone3, shopAddress,
 * telegramUrl, instagramUrl, whatsappUrl, websiteUrl, latitude, longitude
 *
 * نکته مهم: برای invalidation باید <input type="hidden" name="role" value="wholesaler|retailer" /> را هم از فرم بفرستی.
 */
export async function updateShopAction(
  _prevState: UpdateShopResult | null,
  formData: FormData
): Promise<UpdateShopResult> {
  try {
    if (DEBUG) {
      const raw: Record<string, any> = {};
      for (const [k, v] of formData.entries()) {
        if (v instanceof File) raw[k] = { file: true, name: (v as any)?.name, size: v.size, type: v.type };
        else raw[k] = String(v);
      }
      dbg("Incoming formData:", raw);
    }

    const roleRaw = (formData.get("role") ?? "").toString().toLowerCase();
    const role = roleRaw === "wholesaler" || roleRaw === "retailer" ? roleRaw : "";

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
      latitude: (formData.get("latitude") ?? "").toString() || "",
      longitude: (formData.get("longitude") ?? "").toString() || "",
    };

    const file = formData.get("image") as File | null;
    const fd = buildUpdateShopFormLocal(payload, file);

    await updateShop(fd);

    if (role) {
      dbg("revalidatePath ->", `/${role}/account`);
      revalidatePath(`/${role}/account`, "page");
    } else {
      dbg("revalidatePath -> / (layout)");
      revalidatePath("/", "layout");
    }

    return { ok: true };
  } catch (e: any) {
    dbg("updateShopAction error:", e?.message || e);
    return { ok: false, error: e?.message || "خطای ناشناخته" };
  }
}

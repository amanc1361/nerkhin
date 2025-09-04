import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { FavoriteAccount } from "@/app/types/account/account";

/* ---------- URL helpers (مطابق الگوی پروژه) ---------- */
const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function resolveRootBase(publicBase: string, internalBase: string) {
  const pb = clean(publicBase || "/api/go");
  const ib = clean(internalBase || "");
  if (isAbs(pb)) return pb;
  if (!ib) return withSlash(pb);
  const tail = withSlash(pb);
  return ib.endsWith(tail) ? ib : ib + tail;
}

const ROOT = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL);



type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; message?: string };

async function authFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const session = await getServerSession(authOptions);
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      // اگر گیت‌وی/بک‌اندت از کوکی سشن استفاده می‌کند، همین کافی است؛
      // اگر Bearer لازم داری اینجا اضافه کن:
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    // برای SSR:
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/** دریافت لیست فروشگاه‌های مورد علاقه‌ی من (SSR) */
export async function getMyFavoriteAccounts(): Promise<FavoriteAccount[]> {
  const out = await authFetch<FavoriteAccount[]>(`${ROOT}/favorite-account/my-favorite-accounts`);

  
  return out;
}

/** دریافت لیست کاربرانی که من را فالو/لایک کرده‌اند (SSR) */
export async function getMyCustomers(): Promise<FavoriteAccount[]> {
  const out = await authFetch<ApiSuccess<FavoriteAccount[]>>(`${ROOT}/favorite-account/my-customers`);
  return out.data;
}

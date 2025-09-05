"use server";

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { MyCustomersViewModel } from "@/app/types/account/account";


/* ---------- URL helpers: هم‌راستا با userProductActions.ts ---------- */
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

/* ---------- authFetch مثل الگوی شما ---------- */
async function authFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken || (session as any)?.user?.token;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    // SSR
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/* ---------- API ---------- */
// کسانی که «فروشگاه من را» پسند کرده‌اند
export async function fetchMyCustomers(): Promise<MyCustomersViewModel[]> {
  const url = `${ROOT}/favorite-account/my-customers`;
  // پاسخ استاندارد شما معمولاً {data: ...} یا مستقیم آرایه است—اگر StandardHandler دارید، مطابق آن تنظیم کنید:
  const out = await authFetch<any>(url);
  const data = Array.isArray(out?.data) ? out.data : Array.isArray(out) ? out : [];
  return data as MyCustomersViewModel[];
}

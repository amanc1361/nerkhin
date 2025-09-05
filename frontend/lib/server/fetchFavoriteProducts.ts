// lib/server/fetchFavoriteProducts.ts
import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

/** ---------- URL helpers (مطابق فایل‌های قبلی مثل userProductActions) ---------- */
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

/** ---------- Types ---------- */
export type FavoriteProduct = {
  id: number;
  userId: number;
  productId: number;
};
export type FavoriteProductsViewModel = FavoriteProduct & {
  productCategoryTitle: string;
  productBrandTitle: string;
  productModelTitle: string;
  productShopCount: number;
  productPrice: string | number; // بک‌اند decimal — اینجا رشته یا عدد
  productDefaultImageUrl: string | null;
  productCreationAt: string; // ISO
};

/** SSR fetch (با توکن سشن) */
export async function fetchFavoriteProductsSSR(): Promise<FavoriteProductsViewModel[]> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.user?.accessToken || (session as any)?.accessToken;

  const url = `${ROOT}/favorite-product/my-favorite-products`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // خطا را پرتاب می‌کنیم تا error boundary صفحه نشان دهد
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load favorites (${res.status}): ${text}`);
  }

  const data = (await res.json()) as FavoriteProductsViewModel[];
  return Array.isArray(data) ? data : [];
}

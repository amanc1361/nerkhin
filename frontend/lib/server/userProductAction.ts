// lib/server/userProductActions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import { PriceListVM, UserProductVM } from "@/app/types/userproduct/userProduct";


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
function joinUrl(base: string, path: string) {
  const b = (base || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`.replace(/([^:]\/)\/+/g, "$1");
}
async function authHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMyShopProductsSSR(): Promise<UserProductVM[]> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-shop");

  const res = await fetch(url, { headers, cache: "no-store" });

  const raw = await res.clone().text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${raw}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Response is not valid JSON:\n" + raw);
  }

  // payload می‌تونه مستقیم باشه یا داخل data
  const payload = parsed?.data ?? parsed;

  // اگر شکل { shopInfo, products } بود، محصولات را بردار
  const items =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.products)
        ? payload.products
        : [];



  return items as UserProductVM[];
}


export async function fetchPriceListSSR(): Promise<PriceListVM> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-price-list");
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return {};
  const data = await res.json();
  const usd =
    data?.usdPrice ?? data?.dollarPrice ?? data?.price?.usd ?? data?.priceUSD ?? data?.USD ?? null;
  return { usdPrice: usd ?? null };
}

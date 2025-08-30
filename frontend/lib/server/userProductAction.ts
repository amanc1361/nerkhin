// lib/server/userProductActions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";
import type {
  PriceListVM,
  ShopViewModel,
  UserProductVM,
  UserProductView,
} from "@/app/types/userproduct/userProduct";

// ---------------- URL helpers ----------------
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

// ---------------- Auth ----------------
async function authHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

// ---------------- JSON extractor ----------------
async function readJson<T>(res: Response): Promise<T> {
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
  const payload = parsed?.data ?? parsed;
  return payload as T;
}

// ---------------- Mappers ----------------
function toStringOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return typeof v === "string" ? v : String(v);
}

function mapUserProductViewToVM(p: UserProductView): UserProductVM {
  return {
    id: p.id,
    isDollar: !!p.isDollar,
    dollarPrice: toStringOrNull((p as any).dollarPrice?.String ?? (p as any).dollarPrice),
    otherCosts: toStringOrNull((p as any).otherCosts?.String ?? (p as any).otherCosts),
    finalPrice: toStringOrNull((p as any).finalPrice?.String ?? (p as any).finalPrice) ?? "",
    createdAt: p.createdAt,
    product: {
      id: p.productId,
      brandTitle: p.productBrand,
      modelName: p.modelName,
      imageUrl: p.defaultImageUrl,
    },
  };
}

// ---------------- Actions (names unchanged) ----------------

// قبلاً هم از همین روت استفاده می‌کردی؛ خروجی الان { shopInfo, products } است.
// این تابع همچنان فقط آرایه محصولات را به فرمت UserProductVM برمی‌گرداند.
export async function fetchMyShopProductsSSR(): Promise<UserProductVM[]> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-shop");

  const res = await fetch(url, { headers, cache: "no-store" });

  // خروجی می‌تونه مستقیم یا داخل data باشه
  const payload = await readJson<ShopViewModel | UserProductView[] | { products: UserProductView[] }>(res);

  // حالت‌های مختلف پاسخ را ساپورت کن:
  let products: UserProductView[] = [];
  if (Array.isArray(payload)) {
    products = payload;
  } else if (payload && Array.isArray((payload as any).products)) {
    products = (payload as any).products;
  }

  return products.map(mapUserProductViewToVM);
}

// بدون تغییر نام: لیست قیمت دلار
export async function fetchPriceListSSR(): Promise<PriceListVM> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-price-list");

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return {};

  // این ریسپانس در پروژه تو بعضی‌وقت‌ها مستقیم و بعضی‌وقت‌ها در data بوده
  const raw = await res.clone().text();
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  const data = parsed?.data ?? parsed;

  const usd =
    data?.usdPrice ??
    data?.dollarPrice ??
    data?.price?.usd ??
    data?.priceUSD ??
    data?.USD ??
    null;

  return { usdPrice: usd ?? null };
}

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

// ---------------- Query type (اختیاری) ----------------
export type ShopProductsQuery = {
  shopId?: number;              // اگر ندهی، سرور از کاربر فعلی استفاده می‌کند
  brandIds?: number[];          // چند برند: [1,2,5]
  categoryId?: number;          // دستهٔ اصلی
  subCategoryId?: number;       // زیردسته (در صورت وجود در DB)
  isDollar?: boolean | null;    // null => هر دو | true => ارزی | false => ریالی
  sortUpdated?: "asc" | "desc"; // پیش‌فرض: "desc"
  search?: string;              // جستجو روی برند/مدل/توضیح/دسته
  limit?: number;               // پیش‌فرض سرور: 100
  offset?: number;              // پیش‌فرض سرور: 0
};

function buildFetchShopQueryString(q?: ShopProductsQuery) {
  if (!q) return "";
  const params = new URLSearchParams();
  if (q.shopId) params.set("shopId", String(q.shopId));
  if (q.brandIds?.length) params.set("brandIds", q.brandIds.join(","));
  if (q.categoryId) params.set("categoryId", String(q.categoryId));
  if (q.subCategoryId) params.set("subCategoryId", String(q.subCategoryId));
  if (typeof q.isDollar === "boolean") params.set("isDollar", q.isDollar ? "1" : "0");
  if (q.search) params.set("search", q.search);
  if (q.sortUpdated) params.set("sortUpdated", q.sortUpdated);
  if (typeof q.limit === "number") params.set("limit", String(q.limit));
  if (typeof q.offset === "number") params.set("offset", String(q.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ---------------- Actions (names unchanged) ----------------
// نکته: امضا را توسعه دادیم تا پارامتر اختیاری بگیرد؛
// اگر آرگیومانی ندهی مثل قبل «همهٔ محصولات» را برمی‌گرداند.
export async function fetchMyShopProductsSSR(q?: ShopProductsQuery): Promise<UserProductVM[]> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-shop") + buildFetchShopQueryString(q);

  const res = await fetch(url, { headers, cache: "no-store" });

  // خروجی می‌تواند مستقیم یا داخل data باشد: { shopInfo, products }
  const payload = await readJson<ShopViewModel | UserProductView[] | { products: UserProductView[] }>(res);

  let products: UserProductView[] = [];
  if (Array.isArray(payload)) {
    products = payload;
  } else if (payload && Array.isArray((payload as any).products)) {
    products = (payload as any).products;
  }

  return products.map(mapUserProductViewToVM);
}

// در صورت نیاز به ShopInfo هم، این تابع خام را هم می‌دهیم:
export async function fetchMyShopProductsRawSSR(q?: ShopProductsQuery): Promise<ShopViewModel> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-shop") + buildFetchShopQueryString(q);

  const res = await fetch(url, { headers, cache: "no-store" });
  const payload = await readJson<ShopViewModel | { products: UserProductView[] }>(res);

  // نرمال‌سازی به ShopViewModel
  if ((payload as any)?.shopInfo) {
    return payload as ShopViewModel;
  }
  const products = Array.isArray((payload as any)?.products) ? (payload as any).products : [];
  return { shopInfo: undefined as any, products } as ShopViewModel;
}

// بدون تغییر نام: لیست قیمت دلار
export async function fetchPriceListSSR(): Promise<PriceListVM> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-price-list");

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return {};

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

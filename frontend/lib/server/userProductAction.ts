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
import { MarketItemVM, MarketSearchQuery, MarketSearchResult, MarketSearchVM, UserProductMarketView } from "@/app/types/userproduct/market";
import { getUserProductMessages } from "./texts/userProdutMessages";


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


export async function fetchShopByUserIdSSR({ userId }: { userId: number }): Promise<ShopViewModel> {
  if (!userId || Number.isNaN(Number(userId))) {
    throw new Error("fetchShopByUserIdSSR: invalid userId");
  }

  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, `/user-product/fetch-shop/${encodeURIComponent(String(userId))}`);

  const res = await fetch(url, { headers, cache: "no-store" });

  // سرور ممکن است یا مستقیماً ShopViewModel بدهد یا { products: UserProductView[] }
  const payload = await readJson<ShopViewModel | { products: UserProductView[] }>(res);

  if ((payload as any)?.shopInfo) {
    return payload as ShopViewModel;
  }

  const products = Array.isArray((payload as any)?.products) ? (payload as any).products : [];
  return { shopInfo: undefined as any, products } as ShopViewModel;
}
// در صورت نیاز به ShopInfo هم، این تابع خام را هم می‌دهیم:
export async function fetchMyShopProductsRawSSR(q?: ShopProductsQuery): Promise<ShopViewModel> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-shop") + buildFetchShopQueryString(q);
  const res = await fetch(url, { headers, cache: "no-store" });
  console.log(url)
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
  


  return { usdPrice: parsed?.shopInfo?.dollarPrice ?? null };
}
function absolutizeUploads(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerrkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = imageUrl.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

function setMulti(params: URLSearchParams, key: string, values?: Array<string | number>) {
  if (!values?.length) return;
  for (const v of values) params.append(key, String(v));
}

function buildMarketSearchQS(q?: MarketSearchQuery) {
  if (!q) return "";
  const p = new URLSearchParams();
  if (typeof q.limit === "number") p.set("limit", String(q.limit));
  if (typeof q.offset === "number") p.set("offset", String(q.offset));
  if (q.sortBy) p.set("sortBy", q.sortBy);
  if (q.sortUpdated) p.set("sortDir", q.sortUpdated);

  if (q.categoryId) p.set("categoryId", String(q.categoryId));
  if (q.subCategoryId) p.set("subCategoryId", String(q.subCategoryId));
  setMulti(p, "brandId", q.brandId);
  setMulti(p, "optionId", q.optionId);
  setMulti(p, "filterId", q.filterId);
  setMulti(p, "tag", q.tag);
  if (q.search) p.set("search", q.search);

  if (q.isDollar === true) p.set("isDollar", "1");
  else if (q.isDollar === false) p.set("isDollar", "0");

  if (q.cityId) p.set("cityId", String(q.cityId));
  if (q.enforceSubscription) p.set("enforceSubscription", "1");
  if (q.onlyVisible === false) p.set("onlyVisible", "0");
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

function mapMarketItemToVM(p: UserProductMarketView): MarketItemVM {
  const dollar =
    (p as any).dollarPrice?.String ??
    (p as any).dollarPrice ??
    null;

  return {
    id: p.id,
    productId: p.productId,
    userId: p.userId,
    isDollar: !!p.isDollar,
    finalPrice: String((p as any).finalPrice?.String ?? p.finalPrice ?? ""),
    dollarPrice: dollar === null || dollar === undefined ? null : String(dollar),
    order: p.order,

    modelName: p.modelName,
    brandId: p.brandId,
    brandTitle: p.brandTitle,
    categoryId: p.categoryId,
    categoryTitle: p.categoryTitle,

    imageUrl: absolutizeUploads(p.defaultImageUrl),
    imagesCount: p.imagesCount,
    description: p.description,

    shopName: p.shopName,
    cityId: p.cityId,
    cityName: p.cityName,
   isLiked:p.isFavorite,
    updatedAt: p.updatedAt,
  };
}

// ... بقیه کد بدون تغییر ...

// ---------------- Actions ----------------
export async function fetchMyShopProductsSSR(q?: ShopProductsQuery): Promise<ShopViewModel> {
  const headers = await authHeader();
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/fetch-shop") + buildFetchShopQueryString(q);

  const res = await fetch(url, { headers, cache: "no-store" });


  const payload = await readJson<ShopViewModel>(res);
  
  return payload; // الان شامل products و total
}

// --------- اکشن SSR: جستجوی بازار عمده‌فروشان ---------
export async function searchMarketSSR(q: MarketSearchQuery, locale: "fa" | "en" = "fa"): Promise<MarketSearchVM> {
  const headers = await authHeader(); // در صورت نیاز به enforceSubscription یا viewerID
  const t = getUserProductMessages(locale);
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL || "");
  const url = joinUrl(base, "/user-product/search") + buildMarketSearchQS(q);

  const res = await fetch(url, { headers, cache: "no-store" });
  console.log("RAW RESPONSE:", await res.clone().text());
  const payload = await readJson<MarketSearchResult>(res);
  console.log("PAYLOAD:", payload);

  const items = Array.isArray(payload?.items) ? payload.items : [];
  const total = Number(payload?.total ?? 0);

  const mapped: MarketItemVM[] = items.map(mapMarketItemToVM);

 

  return { items: mapped, total };
}

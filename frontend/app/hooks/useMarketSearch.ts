// app/hooks/useMarketSearch.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { userProductApi } from "@/app/services/userProductService";
import type {
  MarketSearchQuery,
  MarketSearchVM,
  UserProductMarketView,
} from "@/app/types/userproduct/market";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { toast } from "react-toastify";

// ---------- utils ----------
function absolutizeUploads(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = imageUrl.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

function mapMarketItemToVM(p: any) {
  const dollar = p?.dollarPrice?.String ?? p?.dollarPrice ?? null;
  return {
    id: p.id,
    productId: p.productId,
    userId: p.userId,
    isDollar: !!p.isDollar,
    finalPrice: String(p?.finalPrice?.String ?? p.finalPrice ?? ""),
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

    updatedAt: p.updatedAt,
  };
}

/** حذف کلیدهای تهی بدون جنریک */
function pruneRecord(obj: Record<string, any>) {
  const out: Record<string, string | number | boolean> = {};
  Object.keys(obj || {}).forEach((k) => {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") out[k] = v as any;
  });
  return out;
}

/** مپ state → پارامترهای URL سرور (با تحمل نام‌های مختلف) */
function toServerParams(q: MarketSearchQuery) {
  const qq = q as any;

  // alias برای min/max
  const priceMin = qq.priceMin ?? qq.min;
  const priceMax = qq.priceMax ?? qq.max;

  // isDollar بولین → 1/0
  let isDollar: number | undefined;
  if (typeof qq.isDollar === "boolean") isDollar = qq.isDollar ? 1 : 0;

  // sortUpdated پروژه → sortDir سرور
  const sortDir = (qq.sortUpdated ?? "desc") as "asc" | "desc";

  // brandIds/optionIds/filterIds به comma-separated (در مرحله بعد به repeated تبدیل می‌کنیم)
  const brandId =
    Array.isArray(qq.brandIds) && qq.brandIds.length ? qq.brandIds.join(",") : undefined;
  const optionId =
    Array.isArray(qq.optionIds) && qq.optionIds.length ? qq.optionIds.join(",") : undefined;
  const filterId =
    Array.isArray(qq.filterIds) && qq.filterIds.length ? qq.filterIds.join(",") : undefined; // ← اضافه شد

  const base: Record<string, any> = {
    limit: qq.limit,
    offset: qq.offset,
    search: (qq.search || "").trim(),
    onlyVisible: qq.onlyVisible,
    categoryId: qq.categoryId,
    brandId,
    optionId,
    filterId, // ← اضافه شد
    isDollar,
    priceMin,
    priceMax,
    cityId: qq.cityId,
    sortBy: qq.sortBy || "updated",
    sortDir,
  };

  return pruneRecord(base);
}

/** ادغام امن پارامترهای جدید با URL موجود و تبدیل آرایه‌ها به پارامترهای تکراری */
function mergeUrlWithParams(baseUrl: string, params: Record<string, string | number | boolean>) {
  if (!baseUrl) return "";

  const applyMultiKeys = (usp: URLSearchParams) => {
    // کلیدهای چندمقداری را از comma-separated به **تکراری** تبدیل کن
    (["brandId", "optionId", "filterId"] as const).forEach((k) => {
      // اگر مقدار جدید برای این کلید نداریم، کاری نکنیم (تا اگر قبلاً در URL بوده حفظ شود)
      if (params[k] === undefined || params[k] === null || params[k] === ("" as any)) {
        return;
      }
      const raw = String(params[k]);
      usp.delete(k);
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((v) => usp.append(k, v));
    });
  };

  // اگر URL شامل query هست، ادغام کنیم
  const qIndex = baseUrl.indexOf("?");
  if (qIndex >= 0) {
    const path = baseUrl.slice(0, qIndex);
    const qs = baseUrl.slice(qIndex + 1);
    const usp = new URLSearchParams(qs);

    Object.entries(params).forEach(([k, v]) => {
      // برای کلیدهای چندمقداری، set موقت انجام می‌دهیم و بلافاصله تبدیل می‌کنیم
      usp.set(k, String(v));
    });

    applyMultiKeys(usp);

    const s = usp.toString();
    return s ? `${path}?${s}` : path;
  }

  // اگر query نداشت، از اول بسازیم
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => usp.set(k, String(v)));
  applyMultiKeys(usp);

  const s = usp.toString();
  return s ? `${baseUrl}?${s}` : baseUrl;
}

// ---------- hook ----------
export function useMarketSearch(initial?: MarketSearchQuery, locale: "fa" | "en" = "fa") {
  const { api } = useAuthenticatedApi();
  const t = getUserProductMessages(locale);

  const [query, setQuery] = useState<MarketSearchQuery>(() => ({
    limit: 24,
    offset: 0,
    sortBy: "updated",
    sortUpdated: "desc",
    onlyVisible: true,
    ...initial,
  }));
  const [data, setData] = useState<MarketSearchVM>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const page = useMemo(
    () => Math.floor((query.offset ?? 0) / (query.limit || 1)) + 1,
    [query.offset, query.limit]
  );

  const run = useCallback(
    async (q: MarketSearchQuery) => {
      setLoading(true);
      setError(null);
      try {
        const d = userProductApi.marketSearch(q); // همون سرویس خودت
        const params = toServerParams(q);

        // URL نهایی با merge ایمن (و تبدیل multi به repeated)
        const finalUrl = mergeUrlWithParams(d.url, params);

        // برای دیباگ:
        // eslint-disable-next-line no-console
        console.debug("[marketSearch][GET]", finalUrl);

        // همون امضای فعلی شما (بدون data/params)
        const res = await api[d.method as "get"]<{
          items: UserProductMarketView[];
          total: number;
        }>({
          url: finalUrl,
        });

        const items = Array.isArray(res?.items) ? res.items : [];
        const total = Number(res?.total ?? 0);
        setData({ items: items.map(mapMarketItemToVM), total });
      } catch (e: any) {
        const msg = e?.message || t.toasts.error;
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [api, t.toasts.error]
  );

  // debounce fetch on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => run(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, run]);

  // helpers صفحه‌بندی
  const setPage = useCallback(
    (p: number) => {
      const limit = query.limit ?? 24;
      setQuery((q) => ({ ...q, offset: Math.max(0, (p - 1) * limit) }));
    },
    [query.limit]
  );

  const setLimit = useCallback((limit: number) => {
    setQuery((q) => ({ ...q, limit, offset: 0 }));
  }, []);

  return {
    query,
    setQuery,
    setPage,
    setLimit,
    page,
    data,
    loading,
    error,
    refresh: () => run(query),
  };
}

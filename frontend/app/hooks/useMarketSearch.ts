// app/hooks/useMarketSearch.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { userProductApi } from "@/app/services/userProductService";
import type { MarketSearchQuery, MarketSearchVM, UserProductMarketView } from "@/app/types/userproduct/market";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { toast } from "react-toastify";

// اگر ترجیح می‌دهی util ابسولوت کردن را از یک جای مشترک import کنی، جایگزین کن
function absolutizeUploads(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = imageUrl.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

function mapMarketItemToVM(p: any) {
  const dollar =
    p?.dollarPrice?.String ??
    p?.dollarPrice ??
    null;

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

  const page = useMemo(() => Math.floor((query.offset ?? 0) / (query.limit || 1)) + 1, [query.offset, query.limit]);

  const run = useCallback(async (q: MarketSearchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const d = userProductApi.marketSearch(q);
      const res = await api[d.method]<{ items: UserProductMarketView[]; total: number }>({ url: d.url });
      const items = Array.isArray(res?.items) ? res.items : [];
      const total = Number(res?.total ?? 0);
      setData({ items: items.map(mapMarketItemToVM), total });
    } catch (e: any) {
      setError(e?.message || t.toasts.error);
      toast.error(e?.message || t.toasts.error);
    } finally {
      setLoading(false);
    }
  }, [api, t.toasts.error]);

  // debounce fetch on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => run(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, run]);

  // helpers برای صفحه‌بندی
  const setPage = useCallback((p: number) => {
    const limit = query.limit ?? 24;
    setQuery((q) => ({ ...q, offset: Math.max(0, (p - 1) * limit) }));
  }, [query.limit]);

  const setLimit = useCallback((limit: number) => {
    setQuery((q) => ({ ...q, limit, offset: 0 }));
  }, []);

  return {
    query, setQuery, setPage, setLimit,
    page,
    data, loading, error,
    refresh: () => run(query),
  };
}

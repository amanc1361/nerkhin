import { useCallback, useEffect, useState } from "react";

import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { productMessages } from "@/app/constants/productMessages";
import { productApi } from "@/app/services/brandapi";
import { ProductViewModel } from "@/app/types/product/product";
import { PaginatedResult } from "@/app/types/paginate/pagination";

const PAGE_SIZE = 200; // می‌تونی تغییر بدی یا از بیرون بفرستی

export function useProductsByBrand(brandId: string | number, page: number = 1) {
  const { api } = useAuthenticatedApi();

  const [products, setProducts] = useState<ProductViewModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stamp, setStamp] = useState(0);

  const refresh = useCallback(() => setStamp((s) => s + 1), []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<PaginatedResult<ProductViewModel>>(
          productApi.getByBrand(brandId, page, PAGE_SIZE)
        );

        setProducts(res.data);
        setTotalCount(res.total || 0);
        setTotalPages(Math.ceil(res.total / PAGE_SIZE));
      } catch (err) {
        setError(productMessages.loadError);
      } finally {
        setLoading(false);
      }
    };

    if (brandId) fetch();
  }, [brandId, page, api, stamp]);

  return {
    products,
    totalCount,
    totalPages,
    loading,
    error,
    refresh,
  };
}

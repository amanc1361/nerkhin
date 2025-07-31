import { useState, useEffect, useCallback } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { FiltersResponse, ProductFilterData } from "@/app/types/model/model";

import { filterApi } from "@/app/services/filterApi";

export const useFiltersByCategoryAdmin = (categoryId: number) => {
  const { api } = useAuthenticatedApi();
  const [filters, setFilters]   = useState<ProductFilterData[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string|null>(null);
  const [stamp, setStamp]       = useState(0);

  const refresh = useCallback(() => setStamp((s) => s + 1), []);

useEffect(() => {
  setLoading(true);

  api
    .get<FiltersResponse>(filterApi.getByCategory(categoryId))
      .then((resp) => {
        console.log("پاسخ خام:", resp);    // ← ببینید دقیقاً چه می‌آید
        setFilters(resp.productFilters ?? []);
      })
    .catch((err) => setError(err))
    .finally(() => setLoading(false));
}, [api, categoryId, stamp]);

  return { filters, loading, error, refresh };
};

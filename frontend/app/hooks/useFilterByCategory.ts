"use client";

import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { ApiError } from "@/app/services/apiService";
import { FiltersResponse, ProductFilterData } from "@/app/types/model/model";
import { filterApi } from "@/app/services/filterApi";

export const useFiltersByCategory = (categoryId: number | string) => {
  const { api } = useAuthenticatedApi();
  const [filters, setFilters] = useState<ProductFilterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const data = await api.get<FiltersResponse>(filterApi.getByCategory(categoryId));
        
        setFilters(data.productFilters??[]); 
     
      
 
        setError(null);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "خطا در دریافت فیلترها";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [api, categoryId]);

  return { filters, loading, error };
};

"use client";

import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { ApiError } from "@/app/services/apiService";
import { Product, ProductViewModel } from "@/app/types/product/product";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface Props {
  categoryId?: number;
  search?: string;
  page: number;
}

export const useRegisteredProducts = ({ categoryId, search, page }: Props) => {
  const { api } = useAuthenticatedApi();
  const [products, setProducts] = useState<ProductViewModel[]>([]);
  const [pageNumber,setPage]=useState<number>(1)
  const [pageSize,setPageSize]=useState<number>(20)
  const [total,setTotal]=useState<number>(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // ساخت query string بر اساس مقادیر موجود
        const params = new URLSearchParams();
        if (categoryId == undefined) {categoryId=0;}
        if (search) params.append("search", search);
        params.append("page", String(page));

        const res = await api.get<PaginatedResult<ProductViewModel>>({
          url: `/product/by-category/${categoryId}?${params.toString()}`,
        });

        setProducts(res.data);
        setPage(res.page)
        setTotal(res.total)
        setPageSize(res.pageSize)
        setError(null);
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : "خطا در دریافت کالاهای ثبت‌شده";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [api, categoryId, search, page]);

  return { products,pageNumber,pageSize,total, loading, error };
};

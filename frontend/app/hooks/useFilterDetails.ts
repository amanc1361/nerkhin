"use client";

import { useState, useEffect } from "react";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { filterApi } from "@/app/services/filterApi";

/**
 * واکشی عنوان یک فیلتر یا گزینه برای حالت ویرایش
 */
export function useFilterDetails(
  type: "filter" | "option",
  id: number|string
): { title: string; loading: boolean } {
  const { api } = useAuthenticatedApi();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(!!id); // اگر id وجود دارد، true

  useEffect(() => {
    if (!id) return;

    const req =
      type === "filter" ? filterApi.fetchFilter(Number(id)) : filterApi.fetchOption(Number(id));

    api
      .get<{ title: string }>(req)
      .then((res) => setTitle(res.title))
      .finally(() => setLoading(false));
  }, [api, id, type]);

  return { title, loading };
}

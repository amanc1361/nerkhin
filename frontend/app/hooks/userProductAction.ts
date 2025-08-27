// app/hooks/useUserProducts.ts
import { useCallback, useEffect, useState } from "react";
import { UserProductVM } from "../types/userproduct/userProduct";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { userProductApi } from "../services/userProductService";

export function useUserProducts(initial?: UserProductVM[]) {
  const { api } = useAuthenticatedApi();
  const [items, setItems] = useState<UserProductVM[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = userProductApi.fetchMyShop();
      const data = await api[d.method]<UserProductVM[]>({ url: d.url });
      setItems(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { if (!initial) reload(); }, [initial, reload]);
  return { items, setItems, loading, reload };
}

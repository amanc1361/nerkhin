// app/hooks/useUserProductActions.ts
import { useCallback, useState } from "react";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { userProductApi } from "../services/userProductService";
import { toast } from "react-toastify";
import { ChangeOrderPayload, UpdateUserProductPayload } from "../types/userproduct/userProduct";


export function useUserProductActions(onSuccess?: () => void, locale: "fa" | "en" = "fa") {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = getUserProductMessages(locale);

  const changeOrder = useCallback(async (payload: ChangeOrderPayload) => {
    setIsSubmitting(true);
    try {
      const d = userProductApi.changeOrder(payload);
      await api[d.method]({ url: d.url, body: d.body });
      toast.success(t.toasts.orderSaved); onSuccess?.();
    } catch (e: any) { toast.error(e?.message || t.toasts.error); }
    finally { setIsSubmitting(false); }
  }, [api, onSuccess, t]);

  const changeStatus = useCallback(async (userProductId: number) => {
    setIsSubmitting(true);
    try {
      const d = userProductApi.changeStatus({ userProductId });
      await api[d.method]({ url: d.url, body: d.body });
      toast.success(t.toasts.statusChanged); onSuccess?.();
    } catch (e: any) { toast.error(e?.message || t.toasts.error); }
    finally { setIsSubmitting(false); }
  }, [api, onSuccess, t]);

  const update = useCallback(async (payload: UpdateUserProductPayload) => {
    setIsSubmitting(true);
    try {
      const d = userProductApi.update(payload);
      await api[d.method]({ url: d.url, body: d.body });
      toast.success(t.toasts.updated); onSuccess?.();
    } catch (e: any) { toast.error(e?.message || t.toasts.error); }
    finally { setIsSubmitting(false); }
  }, [api, onSuccess, t]);

const remove = useCallback(async (id: number) => {
  setIsSubmitting(true);
  try {
    const d = userProductApi.remove(id);
    await api[d.method]({ url: d.url }); // ✅ بدون body
    toast.success(t.toasts.deleted);
    onSuccess?.();
  } catch (e: any) {
    toast.error(e?.message || t.toasts.error);
  } finally {
    setIsSubmitting(false);
  }
}, [api, onSuccess, t]);

  return { isSubmitting, changeOrder, changeStatus, update, remove };
}

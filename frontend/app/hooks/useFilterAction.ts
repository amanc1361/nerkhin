"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";

import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { filterApi } from "@/app/services/filterApi";           // ← استفاده از فایل موجود
import { ApiError } from "@/app/services/apiService";
import { filterMessages as m } from "@/app/constants/filterMessage";
import { SuccessResponse } from "@/app/types/types";

export type FilterAction =
  | "createFilter"
  | "updateFilter"
  | "deleteFilter"
  | "createOption"
  | "updateOption"
  | "deleteOption";

export const useFilterActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [submitting, setSubmitting] = useState(false);

  const act = useCallback(
    async (action: FilterAction, data: any) => {
      setSubmitting(true);
      try {
        switch (action) {
          case "createFilter":
            await api.post<SuccessResponse>(filterApi.createFilter(data));
            break;
          case "updateFilter":
            await api.post<SuccessResponse>(filterApi.updateFilter(data));
            break;
          case "deleteFilter":
            await api.delete<SuccessResponse>(filterApi.deleteFilter(data.id));
            break;
          case "createOption":
            await api.post<SuccessResponse>(filterApi.createOption(data));
            break;
          case "updateOption":
            await api.post<SuccessResponse>(filterApi.updateOption(data));
            break;
          case "deleteOption":
            await api.delete<SuccessResponse>(filterApi.deleteOption(data.id));
            break;
        }
        toast.success(m.actionSuccess);
        onSuccess();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : m.actionError;
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [api, onSuccess]
  );

  return { submitting, act };
};

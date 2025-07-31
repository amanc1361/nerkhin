"use client";

import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { modelApi } from "@/app/services/brandapi";
import { ApiError } from "@/app/services/apiService";
import { modelPageMessages as messages } from "@/app/constants/modelmessage";
import { SuccessResponse, Brand, Model } from "@/app/types/types";

export type ModelActionType = "addModel" | "updateModel" | "deleteModel";

export const useBrandPageActions = (
  brand: Brand,
  onSuccess: (models: Model[]) => void
) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(
    async (action: ModelActionType, data: any) => {
      setIsSubmitting(true);
      try {
        let successMessage = "";

        switch (action) {
          case "addModel":
            await api.post<SuccessResponse>(modelApi.create(data));
            successMessage = messages.addSuccess;
            break;

          case "updateModel":
            await api.post<SuccessResponse>(modelApi.update(data));
            successMessage = messages.updateSuccess;
            break;

          case "deleteModel":
            await api.delete<SuccessResponse>(modelApi.delete(data.id));
            successMessage = messages.deleteSuccess;
            break;
        }

        toast.success(successMessage);

        // دریافت لیست جدید مدل‌ها از سرور
        const updatedModels = await api.get<Model[]>(
          modelApi.getByBrand(brand.id)
        );

        onSuccess(updatedModels); // ارسال به کامپوننت بالادست
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : messages.actionError;
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, brand, onSuccess]
  );

  return { isSubmitting, performAction };
};

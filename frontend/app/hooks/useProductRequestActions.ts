"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { ApiError } from "@/app/services/apiService";

import { productMessages as messages } from "@/app/constants/productMessages";

import { SuccessResponse } from "@/app/types/types";
import { ProductRequestViewModel } from "../types/product/productrequest";
import { productRequestApi } from "../services/productRequestApi";

type ActionType = "markAsChecked";

export const useProductRequestActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(
    async (action: ActionType, request: ProductRequestViewModel) => {
      setIsSubmitting(true);
      try {
        if (action === "markAsChecked") {
          await api.post<SuccessResponse>(
            productRequestApi.changeState({
              requestId: request.id,
              targetState: 2,
            })
          );
          toast.success(messages.stateChangeSuccess);
        }
        onSuccess();
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : messages.stateChangeError;
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, onSuccess]
  );

  return { isSubmitting, performAction };
};

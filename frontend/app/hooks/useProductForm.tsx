"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";

import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { filterApi } from "@/app/services/filterApi";
import { productApi } from "@/app/services/brandapi";

import { SuccessResponse } from "@/app/types/types";
import { ApiError } from "@/app/services/apiService";
import { productMessages as msg } from "@/app/constants/productMessages";

import { ProductFilterData } from "@/app/types/model/model";
import {
  ProductFormState,
  ProductTag,
} from "@/app/types/product/productFormState";
import { ProductViewModel } from "@/app/types/product/product";

interface Args {
  mode: "create" | "edit";
  brandId: number;
  categoryId: number;
  onSuccess: () => void;
  initialProduct?: ProductViewModel;
  presetFilters?: ProductFilterData[];
}

export const useProductForm = ({
  mode,
  brandId,
  categoryId,
  onSuccess,
  initialProduct,
  presetFilters,
}: Args) => {
  const { api } = useAuthenticatedApi();

  const [formData, setFormData] = useState<ProductFormState>(() => {
    if (mode === "edit" && initialProduct) {
      const optionSource = initialProduct.filterRelations ?? [];
      const selected: Record<number, number[]> = {};

      optionSource.forEach((rel: any) => {
        const fid = typeof rel.filterId === "number" ? rel.filterId : rel.Filter?.id;
        const oid = typeof rel.optionId === "number" ? rel.optionId : rel.Option?.id;
        if (fid !== undefined && oid !== undefined) {
          if (!selected[fid]) selected[fid] = [];
          selected[fid].push(oid);
        }
      });

      const remoteImages = (initialProduct.images ?? []).map((img, idx) => ({
        id: img.id,
        url: `https://nerrkhin.com/images/${img.url}`,
        isDefault: img.isDefault,
        _originIndex: idx,
      }));
      const defaultIdx = remoteImages.findIndex((i) => i.isDefault);

      return {
        modelName: initialProduct.modelName ?? "",
        description: initialProduct.description ?? "",
        tags: (initialProduct.tags ?? []) as ProductTag[],
        selectedOptions: selected,
        remoteImages,
        newImages: [],
        defaultImageIndex: defaultIdx >= 0 ? defaultIdx : 0,
        __newFilter: undefined,
        __newOption: undefined,
      };
    }

    return {
      modelName: "",
      description: "",
      tags: [],
      selectedOptions: {},
      remoteImages: [],
      newImages: [],
      defaultImageIndex: -1,
      __newFilter: undefined,
      __newOption: undefined,
    };
  });

  const [filters, setFilters] = useState<ProductFilterData[]>(presetFilters ?? []);
  const [loadingFilters, setLoadingFilters] = useState(!presetFilters);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (presetFilters) return;

    (async () => {
      setLoadingFilters(true);
      try {
        const data = await api.get<ProductFilterData[]>(filterApi.getByCategory(categoryId));
        setFilters(data);
      } catch {
        toast.error(msg.fetchFiltersError);
      } finally {
        setLoadingFilters(false);
      }
    })();
  }, [api, categoryId, presetFilters]);

  const handleSubmit = useCallback(async () => {
    if (!formData.description.trim()) {
      toast.error(msg.validationError);
      return;
    }
    if (!formData.modelName.trim()) {
      toast.error(msg.modelNameRequired);
      return;
    }

    const optionIds = Object.values(formData.selectedOptions).flat().map(Number);
    if (optionIds.length === 0) {
      toast.error(msg.noOptionSelected);
      return;
    }

    const fd = new FormData();

    const payload = {
      id: initialProduct?.id ?? 0,
      brandId,
      modelName: formData.modelName,
      description: formData.description,
      defaultImageIndex: formData.defaultImageIndex,
      filterOptionIds: optionIds,
      tags: formData.tags.map((t) => t.tag),
    };

    fd.append("data", JSON.stringify(payload));
    formData.newImages.forEach((f) => fd.append("images", f));

    setIsSubmitting(true);
    try {
      const url = mode === "edit" ? productApi.updateWithUrl : productApi.createWithUrl;
      await api.postMultipart<SuccessResponse>(url, fd);
      toast.success(mode === "edit" ? msg.updateSuccess : msg.createSuccess);
      onSuccess();
    } catch (err) {
      const m = err instanceof ApiError ? err.message : msg.genericServerError;
      toast.error(m);
    } finally {
      setIsSubmitting(false);
    }
  }, [api, mode, brandId, formData, initialProduct, onSuccess]);

  const setImages: React.Dispatch<React.SetStateAction<File[]>> = (value) =>
    setFormData((prev) => {
      const newImgs = typeof value === "function" ? (value as any)(prev.newImages) : value;
      return { ...prev, newImages: newImgs };
    });

  const setDefaultImageIndex: React.Dispatch<React.SetStateAction<number>> = (value) =>
    setFormData((prev) => {
      const idx = typeof value === "function" ? (value as any)(prev.defaultImageIndex) : value;
      return { ...prev, defaultImageIndex: idx };
    });

  return {
    formData,
    setFormData,
    images: formData.newImages,
    setImages,
    defaultImageIndex: formData.defaultImageIndex,
    setDefaultImageIndex,
    filters,
    isLoadingFilters: loadingFilters,
    isSubmitting,
    onSubmit: handleSubmit,
  };
};

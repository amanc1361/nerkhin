"use client";

import { useState, useEffect, useCallback } from "react";
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

// مسیر نمایش تصاویر ذخیره‌شده روی سرور: /uploads/{productId}/{index}.webp
const buildImageUrl = (productId: number, index: number) =>
  `/uploads/${productId}/${index}.webp`;

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
      // 1) بازسازی گزینه‌های انتخاب‌شده
      const optionSource = (initialProduct as any).filterRelations ?? [];
      const selected: Record<number, number[]> = {};
      optionSource.forEach((rel: any) => {
        const fid = typeof rel.filterId === "number" ? rel.filterId : rel.Filter?.id;
        const oid = typeof rel.optionId === "number" ? rel.optionId : rel.Option?.id;
        if (fid !== undefined && oid !== undefined) {
          if (!selected[fid]) selected[fid] = [];
          selected[fid].push(oid);
        }
      });

      // 2) پیش‌نمایش تصاویر از روی imagesCount و productId (طبق الگوی جدید)
      const count = Number((initialProduct as any).imagesCount ?? 0);
      const pid = Number(initialProduct.id);
      let remoteImages: { id: number; url: string; isDefault: boolean }[] = [];

      if (pid && count > 0) {
        remoteImages = Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          url: buildImageUrl(pid, i + 1),
          isDefault: false, // در ویرایش، پیش‌فرض باید از بین «جدیدها» انتخاب شود
        }));
      }

      return {
        modelName: initialProduct.modelName ?? "",
        description: initialProduct.description ?? "",
        tags: (initialProduct.tags ?? []) as ProductTag[],
        selectedOptions: selected,
        remoteImages,
        newImages: [],
        defaultImageIndex: -1, // پیش‌فرض را کاربر بین «جدیدها» انتخاب می‌کند
        __newFilter: undefined,
        __newOption: undefined,
      };
    }

    // حالت ایجاد
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

  // واکشی فیلترها در صورت نیاز
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

    // الزام: در ویرایش باید کل تصاویر جدید آپلود شوند
    if (mode === "edit" && formData.newImages.length === 0) {
      toast.error("در ویرایش، آپلود همهٔ تصاویر جدید الزامی است.");
      return;
    }

    // ایندکس پیش‌فرض داخل «جدیدها» (نه کل remote+new)
    const totalRemote = formData.remoteImages.length;
    let defaultNewImageIndex =
      formData.defaultImageIndex >= totalRemote
        ? formData.defaultImageIndex - totalRemote
        : 0;
    if (
      defaultNewImageIndex < 0 ||
      defaultNewImageIndex >= formData.newImages.length
    ) {
      defaultNewImageIndex = 0;
    }

    const fd = new FormData();

    const payload = {
      id: initialProduct?.id ?? 0,
      brandId,
      modelName: formData.modelName,
      description: formData.description,
      defaultImageIndex: defaultNewImageIndex, // سرور انتظار ایندکس داخل «جدیدها» را دارد
      filterOptionIds: optionIds,
      tags: formData.tags.map((t) => t.tag),
      // اگر لازم است می‌توانید imagesCount را هم ارسال کنید:
      // imagesCount: formData.newImages.length,
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

  // امضای سازگار با ImageUploader و فرم شما
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

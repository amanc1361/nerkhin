"use client";
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';

import { categoryMessages as messages } from '@/app/constants/categoryMessages';
import {  SuccessResponse } from '@/app/types/types';
import { brandApi, categoryApi } from '@/app/services/categoryApi';
import { NewBrandFormData } from '@/app/types/category/categoryManagement';
import { ApiError } from '@/app/services/apiService';

export type CatalogActionType = 'addCategory' | 'deleteCategory' | 'addBrand' | 'updateBrand' | 'deleteBrand';

// این هوک دیگر onSuccess را به عنوان آرگومان ورودی نمی‌گیرد
export const useCategoryActions = () => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // این تابع حالا یک boolean برمی‌گرداند که نشان‌دهنده موفقیت یا شکست عملیات است
  const performAction = useCallback(async (action: CatalogActionType, data: any): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      let successMessage = '';
      switch (action) {
        case 'addCategory':
          await api.post<SuccessResponse>(categoryApi.create(data as FormData));
          successMessage = messages.addSuccess.replace('{type}', 'دسته');
          break;
        case 'deleteCategory':
          await api.delete<SuccessResponse>(categoryApi.delete(data.id));
          successMessage = messages.deleteSuccess.replace('{type}', 'دسته');
          break;
        case 'addBrand':
          await api.post<SuccessResponse>(brandApi.create(data as NewBrandFormData));
          successMessage = messages.addSuccess.replace('{type}', 'برند');
          break;
        case 'updateBrand':
          await api.post<SuccessResponse>(brandApi.update(data));
          successMessage = messages.updateSuccess.replace('{type}', 'برند');
          break;
        case 'deleteBrand':
          await api.delete<SuccessResponse>(brandApi.delete(data.id));
          successMessage = messages.deleteSuccess.replace('{type}', 'برند');
          break;
      }
      toast.success(successMessage);
      return true; // در صورت موفقیت، true برگردان
    } catch (error) {
      const message = error instanceof ApiError ? error.message : messages.actionError;
      toast.error(message);
      return false; // در صورت شکست، false برگردان
    } finally {
      setIsSubmitting(false);
    }
  }, [api]);

  return { isSubmitting, performAction };
};
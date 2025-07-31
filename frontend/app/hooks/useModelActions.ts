// مسیر: hooks/useModelActions.ts
"use client";
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { modelApi } from '@/app/services/brandapi';
import { NewModelFormData, SuccessResponse } from '@/app/types/model/model';
import { ApiError } from '@/app/services/apiService';
import { modelPageMessages as messages } from '@/app/constants/modelmessage';


// این هوک یک تابع onSuccess دریافت می‌کند تا پس از عملیات موفق، آن را فراخوانی کند
export const useModelActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(async (action: 'add' | 'update' | 'delete', data: any) => {
    setIsSubmitting(true);
    try {
      let successMessage = '';
      if (action === 'add') {
        await api.post<SuccessResponse>(modelApi.create(data as NewModelFormData));
        successMessage = messages.addSuccess;
      } else if (action === 'update') {
        await api.post<SuccessResponse>(modelApi.update(data));
        successMessage = messages.updateSuccess;
      } else if (action === 'delete') {
        await api.delete<SuccessResponse>(modelApi.delete(data.id));
        successMessage = messages.deleteSuccess;
      }
      toast.success(successMessage);
      onSuccess(); // فراخوانی تابع برای رفرش کردن لیست
    } catch (error) {
      const message = error instanceof ApiError ? error.message : messages.actionError;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [api, onSuccess]);

  return { isSubmitting, performAction };
};
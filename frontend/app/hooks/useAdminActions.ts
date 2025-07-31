"use client";
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { adminApi} from '@/app/services/adminApi';
import { adminManagementMessages as messages } from '@/app/constants/adminManagementMessages';
import { SuccessResponse } from '@/app/types/types';
import { AdminAccess, NewAdminFormData } from '@/app/types/admin/adminManagement';
import { ApiError } from '@/app/services/apiService';


type ActionType = 'add' | 'delete' | 'updateAccess';

export const useAdminActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(async (action: ActionType, data: any) => {
    setIsSubmitting(true);
    try {
      let successMessage = '';
      if (action === 'add') {
        await api.post<SuccessResponse>(adminApi.create(data as NewAdminFormData));
        successMessage = messages.adminAddedSuccess;
      } else if (action === 'delete') {
        await api.post<SuccessResponse>(adminApi.delete(data.id));
        successMessage = messages.adminDeletedSuccess;
      } else if (action === 'updateAccess') {
        await api.post<SuccessResponse>(adminApi.updateAccess(data.id, data.accessData as AdminAccess));
        successMessage = messages.accessUpdatedSuccess;
      }
      toast.success(successMessage);
      onSuccess();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : messages.genericError;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [api, onSuccess]);

  return { isSubmitting, performAction };
};
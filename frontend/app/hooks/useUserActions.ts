"use client";
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';

import { userManagementMessages as messages } from '@/app/constants/userManagementMessages';
import {  SuccessResponse, NewUserFormData, User } from '@/app/types/types';
import { userApi } from '@/app/services/userApi';
import { ApiError } from '@/app/services/apiService';

type ActionType = 'approve' | 'reject' | 'add';

export const useUserActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(async (action: ActionType, data: User | NewUserFormData) => {
    setIsSubmitting(true);
    try {
      let successMessage = '';
      if (action === 'approve') {
        await api.post<SuccessResponse>(userApi.changeState({ userId: (data as User).id, targetState: 5 }));
        successMessage = messages.userApprovedSuccess;
      } else if (action === 'reject') {
        await api.post<SuccessResponse>(userApi.changeState({ userId: (data as User).id, targetState: 2 }));
        successMessage = messages.userRejectedSuccess;
      } else if (action === 'add') {
        await api.post<SuccessResponse>(userApi.create(data as NewUserFormData));
        successMessage = messages.userAddedSuccess;
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
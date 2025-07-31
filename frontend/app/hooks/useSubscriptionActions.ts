"use client";
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { subscriptionApi } from '@/app/services/subscriptionApi';
import { subscriptionMessages as messages } from '@/app/constants/subscriptionMessages';
import {  SuccessResponse, NewSubscriptionFormData, UpdateSubscriptionFormData, Subscription } from '@/app/types/subscription/subscriptionManagement';
import { ApiError } from '@/app/services/apiService';

type ActionType = 'add' | 'update' | 'delete';

export const useSubscriptionActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(async (action: ActionType, data: any) => {
    setIsSubmitting(true);
    try {
      let successMessage = '';
      if (action === 'add') {
        await api.post<SuccessResponse>(subscriptionApi.create(data as NewSubscriptionFormData));
        successMessage = messages.addSuccess;
      } else if (action === 'update') {
        await api.put<SuccessResponse>(subscriptionApi.update(data as UpdateSubscriptionFormData));
        successMessage = messages.updateSuccess;
      } else if (action === 'delete') {
        await api.post<SuccessResponse>(subscriptionApi.delete([data.id]));
        successMessage = messages.deleteSuccess;
      }
      toast.success(successMessage);
      onSuccess();
    } catch (error) {
      const defaultMessage = action === 'add' ? messages.addError : (action === 'update' ? messages.updateError : messages.deleteError);
      const message = error instanceof ApiError ? error.message : defaultMessage;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [api, onSuccess]);

  return { isSubmitting, performAction };
};
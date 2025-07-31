"use client";
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { reportApi } from '@/app/services/reportApi';
import { reportMessages as messages } from '@/app/constants/reportMessages';
import {  Report } from '@/app/types/report/reportManagement';
import { SuccessResponse } from '@/app/types/types';
import { ApiError } from '@/app/services/apiService';

type ActionType = 'markAsChecked';

export const useReportActions = (onSuccess: () => void) => {
  const { api } = useAuthenticatedApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performAction = useCallback(async (action: ActionType, report: Report) => {
    setIsSubmitting(true);
    try {
      if (action === 'markAsChecked') {
        await api.post<SuccessResponse>(reportApi.changeState({ reportId: report.id, targetState: 2 }));
        toast.success(messages.stateChangeSuccess);
      }
      onSuccess();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : messages.stateChangeError;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [api, onSuccess]);

  return { isSubmitting, performAction };
};
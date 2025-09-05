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

/* ✅ فقط افزوده‌ها برای ایجاد گزارش */
export type CreateReportPayload = {
  targetUserId: number;
  title: string;
  description: string;
};
type CreateReportResponse = { id: number };

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

  /* ✅ متد جدید: ایجاد گزارش — بدون تغییر در performAction */
  const createReport = useCallback(async (payload: CreateReportPayload) => {
    setIsSubmitting(true);
    try {
      // ولیدیشن سبک (پیام‌ها از دیکشنری)
      if (!payload?.targetUserId || !payload?.title?.trim() || !payload?.description?.trim()) {
        toast.warn(messages.createValidation ?? "");
        return null;
      }

      // 🔧 حلِ تفاوتِ خروجی reportApi.create():
      // اگر string بود، همان را استفاده می‌کنیم؛ اگر آبجکت بود، .url را برمی‌داریم.
      const ep = reportApi.create() as any;
      const url: string = typeof ep === 'string' ? ep : ep?.url;

      // طبق امضای useAuthenticatedApi: props object با url و body
      const res = await api.post<CreateReportResponse>({
        url,
        body: payload,
      });

      const newId = (res as any)?.id ?? null;
      toast.success(messages.createSuccess);
      onSuccess();
      return newId;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : messages.createError;
      toast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [api, onSuccess]);

  // ✅ چیزی حذف نشده؛ فقط متد جدید به خروجی اضافه شده
  return { isSubmitting, performAction, createReport };
};

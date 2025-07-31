// فایل: hooks/useItemDelete.ts
"use client";

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { ApiError } from '@/app/services/apiService';
import { MutateRequestProps } from '@/app/services/apiService';

interface UseItemDeleteProps<T> {
  deleteApiCall: (ids: Array<string | number>) => Omit<MutateRequestProps, 'token'>;
  onSuccess: () => void; // Callback برای اجرا پس از حذف موفقیت‌آمیز
  successMessage: string;
  errorMessage: string;
}

export const useItemDelete = <T,>({ deleteApiCall, onSuccess, successMessage, errorMessage }: UseItemDeleteProps<T>) => {
  const { api, isAuthenticated } = useAuthenticatedApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = useCallback(async (ids: Array<string | number>) => {
    if (!isAuthenticated) return;
    setIsDeleting(true);
    try {
      await api.post<T>(deleteApiCall(ids));
      toast.success(successMessage);
      setShowDeleteModal(false);
      onSuccess();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : errorMessage;
      toast.error(message);
    
    } finally {
      setIsDeleting(false);
    }
  }, [api, isAuthenticated, deleteApiCall, onSuccess, successMessage, errorMessage]);

  return {
    isDeleting,
    showDeleteModal,
    openDeleteModal: () => setShowDeleteModal(true),
    closeDeleteModal: () => setShowDeleteModal(false),
    confirmDelete: handleDelete,
  };
};
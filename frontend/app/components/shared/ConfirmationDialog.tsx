// components/shared/ConfirmationDialog.tsx
"use client";
import React from 'react';
import LoadingSpinner from '@/app/components/Loading/Loading';

interface ConfirmationDialogProps {
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ message, onConfirm, onCancel, isConfirming, confirmText = "تایید", cancelText = "انصراف" }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-gray-700 dark:text-gray-300">{message}</div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} disabled={isConfirming} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
          {cancelText}
        </button>
        <button onClick={onConfirm} disabled={isConfirming} className="flex min-w-[100px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-70">
          {isConfirming ? <LoadingSpinner  /> : confirmText}
        </button>
      </div>
    </div>
  );
};
export default ConfirmationDialog;
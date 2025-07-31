// فایل: components/panel/categories/AddNewBrandForm.tsx
"use client";
import React, { useState } from 'react';
import LoadingSpinner from '@/app/components/Loading/Loading';
import { categoryMessages as messages } from '@/app/constants/categoryMessages';

interface BrandFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialTitle?: string;
}

export const AddNewBrandForm: React.FC<BrandFormProps> = ({ onSubmit, onCancel, isSubmitting, initialTitle = '' }) => {
  const [title, setTitle] = useState(initialTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) onSubmit(title);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="brandTitle" className="block text-sm font-medium mb-1">{messages.brandTitleLabel}</label>
        <input id="brandTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-lg border p-2" />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
          {messages.cancel}
        </button>
        <button type="submit" disabled={isSubmitting || !title} className="flex min-w-[100px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm text-white disabled:opacity-70">
          {isSubmitting ? <LoadingSpinner size="small" mode="inline" /> : messages.save}
        </button>
      </div>
    </form>
  );
};
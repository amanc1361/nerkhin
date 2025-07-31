"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import type { Category } from '@/app/types/types'; // مسیر صحیح به تایپ‌های شما
import { categoryMessages as messages } from '@/app/constants/categoryMessages'; // مسیر صحیح به پیام‌ها
import { useCategoryActions } from '@/app/hooks/useCategoryActions';

import ReusableModal from '@/app/components/shared/generalModal';

import { CategoryItem } from './CategoryItem';
import EmptyState from '@/app/components/empty-state/empty-state';
import { AddNewCategoryForm } from './AddNewCategoryForm';

interface CategoryManagementClientProps {
  initialCategories: Category[];
}

export const CategoryManagementClient: React.FC<CategoryManagementClientProps> = ({ initialCategories }) => {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  // --- شروع بخش اصلاح شده ---

  // 1. هوک useCategoryActions حالا بدون آرگومان فراخوانی می‌شود
  const { isSubmitting, performAction } = useCategoryActions();

  // 2. این تابع حالا async است و منتظر نتیجه performAction می‌ماند
  const handleAddTopLevelCategory = async (formData: FormData) => {
    const success = await performAction('addCategory', formData);
    
    // 3. اگر عملیات موفق بود، مودال را ببند و داده‌ها را رفرش کن
    if (success) {
      setShowAddModal(false);
      router.refresh();
    }
  };
  // --- پایان بخش اصلاح شده ---

  return (
    <div className="flex h-full flex-col VazirFont">
      <header className="flex w-full flex-shrink-0 items-center justify-between border-b p-4 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{messages.pageTitle}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <PlusCircle size={18} />
          {messages.addMainCategory}
        </button>
      </header>

      <div className="flex-grow overflow-y-auto">
        {initialCategories.length > 0 ? (
          initialCategories.map(category => (
          <CategoryItem 
              key={category.id} 
              category={category} 
              level={0} 
              onActionSuccess={() => router.refresh()} 
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={messages.noItems} />
          </div>
        )}
      </div>

      <ReusableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={messages.addCategoryModalTitle}
      >
        <AddNewCategoryForm
          onSubmit={handleAddTopLevelCategory}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
        />
      </ReusableModal>
    </div>
  );
};
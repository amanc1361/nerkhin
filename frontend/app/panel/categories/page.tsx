// فایل: app/panel/categories/page.tsx
import React, { Suspense } from 'react';
import { getAllCategories } from 'lib/server/server-api';
import { CategoryManagementClient } from '@/app/components/panel/categories/CategoryManagementClient';
import LoadingSpinner from '@/app/components/Loading/Loading';

async function CategoriesData() {
  const initialCategories = await getAllCategories();
  return <CategoryManagementClient initialCategories={initialCategories} />;
}

export default function CategoriesPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner mode="overlay" />}>
        <CategoriesData />
      </Suspense>
    </div>
  );
}
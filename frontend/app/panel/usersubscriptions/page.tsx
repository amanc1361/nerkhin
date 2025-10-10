import React, { Suspense } from 'react';
import { getAdminUsersList } from '@/lib/server/server-api';

import LoadingSpinner from '@/app/components/Loading/Loading';
import { AdminUserFilters } from '@/app/types/admin/adminManagement';
import { UsersListClient } from '@/app/components/panel/users/UserListClient';




// تعریف تایپ‌ها دقیقاً مانند نمونه شما
type Params = {}; // این صفحه پارامتر داینامیک ندارد
type SearchParams = { [key: string]: string | string[] | undefined };

interface AdminUsersDataViewProps {
  filters: AdminUserFilters;
}

// کامپوننت داخلی برای دریافت دیتا، مطابق با الگوی شما
async function AdminUsersDataView({ filters }: AdminUsersDataViewProps) {
  const users = await getAdminUsersList(filters);
  return <UsersListClient users={users} />;
}

// کامپوننت اصلی صفحه، با دریافت پراپ‌ها به صورت Promise
export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  // ۱. پراپ‌ها را await می‌کنیم تا مقادیر واقعی آنها را بگیریم
  await params; // گرچه استفاده نمی‌شود، برای حفظ الگو await می‌شود
  const sp = await searchParams;

  // ۲. فیلترها را از روی searchParams استخراج می‌کنیم
  const filters: AdminUserFilters = {
    is_wholesaler: sp.is_wholesaler === 'true' ? true : (sp.is_wholesaler === 'false' ? false : undefined),
    has_subscription: sp.has_subscription === 'true' ? true : (sp.has_subscription === 'false' ? false : undefined),
  };

  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner />}>
        {/* ۳. کامپوننت دیتا را با فیلترهای استخراج شده رندر می‌کنیم */}
        <AdminUsersDataView filters={filters} />
      </Suspense>
    </div>
  );
}
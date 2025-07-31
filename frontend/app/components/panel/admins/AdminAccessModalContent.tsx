// فایل: components/panel/admins/AdminAccessModalContent.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Admin, AdminAccess } from '@/app/types/admin/adminManagement';
import { useAuthenticatedApi } from '@/app/hooks/useAuthenticatedApi';
import { adminApi } from '@/app/services/adminApi';
import { adminManagementMessages as messages } from '@/app/constants/adminManagementMessages';
import LoadingSpinner from '@/app/components/Loading/Loading';
import ToggleSwitch from '@/app/components/shared/ToggleSwitch'; // ایمپورت ToggleSwitch

interface AdminAccessModalContentProps {
  admin: Admin;
  onSave: (accessData: AdminAccess) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const AdminAccessModalContent: React.FC<AdminAccessModalContentProps> = ({ admin, onSave, onCancel, isSaving }) => {
  const { api } = useAuthenticatedApi();
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // دریافت اطلاعات اولیه دسترسی‌ها از سرور
  useEffect(() => {
    const fetchAccess = async () => {
      if (!api) return;
      setIsLoading(true);
      try {
        const data = await api.get<AdminAccess>(adminApi.getAccess(admin.id));
        setAccess(data);
      } catch (error) {
        toast.error(messages.fetchAccessError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccess();
  }, [api, admin.id]);

  // این تابع مسئول اصلی آپدیت کردن state و در نتیجه "سوییچ کردن" است
  const handleToggle = (key: keyof AdminAccess) => {
    setAccess(prev => {
      if (!prev) return null; // اگر state هنوز لود نشده، کاری نکن
      return { ...prev, [key]: !prev[key] }; // وضعیت پراپرتی مورد نظر را برعکس کن
    });
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner mode="inline" size="medium" /></div>;
  }
  if (!access) {
    return <div className="p-4 text-center text-red-500">{messages.fetchAccessError}</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {/* هر ToggleSwitch حالا وضعیت checked را از state می‌گیرد و تابع handleToggle را فراخوانی می‌کند */}
      <ToggleSwitch id="saveProduct" label="افزودن و ویرایش محصول" checked={access.saveProduct} onChange={() => handleToggle('saveProduct')} disabled={isSaving} />
      <hr className="dark:border-gray-700 my-1"/>
      <ToggleSwitch id="changeUserState" label="تایید / رد کاربر جدید" checked={access.changeUserState} onChange={() => handleToggle('changeUserState')} disabled={isSaving} />
      <hr className="dark:border-gray-700 my-1"/>
      <ToggleSwitch id="changeShopState" label="فعال / غیر فعال سازی کاربر یا فروشگاه" checked={access.changeShopState} onChange={() => handleToggle('changeShopState')} disabled={isSaving} />
      <hr className="dark:border-gray-700 my-1"/>
      <ToggleSwitch id="changeAccountState" label="تغییر وضعیت حساب" checked={access.changeAccountState} onChange={() => handleToggle('changeAccountState')} disabled={isSaving} />

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} disabled={isSaving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
          {messages.cancel}
        </button>
        <button onClick={() => onSave(access)} disabled={isSaving} className="flex min-w-[120px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70">
          {isSaving ? <LoadingSpinner size="small" mode="inline" /> : messages.saveChanges}
        </button>
      </div>
    </div>
  );
};

export default AdminAccessModalContent;
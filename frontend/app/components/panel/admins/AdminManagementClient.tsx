// فایل: components/panel/admins/AdminManagementClient.tsx (نسخه اصلاح شده)
"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import type { Admin, NewAdminFormData, AdminAccess } from '@/app/types/admin/adminManagement';
import { adminManagementMessages as messages } from '@/app/constants/adminManagementMessages';
import { useAdminActions } from '@/app/hooks/useAdminActions';

import AdminItem from './AdminItem';
import { UserFilters } from '@/app/components/panel/users/UserFilters'; // استفاده مجدد
import Pagination from '@/app/components/shared/Pagination';
import EmptyState from '@/app/components/empty-state/empty-state';
import ReusableModal from '@/app/components/shared/generalModal';
import ConfirmationDialog from '@/app/components/shared/ConfirmationDialog';

import { AdminAccessModalContent } from './AdminAccessModalContent';
import { City } from '@/app/types/types';
import AddNewAdminForm from './AddnewAdminForm';

// اینترفیس پراپ‌ها اصلاح شد
interface AdminManagementClientProps {
  initialData: {
    users: Admin[]; // <--- تغییر از admins به users
    totalCount: number;
    page: number;
  };
  allCities: City[];
  itemsPerPage: number;
}

export const AdminManagementClient: React.FC<AdminManagementClientProps> = ({ initialData, allCities, itemsPerPage }) => {
  const router = useRouter();
  const [modalState, setModalState] = useState<{ type: 'add' | 'delete' | 'editAccess' | null; admin?: Admin }>({ type: null });
  const [newAdminFormData, setNewAdminFormData] = useState<NewAdminFormData>({ fullName: "", phone: "", cityId: null });

  const { isSubmitting, performAction } = useAdminActions(() => {
    setModalState({ type: null });
    setNewAdminFormData({ fullName: "", phone: "", cityId: null });
    router.refresh();
  });
  
  const totalPages = Math.ceil(initialData.totalCount / itemsPerPage);

  const openModal = (type: 'add' | 'delete' | 'editAccess', admin?: Admin) => {
    setModalState({ type, admin });
  };
  
  const handleConfirmDelete = () => {
    if (modalState.admin && modalState.type === 'delete') {
      performAction('delete', modalState.admin);
    }
  };

  const handleAddAdminSubmit = () => {
    performAction('add', newAdminFormData);
  };

  const handleSaveAccess = (accessData: AdminAccess) => {
    if(modalState.admin) {
      performAction('updateAccess', { id: modalState.admin.id, accessData });
    }
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdminFormData(prev => ({
      ...prev,
      [name]: name === 'cityId' ? (value === "" || value === "-1" ? null : +value) : value,
    }));
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex w-full items-center justify-between border-b p-4 dark:border-gray-700">
        <h1 className="text-xl font-semibold dark:text-white">{messages.pageTitle}</h1>
        <button onClick={() => openModal('add')} className="flex items-center gap-2 rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          <PlusCircle size={18} />
          {messages.addNewAdmin}
        </button>
      </header>
      
      <UserFilters cities={allCities} />
      
      <div className="flex-grow overflow-y-auto">
        {/* --- شروع بخش اصلاح شده --- */}
        {initialData.users.length > 0 ? (
          initialData.users.map(admin => ( // <--- تغییر از initialData.admins به initialData.users
            <AdminItem key={admin.id} admin={admin} onDelete={(a) => openModal('delete', a)} onEditAccess={(a) => openModal('editAccess', a)} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={messages.noAdminsFound} />
          </div>
        )}
        {/* --- پایان بخش اصلاح شده --- */}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      {/* مودال افزودن ادمین جدید */}
      <ReusableModal isOpen={modalState.type === 'add'} onClose={() => setModalState({ type: null })} title={messages.addModalTitle}>
        <AddNewAdminForm
          formData={newAdminFormData}
          onFormChange={handleFormInputChange}
          onSubmit={handleAddAdminSubmit}
          onCancel={() => setModalState({ type: null })}
          isSubmitting={isSubmitting}
          cities={allCities}
        />
      </ReusableModal>

      {/* مودال حذف ادمین */}
      <ReusableModal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null })} title={messages.deleteModalTitle}>
        {modalState.admin && (
          <ConfirmationDialog
            message={messages.confirmDeleteMessage.replace('{adminName}', modalState.admin.fullName || '')}
            onConfirm={handleConfirmDelete} onCancel={() => setModalState({ type: null })} isConfirming={isSubmitting}
            confirmText={messages.deleteAdmin}
          />
        )}
      </ReusableModal>
      
      {/* مودال ویرایش دسترسی‌ها */}
      <ReusableModal isOpen={modalState.type === 'editAccess'} onClose={() => setModalState({ type: null })} title={messages.accessModalTitle}>
        {modalState.admin && (
          <AdminAccessModalContent
            admin={modalState.admin} onSave={handleSaveAccess} onCancel={() => setModalState({ type: null })} isSaving={isSubmitting}
          />
        )}
      </ReusableModal>
    </div>
  );
};
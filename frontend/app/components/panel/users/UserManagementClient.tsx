"use client";

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// تایپ‌ها و ثابت‌ها
import { User, City, NewUserFormData } from '@/app/types/types';
import { userManagementMessages as messages } from '@/app/constants/userManagementMessages';

// هوک سفارشی برای عملیات
import { useUserActions } from '@/app/hooks/useUserActions';

// کامپوننت‌های UI
import { UserTabs } from './UserTabs';
import { UserFilters } from './UserFilters';
import UserItem from './UserItem';
import Pagination from '@/app/components/shared/Pagination';
import EmptyState from '@/app/components/empty-state/empty-state';
import ReusableModal from '@/app/components/shared/generalModal';
import ConfirmationDialog from '@/app/components/shared/ConfirmationDialog';
import AddNewUserForm from './AddNewUserForm';

interface UserManagementClientProps {
  initialData: { 
    users: User[]; 
    totalCount: number; 
    page: number; // صفحه فعلی از سرور
  };
  allCities: City[];
  itemsPerPage: number;
  userType: string;
}

export const UserManagementClient: React.FC<UserManagementClientProps> = ({
  initialData,
  allCities,
  itemsPerPage,
  userType,
}) => {
  const router = useRouter();
  const [modalState, setModalState] = useState<{ type: 'approve' | 'reject' | 'add' | null; user?: User }>({ type: null });
  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    fullName: "",
    phone: "",
    role: userType === 'wholesalers' ? 3 : (userType === 'retailers' ? 4 : null), // نقش پیش‌فرض بر اساس تب
    cityId: null,
  });

  const { isSubmitting, performAction } = useUserActions(() => {
    setModalState({ type: null }); // بستن مودال پس از موفقیت
    router.refresh(); // بارگذاری مجدد داده‌ها از سرور (روش مدرن در Next.js)
  });
  
  const totalPages = Math.ceil(initialData.totalCount / itemsPerPage);

  const openConfirmationModal = (user: User, actionType: 'approve' | 'reject') => {
    setModalState({ type: actionType, user: user });
  };
  
  const handleConfirmAction = () => {
    if (modalState.user && (modalState.type === 'approve' || modalState.type === 'reject')) {
      performAction(modalState.type, modalState.user);
    }
  };

  const handleAddUserSubmit = () => {
    performAction('add', newUserFormData);
  };
  
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = name === 'role' || name === 'cityId';
    setNewUserFormData(prev => ({
      ...prev,
      [name]: isNumericField ? (value === "" || value === "-1" ? null : +value) : value,
    }));
  };

  return (
    <div className="flex h-full flex-col">
      <UserTabs 
       
        onAddUser={() => setModalState({ type: 'add' })} 
      />
      
      <UserFilters cities={allCities} />
      
      <div className="flex-grow overflow-y-auto border-t dark:border-gray-700">
        {initialData.users.length > 0 ? (
          initialData.users.map(user => (
            <UserItem 
              key={user.id} 
              user={user} 
              onApprove={(u) => openConfirmationModal(u, 'approve')} 
              onReject={(u) => openConfirmationModal(u, 'reject')} 
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={messages.noUsersFound} />
          </div>
        )}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      {/* مودال افزودن کاربر جدید */}
      <ReusableModal
        isOpen={modalState.type === 'add'}
        onClose={() => setModalState({ type: null })}
        title={messages.addUserModalTitle}
      >
        <AddNewUserForm
          formData={newUserFormData}
          onFormChange={handleFormInputChange}
          onSubmit={handleAddUserSubmit}
          onCancel={() => setModalState({ type: null })}
          isSubmitting={isSubmitting}
          cities={allCities}
        />
      </ReusableModal>

      {/* مودال تایید برای عملیات تایید/رد */}
      <ReusableModal
        isOpen={modalState.type === 'approve' || modalState.type === 'reject'}
        onClose={() => setModalState({ type: null })}
        title={modalState.type === 'approve' ? messages.approveUserModalTitle : messages.rejectUserModalTitle}
      >
        {modalState.user && (
          <ConfirmationDialog
            message={
              modalState.type === 'approve'
                ? messages.approveUserConfirm.replace('{userName}', modalState.user.fullName || '')
                : messages.rejectUserConfirm.replace('{userName}', modalState.user.fullName || '')
            }
            onConfirm={handleConfirmAction}
            onCancel={() => setModalState({ type: null })}
            isConfirming={isSubmitting}
            confirmText={messages.confirm}
          />
        )}
      </ReusableModal>
    </div>
  );
};
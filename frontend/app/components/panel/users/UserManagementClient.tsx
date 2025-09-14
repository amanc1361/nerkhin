"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Types and Constants
import { User, City, NewUserFormData } from "@/app/types/types";
import { userManagementMessages as messages } from "@/app/constants/userManagementMessages";
import { userApi } from "@/app/services/userApi";

// Hooks
import { useUserActions } from "@/app/hooks/useUserActions";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";

// UI Components
import { UserTabs } from "./UserTabs";
import { UserFilters } from "./UserFilters";
import UserItem from "./UserItem";
import Pagination from "@/app/components/shared/Pagination";
import EmptyState from "@/app/components/empty-state/empty-state";
import ReusableModal from "@/app/components/shared/generalModal";
import ConfirmationDialog from "@/app/components/shared/ConfirmationDialog";
import AddNewUserForm from "./AddNewUserForm";
import LoadingSpinner from "../../Loading/Loading";

// Icons
import { Trash2, MonitorSmartphone, Calendar, Globe, Fingerprint, Copy, Check, Settings } from "lucide-react";

// Interfaces
interface ActiveDevice {
  id: number;
  userId: number;
  deviceId: string;
  userAgent: string;
  ipAddress: string; // <-- اطمینان از وجود این فیلد
  lastLoginAt: string;
}

type ModalType = "approve" | "reject" | "add" | "delete" | "toggleActive" | "editLimit" | "updateAllLimits" | "manageDevices" | "deleteDevice";

interface UserManagementClientProps {
  initialData: {
    users: User[];
    totalCount: number;
    page: number;
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
  const { api } = useAuthenticatedApi();

  // State Management
  const [modalState, setModalState] = useState<{ type: ModalType | null; user?: User }>({ type: null });
  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    fullName: "", phone: "", role: userType === "wholesalers" ? 3 : userType === "retailers" ? 4 : (null as any), cityId: null,
  });
  const [newDeviceLimit, setNewDeviceLimit] = useState(2);
  const [isUpdateAllModalOpen, setUpdateAllModalOpen] = useState(false);
  const [globalLimit, setGlobalLimit] = useState(2);


  const { isSubmitting, performAction } = useUserActions(() => {
    // بستن مودال‌ها پس از موفقیت و رفرش داده‌ها
    setModalState({ type: null });
    setUpdateAllModalOpen(false);
    // برای مودال دستگاه‌ها، فقط لیست را رفرش می‌کنیم نه کل صفحه
    if (modalState.type !== 'deleteDevice') {
        router.refresh();
    }
  });

  useEffect(() => {
    if (modalState.type === 'editLimit' && modalState.user) {
        setNewDeviceLimit(modalState.user.deviceLimit ?? 2);
    }
  }, [modalState]);

  const totalPages = Math.ceil(initialData.totalCount / itemsPerPage);

  const t = {
    confirm: messages.confirm ?? "تأیید",
    cancel: messages.cancel ?? "انصراف",
    notUserFound: messages.notUserFound ?? "کاربری با این مشخصات یافت نشد.",
    editDeviceLimitTitle: "ویرایش محدودیت دستگاه",
    addUserModalTitle: messages.addUserModalTitle ?? "افزودن کاربر جدید",
    approveUserModalTitle: messages.approveUserModalTitle ?? "تأیید کاربر",
    rejectUserModalTitle: messages.rejectUserModalTitle ?? "رد کاربر",
    deleteUserModalTitle: messages.deleteUserModalTitle ?? "حذف کاربر",
    toggleActiveUserModalTitle: messages.toggleActiveUserModalTitle ?? "تغییر وضعیت کاربر",
  };

  // --- Event Handlers ---
  const openModal = (type: ModalType, user?: User) => {
    setModalState({ type, user });
  };
  
  const handleConfirmAction = () => {
    const { type, user } = modalState;
    if (!type) return;

    if (type === "approve" || type === "reject") {
        if(user) performAction(type, user);
    } else if (type === "delete") {
        if(user) performAction("delete", { userId: user.id });
    } else if (type === "toggleActive") {
        if(user) {
            const nextActive = !(user as any).isActive;
            performAction("toggleActive", { userId: user.id, nextActive });
        }
    } else if (type === "editLimit") {
        if(user) performAction("updateLimit", { userId: user.id, limit: newDeviceLimit });
    }
  };
  
  const handleAddUserSubmit = () => {
    performAction("add", newUserFormData);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = name === "role" || name === "cityId";
    setNewUserFormData((prev) => ({
      ...prev,
      [name]: isNumericField ? (value === "" || value === "-1" ? null : +value) : value,
    }));
  };
  
  const handleManageDevices = async (user: User) => {
    openModal('manageDevices', user);
    setIsLoadingDevices(true);
    setActiveDevices([]);
    try {
        const devices = await api.get<ActiveDevice[]>(userApi.listUserDevices(user.id));
        setActiveDevices(devices);
    } catch (error) {
        toast.error("خطا در دریافت لیست دستگاه‌ها");
    } finally {
        setIsLoadingDevices(false);
    }
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (modalState.user) {
        performAction('deleteDevice', { userId: modalState.user.id, deviceId });
        setActiveDevices(prev => prev.filter(d => d.deviceId !== deviceId));
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
        <UserFilters cities={allCities} />
        <div className="flex items-center gap-2">
            <button
              onClick={() => setUpdateAllModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-gray-100 p-2 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="تنظیم محدودیت برای همه"
            >
              <Settings size={16} />
              <span>تنظیم کلی</span>
            </button>
            <UserTabs onAddUser={() => openModal("add")} />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {initialData.users.length > 0 ? (
          initialData.users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onApprove={(u) => openModal("approve", u)}
              onReject={(u) => openModal("reject", u)}
              onDelete={(u) => openModal("delete", u)}
              onToggleActive={(u) => openModal("toggleActive", u)}
              onEditLimit={(u) => openModal("editLimit", u)}
              onManageDevices={handleManageDevices}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={t.notUserFound} />
          </div>
        )}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      {/* --- Modals --- */}
      <ReusableModal isOpen={modalState.type === "add"} onClose={() => setModalState({ type: null })} title={t.addUserModalTitle}>
        <AddNewUserForm formData={newUserFormData} onFormChange={handleFormInputChange} onSubmit={handleAddUserSubmit} onCancel={() => setModalState({ type: null })} isSubmitting={isSubmitting} cities={allCities} />
      </ReusableModal>

      <ReusableModal isOpen={["approve", "reject", "delete", "toggleActive"].includes(modalState.type ?? "")} onClose={() => setModalState({ type: null })} title={t.approveUserModalTitle}>
        <ConfirmationDialog message="آیا از انجام این عملیات مطمئن هستید؟" onConfirm={handleConfirmAction} onCancel={() => setModalState({ type: null })} isConfirming={isSubmitting} confirmText={t.confirm}/>
      </ReusableModal>

      <ReusableModal isOpen={modalState.type === "editLimit"} onClose={() => setModalState({ type: null })} title={t.editDeviceLimitTitle}>
        <div className="flex flex-col gap-4 p-4">
            <p>محدودیت تعداد دستگاه برای کاربر <span className="font-bold">{modalState.user?.fullName}</span></p>
            <input type="number" value={newDeviceLimit} onChange={(e) => setNewDeviceLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full rounded-lg border border-gray-300 p-2 text-center text-lg dark:border-gray-600 dark:bg-gray-700" min="1" />
            <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setModalState({ type: null })} className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-600">{t.cancel}</button>
                <button onClick={handleConfirmAction} disabled={isSubmitting} className="rounded-lg bg-blue-dark px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? 'در حال ذخیره...' : t.confirm}</button>
            </div>
        </div>
      </ReusableModal>
      
      <ReusableModal isOpen={isUpdateAllModalOpen} onClose={() => setUpdateAllModalOpen(false)} title="تنظیم محدودیت دستگاه برای همه کاربران">
          <div className="flex flex-col gap-4 p-4">
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"><p>توجه: این تغییر بر روی همه کاربران (به جز ادمین‌ها) اعمال خواهد شد.</p></div>
              <label htmlFor="globalLimitInput">محدودیت تعداد دستگاه</label>
              <input id="globalLimitInput" type="number" value={globalLimit} onChange={(e) => setGlobalLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full rounded-lg border border-gray-300 p-2 text-center text-lg dark:border-gray-600 dark:bg-gray-700" min="1" />
              <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setUpdateAllModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-600">{t.cancel}</button>
                  <button onClick={() => performAction('updateAllLimits', { limit: globalLimit })} disabled={isSubmitting} className="rounded-lg bg-blue-dark px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? 'در حال ذخیره...' : 'اعمال تغییرات'}</button>
              </div>
          </div>
      </ReusableModal>

      {/* === ENHANCED DEVICE MANAGEMENT MODAL === */}
      <ReusableModal 
    isOpen={isUpdateAllModalOpen} 
    onClose={() => setUpdateAllModalOpen(false)} 
    title="تنظیم محدودیت دستگاه برای همه کاربران"
>
    <div className="flex flex-col gap-4 p-4">
        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <p>توجه: این تغییر بر روی همه کاربران (به جز ادمین‌ها) اعمال خواهد شد.</p>
        </div>
        <label htmlFor="globalLimitInput">محدودیت تعداد دستگاه</label>
        <input 
            id="globalLimitInput" 
            type="number" 
            value={globalLimit} 
            onChange={(e) => setGlobalLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} 
            className="w-full rounded-lg border border-gray-300 p-2 text-center text-lg dark:border-gray-600 dark:bg-gray-700" 
            min="1" 
        />
        <div className="mt-4 flex justify-end gap-3">
            <button 
                onClick={() => setUpdateAllModalOpen(false)} 
                className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-600"
            >
                {t.cancel}
            </button>
            <button 
                // --- THIS LINE IS THE FIX ---
                onClick={() => performAction('updateAllLimits', { limit: globalLimit })} 
                disabled={isSubmitting} 
                className="rounded-lg bg-blue-dark px-4 py-2 text-white disabled:opacity-50"
            >
                {isSubmitting ? 'در حال ذخیره...' : 'اعمال تغییرات'}
            </button>
        </div>
    </div>
</ReusableModal>
    </div>
  );
};
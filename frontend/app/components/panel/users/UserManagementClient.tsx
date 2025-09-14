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

// UI Components from your project
import { UserTabs } from "./UserTabs";
import { UserFilters } from "./UserFilters";
import UserItem from "./UserItem";
import Pagination from "@/app/components/shared/Pagination";
import EmptyState from "@/app/components/empty-state/empty-state";
import ReusableModal from "@/app/components/shared/generalModal";
import ConfirmationDialog from "@/app/components/shared/ConfirmationDialog";
import AddNewUserForm from "./AddNewUserForm";
import LoadingSpinner from "../../Loading/Loading";

// Icons from your project
import { Trash2, Settings, ShieldAlert, MonitorSmartphone } from "lucide-react";

// Interfaces
interface ActiveDevice {
  id: number;
  userId: number;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  lastLoginAt: string;
}

type ModalType = "approve" | "reject" | "add" | "delete" | "toggleActive" | "editLimit" | "manageDevices" | "deleteAllDevicesConfirm";

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

  // States
  const [modalState, setModalState] = useState<{ type: ModalType | null; user?: User }>({ type: null });
  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    fullName: "", phone: "", role: userType === "wholesalers" ? 3 : userType === "retailers" ? 4 : (null as any), cityId: null,
  });
  
  // ADDED: States for new features
  const [newDeviceLimit, setNewDeviceLimit] = useState(2);
  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isUpdateAllModalOpen, setUpdateAllModalOpen] = useState(false);
  const [globalLimit, setGlobalLimit] = useState(2);

  const { isSubmitting, performAction } = useUserActions(() => {
    setModalState({ type: null });
    setUpdateAllModalOpen(false);
    if (modalState.type === 'deleteAllDevicesConfirm' && modalState.user) {
        handleManageDevices(modalState.user);
    } else if (modalState.type !== 'deleteAllDevicesConfirm') {
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
    if (!type || !user) return;

    if (type === "approve" || type === "reject") {
        performAction(type, user);
    } else if (type === "delete") {
        performAction("delete", { userId: user.id });
    } else if (type === "toggleActive") {
        const nextActive = !(user as any).isActive;
        performAction("toggleActive", { userId: user.id, nextActive });
    } else if (type === "editLimit") {
        performAction("updateLimit", { userId: user.id, limit: newDeviceLimit });
    } else if (type === "deleteAllDevicesConfirm") {
        performAction("deleteAllDevices", { userId: user.id });
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

  return (
    <div className="flex h-full flex-col">
      {/* Original Layout Structure */}
      <UserTabs onAddUser={() => openModal("add")} />
      <UserFilters cities={allCities} />

      {/* ADDED: Global actions toolbar, placed above the user list */}
      <div className="border-t border-b p-4 dark:border-gray-700 flex justify-end">
        <button
            onClick={() => setUpdateAllModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
            <Settings size={16} />
            <span>تنظیم کلی محدودیت</span>
        </button>
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
              onManageDevices={handleManageDevices} // Prop for new feature
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={t.notUserFound} />
          </div>
        )}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      {/* ===== ALL MODALS (RESTORED & FUNCTIONAL) ===== */}

      {/* 1. Add New User Modal */}
      <ReusableModal isOpen={modalState.type === "add"} onClose={() => setModalState({ type: null })} title={t.addUserModalTitle}>
        <AddNewUserForm formData={newUserFormData} onFormChange={handleFormInputChange} onSubmit={handleAddUserSubmit} onCancel={() => setModalState({ type: null })} isSubmitting={isSubmitting} cities={allCities} />
      </ReusableModal>

      {/* 2. Generic Confirmation Modal */}
      <ReusableModal isOpen={["approve", "reject", "delete", "toggleActive"].includes(modalState.type ?? "")} onClose={() => setModalState({ type: null })} title="تایید عملیات">
        <ConfirmationDialog message="آیا از انجام این عملیات مطمئن هستید؟" onConfirm={handleConfirmAction} onCancel={() => setModalState({ type: null })} isConfirming={isSubmitting} confirmText={t.confirm}/>
      </ReusableModal>

      {/* 3. Edit Single User Device Limit Modal */}
      <ReusableModal isOpen={modalState.type === "editLimit"} onClose={() => setModalState({ type: null })} title={t.editDeviceLimitTitle}>
        <div className="flex flex-col gap-4 p-4">
            <p>محدودیت دستگاه برای: <span className="font-bold">{modalState.user?.fullName}</span></p>
            <input type="number" value={newDeviceLimit} onChange={(e) => setNewDeviceLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full rounded-lg border border-gray-300 p-2 text-center text-lg dark:border-gray-600 dark:bg-gray-700" min="1" />
            <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setModalState({ type: null })} className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-600">{t.cancel}</button>
                <button onClick={handleConfirmAction} disabled={isSubmitting} className="rounded-lg bg-blue-dark px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? 'در حال ذخیره...' : t.confirm}</button>
            </div>
        </div>
      </ReusableModal>
      
      {/* 4. Set Global Device Limit Modal */}
      <ReusableModal isOpen={isUpdateAllModalOpen} onClose={() => setUpdateAllModalOpen(false)} title="تنظیم محدودیت دستگاه برای همه کاربران">
          <div className="flex flex-col gap-4 p-4">
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"><p>توجه: این تغییر بر همه کاربران (جز ادمین‌ها) اعمال خواهد شد.</p></div>
              <label htmlFor="globalLimitInput">محدودیت تعداد دستگاه</label>
              <input id="globalLimitInput" type="number" value={globalLimit} onChange={(e) => setGlobalLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full rounded-lg border border-gray-300 p-2 text-center text-lg dark:border-gray-600 dark:bg-gray-700" min="1" />
              <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setUpdateAllModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-600">{t.cancel}</button>
                  <button onClick={() => performAction('updateAllLimits', { limit: globalLimit })} disabled={isSubmitting} className="rounded-lg bg-blue-dark px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? 'در حال ذخیره...' : 'اعمال تغییرات'}</button>
              </div>
          </div>
      </ReusableModal>

      {/* 5. Manage User Devices Modal (Simple & Clean) */}
      <ReusableModal isOpen={modalState.type === "manageDevices"} onClose={() => setModalState({ type: null })} title={`دستگاه‌های فعال ${modalState.user?.fullName}`}>
          <div className="min-h-[20rem] max-h-[70vh] min-w-[300px] overflow-y-auto p-4 sm:min-w-[550px]">
              {isLoadingDevices ? (
                  <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
              ) : activeDevices.length > 0 ? (
                  <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-end border-b pb-3 dark:border-gray-700">
                          <button onClick={() => openModal('deleteAllDevicesConfirm', modalState.user)} className="flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60">
                              <ShieldAlert size={14} />
                              حذف همه دستگاه‌ها
                          </button>
                      </div>
                      <ul className="flex flex-col gap-3 pt-2">
                          {activeDevices.map(device => (
                              <li key={device.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <div className="flex flex-col gap-1 text-xs">
                                      <p className="max-w-xs truncate font-semibold text-gray-700 dark:text-gray-200" title={device.userAgent}>{device.userAgent}</p>
                                      <p className="font-mono text-gray-500 dark:text-gray-400">IP: {device.ipAddress || 'N/A'}</p>
                                      <p className="text-gray-400">آخرین ورود: {new Date(device.lastLoginAt).toLocaleString('fa-IR')}</p>
                                  </div>
                                  <button onClick={() => handleDeleteDevice(device.deviceId)} disabled={isSubmitting} className="rounded-full p-2 text-red-500 hover:bg-red-100 disabled:opacity-50 dark:hover:bg-red-900/50">
                                      <Trash2 size={16} />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              ) : (
                  <div className="flex h-full min-h-[15rem] flex-col items-center justify-center gap-4 text-center">
                      <MonitorSmartphone className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">هیچ دستگاه فعالی برای این کاربر ثبت نشده است.</p>
                  </div>
              )}
          </div>
      </ReusableModal>

      {/* 6. Delete All Devices Confirmation Modal */}
      <ReusableModal isOpen={modalState.type === "deleteAllDevicesConfirm"} onClose={() => setModalState({ type: null })} title="تایید حذف همه دستگاه‌ها">
        <ConfirmationDialog 
            message={`آیا مطمئن هستید که می‌خواهید تمام دستگاه‌های کاربر «${modalState.user?.fullName}» را حذف کنید؟`} 
            onConfirm={handleConfirmAction} 
            onCancel={() => setModalState({ type: null })} 
            isConfirming={isSubmitting} 
            confirmText="بله، همه را حذف کن"
        />
      </ReusableModal>
    </div>
  );
};
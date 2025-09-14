"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, City, NewUserFormData } from "@/app/types/types";
import { userManagementMessages as messages } from "@/app/constants/userManagementMessages";
import { useUserActions } from "@/app/hooks/useUserActions";
import { UserTabs } from "./UserTabs";
import { UserFilters } from "./UserFilters";
import UserItem from "./UserItem";
import Pagination from "@/app/components/shared/Pagination";
import EmptyState from "@/app/components/empty-state/empty-state";
import ReusableModal from "@/app/components/shared/generalModal";
import ConfirmationDialog from "@/app/components/shared/ConfirmationDialog";
import AddNewUserForm from "./AddNewUserForm";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { toast } from "react-toastify";
import { userApi } from "@/app/services/userApi";
import LoadingSpinner from "../../Loading/Loading";
import { Trash2 } from "lucide-react";

// CHANGED: Added "editLimit"
type ModalType = "approve" | "reject" | "add" | "delete" | "toggleActive" | "editLimit";
interface ActiveDevice {
  id: number;
  userId: number;
  deviceId: string;
  userAgent: string;
  lastLoginAt: string;
}
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
  const [modalState, setModalState] = useState<{ type: ModalType | null; user?: User }>({ type: null });
  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    fullName: "", phone: "", role: userType === "wholesalers" ? 3 : userType === "retailers" ? 4 : (null as any), cityId: null,
  });
  // ADDED: State for the new limit value
  const [newDeviceLimit, setNewDeviceLimit] = useState(2);
  const [devicesModal, setDevicesModal] = useState<{ isOpen: boolean; user?: User | null }>({ isOpen: false, user: null });
const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([]);
const [isLoadingDevices, setIsLoadingDevices] = useState(false);
const { api } = useAuthenticatedApi(); // هوک api را بگیرید
  const { isSubmitting, performAction } = useUserActions(() => {
    setModalState({ type: null });
    router.refresh();
  });

  // ADDED: Effect to set initial limit when modal opens
  useEffect(() => {
    if (modalState.type === 'editLimit' && modalState.user) {
        setNewDeviceLimit(modalState.user.deviceLimit ?? 2);
    }
  }, [modalState]);


  const totalPages = Math.ceil(initialData.totalCount / itemsPerPage);

  const t = {
    // ... existing messages
    confirm: messages.confirm ?? "تأیید",
    cancel: messages.cancel ?? "انصراف",
    notUserFound: messages.notUserFound ?? "کاربری با این مشخصات یافت نشد.",
    editDeviceLimitTitle: "ویرایش محدودیت دستگاه", // <--- ADDED
  };

  const openConfirmationModal = (user: User, actionType: ModalType) => {
    if (actionType === "add") return;
    setModalState({ type: actionType, user });
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
    } else if (type === "editLimit") { // <--- ADDED
        performAction("updateLimit", { userId: user.id, limit: newDeviceLimit });
    }
  };
  const handleManageDevices = async (user: User) => {
    setDevicesModal({ isOpen: true, user });
    setIsLoadingDevices(true);
    try {
        const devices = await api.get<ActiveDevice[]>(userApi.listUserDevices(user.id));
        setActiveDevices(devices);
    } catch (error) {
        toast.error("خطا در دریافت لیست دستگاه‌ها");
        setActiveDevices([]);
    } finally {
        setIsLoadingDevices(false);
    }
};

const handleDeleteDevice = (deviceId: string) => {
    if (devicesModal.user) {
        performAction('deleteDevice', { userId: devicesModal.user.id, deviceId });
        // Refresh list after delete
        setActiveDevices(prev => prev.filter(d => d.deviceId !== deviceId));
    }
};
  const handleAddUserSubmit = () => {
    performAction("add", newUserFormData);
  };
  
  // ... handleFormInputChange remains the same

  // ... modalTitle and modalMessage logic can be simplified or kept as is
  
  return (
    <div className="flex h-full flex-col">
      <UserTabs onAddUser={() => setModalState({ type: "add" })} />
      <UserFilters cities={allCities} />
      <div className="flex-grow overflow-y-auto border-t dark:border-gray-700">
        {initialData.users.length > 0 ? (
          initialData.users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onApprove={(u) => openConfirmationModal(u, "approve")}
              onReject={(u) => openConfirmationModal(u, "reject")}
              onDelete={(u) => openConfirmationModal(u, "delete")}
              onToggleActive={(u) => openConfirmationModal(u, "toggleActive")}
              onEditLimit={(u) => openConfirmationModal(u, "editLimit")} // <--- ADDED
              onManageDevices={handleManageDevices}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={t.notUserFound ?? "هیچ کاربری یافت نشد."} />
          </div>
        )}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      {/* Add User Modal ... */}
      
      {/* Confirmation Modals ... */}

      {/* ADDED: Edit Device Limit Modal */}
      <ReusableModal
        isOpen={modalState.type === "editLimit"}
        onClose={() => setModalState({ type: null })}
        title={t.editDeviceLimitTitle}
      >
        <div className="p-4 flex flex-col gap-4">
            <p>محدودیت تعداد دستگاه برای کاربر <span className="font-bold">{modalState.user?.fullName}</span></p>
            <input
                type="number"
                value={newDeviceLimit}
                onChange={(e) => setNewDeviceLimit(Math.max(1, parseInt(e.target.value, 10) || 1))} // Min value of 1
                className="w-full rounded-lg border border-gray-300 p-2 text-center text-lg dark:border-gray-600 dark:bg-gray-700"
                min="1"
            />
            <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setModalState({ type: null })} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">
                    {t.cancel}
                </button>
                <button 
                    onClick={handleConfirmAction} 
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-blue-dark text-white disabled:opacity-50"
                >
                    {isSubmitting ? 'در حال ذخیره...' : t.confirm}
                </button>
            </div>
        </div>
      </ReusableModal>
      <ReusableModal
    isOpen={devicesModal.isOpen}
    onClose={() => setDevicesModal({ isOpen: false, user: null })}
    title={`مدیریت دستگاه‌های ${devicesModal.user?.fullName}`}
>
    <div className="p-4">
        {isLoadingDevices ? (
            <LoadingSpinner />
        ) : activeDevices.length > 0 ? (
            <ul className="flex flex-col gap-3">
                {activeDevices.map(device => (
                    <li key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex flex-col text-xs">
                            <span className="font-mono text-gray-500 dark:text-gray-400">{device.deviceId.substring(0, 16)}...</span>
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{device.userAgent}</span>
                            <span className="text-gray-400">{new Date(device.lastLoginAt).toLocaleString('fa-IR')}</span>
                        </div>
                        <button onClick={() => handleDeleteDevice(device.deviceId)} disabled={isSubmitting} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50">
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
            </ul>
        ) : (
            <p>هیچ دستگاه فعالی برای این کاربر ثبت نشده است.</p>
        )}
    </div>
</ReusableModal>
    </div>
  );
};
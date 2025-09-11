"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// تایپ‌ها و ثابت‌ها
import { User, City, NewUserFormData } from "@/app/types/types";
import { userManagementMessages as messages } from "@/app/constants/userManagementMessages";

// هوک سفارشی برای عملیات
import { useUserActions } from "@/app/hooks/useUserActions";

// کامپوننت‌های UI
import { UserTabs } from "./UserTabs";
import { UserFilters } from "./UserFilters";
import UserItem from "./UserItem";
import Pagination from "@/app/components/shared/Pagination";
import EmptyState from "@/app/components/empty-state/empty-state";
import ReusableModal from "@/app/components/shared/generalModal";
import ConfirmationDialog from "@/app/components/shared/ConfirmationDialog";
import AddNewUserForm from "./AddNewUserForm";

type ModalType = "approve" | "reject" | "add" | "delete" | "toggleActive";

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

  const [modalState, setModalState] = useState<{
    type: ModalType | null;
    user?: User;
  }>({ type: null });

  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    fullName: "",
    phone: "",
    role:
      userType === "wholesalers" ? 3 : userType === "retailers" ? 4 : (null as any),
    cityId: null,
  });

  const { isSubmitting, performAction } = useUserActions(() => {
    setModalState({ type: null }); // بستن مودال پس از موفقیت
    router.refresh(); // بارگذاری مجدد داده‌ها از سرور
  });

  const totalPages = Math.ceil(initialData.totalCount / itemsPerPage);

  // ————— Helpers (متن‌ها با fallback)
  const t = {
    noUsersFound: messages.noUsersFound ?? "هیچ کاربری پیدا نشد.",
    addUserModalTitle: messages.addUserModalTitle ?? "افزودن کاربر جدید",
    approveUserModalTitle: messages.approveUserModalTitle ?? "تأیید کاربر",
    rejectUserModalTitle: messages.rejectUserModalTitle ?? "رد کاربر",
    deleteUserModalTitle: messages.deleteUserModalTitle ?? "حذف کاربر",
    toggleActiveUserModalTitle:
      messages.toggleActiveUserModalTitle ?? "تغییر وضعیت کاربر",
    approveUserConfirm:
      messages.approveUserConfirm ?? "آیا از تأیید {userName} مطمئن هستید؟",
    rejectUserConfirm:
      messages.rejectUserConfirm ?? "آیا از رد {userName} مطمئن هستید؟",
    deleteUserConfirm:
      messages.deleteUserConfirm ?? "کاربر {userName} حذف خواهد شد. ادامه می‌دهید؟",
    activateUserConfirm:
      messages.activateUserConfirm ??
      "آیا از فعال‌کردن کاربر {userName} مطمئن هستید؟",
    deactivateUserConfirm:
      messages.deactivateUserConfirm ??
      "آیا از غیرفعال‌کردن کاربر {userName} مطمئن هستید؟",
    confirm: messages.confirm ?? "تأیید",
    cancel: messages.cancel ?? "انصراف",
  };

  // ————— Modal openers
  const openConfirmationModal = (user: User, actionType: ModalType) => {
    // فقط برای مودال‌های تاییدی
    if (actionType === "add") return;
    setModalState({ type: actionType, user });
  };

  // ————— Confirm handlers
  const handleConfirmAction = () => {
    const { type, user } = modalState;
    if (!type) return;

    if (type === "approve" || type === "reject") {
      if (user) performAction(type, user);
      return;
    }

    if (type === "delete") {
      if (user) performAction("delete", { userId: user.id });
      return;
    }

    if (type === "toggleActive") {
      if (user) {
        const nextActive = !(user as any).isActive; // فرض بر وجود isActive روی User
        performAction("toggleActive", { userId: user.id, nextActive });
      }
      return;
    }
  };

  // ————— Add user handlers
  const handleAddUserSubmit = () => {
    performAction("add", newUserFormData);
  };

  const handleFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumericField = name === "role" || name === "cityId";
    setNewUserFormData((prev) => ({
      ...prev,
      [name]:
        isNumericField ? (value === "" || value === "-1" ? null : +value) : value,
    }));
  };

  // ————— Modal title & message builder
  const currentUser = modalState.user;
  const userName = currentUser?.fullName || "";

  const modalTitle =
    modalState.type === "approve"
      ? t.approveUserModalTitle
      : modalState.type === "reject"
      ? t.rejectUserModalTitle
      : modalState.type === "delete"
      ? t.deleteUserModalTitle
      : modalState.type === "toggleActive"
      ? t.toggleActiveUserModalTitle
      : t.addUserModalTitle;

  const modalMessage =
    modalState.type === "approve"
      ? t.approveUserConfirm.replace("{userName}", userName)
      : modalState.type === "reject"
      ? t.rejectUserConfirm.replace("{userName}", userName)
      : modalState.type === "delete"
      ? t.deleteUserConfirm.replace("{userName}", userName)
      : modalState.type === "toggleActive"
      ? ((currentUser as any)?.isActive
          ? t.deactivateUserConfirm
          : t.activateUserConfirm
        ).replace("{userName}", userName)
      : "";

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
              // اکشن‌های قبلی
              onApprove={(u) => openConfirmationModal(u, "approve")}
              onReject={(u) => openConfirmationModal(u, "reject")}
              // اکشن‌های جدید
              onDelete={(u) => openConfirmationModal(u, "delete")}
              onToggleActive={(u) => openConfirmationModal(u, "toggleActive")}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={t.noUsersFound} />
          </div>
        )}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      {/* مودال افزودن کاربر جدید */}
      <ReusableModal
        isOpen={modalState.type === "add"}
        onClose={() => setModalState({ type: null })}
        title={t.addUserModalTitle}
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

      {/* مودال‌های تایید (approve / reject / delete / toggleActive) */}
      <ReusableModal
        isOpen={
          modalState.type === "approve" ||
          modalState.type === "reject" ||
          modalState.type === "delete" ||
          modalState.type === "toggleActive"
        }
        onClose={() => setModalState({ type: null })}
        title={modalTitle}
      >
        {currentUser && modalState.type !== "add" && (
          <ConfirmationDialog
            message={modalMessage}
            onConfirm={handleConfirmAction}
            onCancel={() => setModalState({ type: null })}
            isConfirming={isSubmitting}
            confirmText={t.confirm}
          />
        )}
      </ReusableModal>
    </div>
  );
};

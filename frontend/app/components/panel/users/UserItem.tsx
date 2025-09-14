"use client";
import React from "react";
import { User } from "@/app/types/types";
import { userManagementMessages as messages } from "@/app/constants/userManagementMessages";
import { Check, X, Trash2, ToggleLeft, ToggleRight, Users } from "lucide-react"; // <--- ADDED Users icon

interface UserItemProps {
  user: User;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive: (user: User) => void;
  onEditLimit: (user: User) => void; // <--- ADDED
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onApprove,
  onReject,
  onDelete,
  onToggleActive,
  onEditLimit, // <--- ADDED
}) => {
  const isActive = (user as any)?.isActive === true;

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-200 p-4 text-sm dark:border-gray-700">
      <span className="col-span-3 truncate" title={user.fullName}>
        {user.fullName}
      </span>

      <span
        className="col-span-2 truncate text-gray-500 dark:text-gray-400"
        title={user.cityName}
      >
        {user.cityName}
      </span>

      <span className="col-span-3 truncate text-gray-500 dark:text-gray-400" dir="ltr">
        {user.phone}
      </span>

      {/* ADDED: Device limit display */}
      <div className="col-span-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Users size={14} />
          <span>{user.deviceLimit ?? 2}</span>
      </div>


      {/* Actions */}
      <div className="col-span-3 flex justify-end gap-2">
        {/* ADDED: Edit limit button */}
        <button
          onClick={() => onEditLimit(user)}
          title="ویرایش محدودیت دستگاه"
          className="rounded-md p-2 transition bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300"
        >
          <Users size={16} />
        </button>

        <button
          onClick={() => onToggleActive(user)}
          title={isActive ? (messages.deactivateAction ?? "غیرفعال کردن") : (messages.activateAction ?? "فعال کردن")}
          className={`rounded-md p-2 transition ${
            isActive
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-800/40 dark:text-amber-300"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/40 dark:text-blue-300"
          }`}
        >
          {isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
        </button>

        <button
          onClick={() => onDelete(user)}
          title={messages.deleteAction ?? "حذف کاربر"}
          className="rounded-md bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-800/50 dark:text-red-400"
        >
          <Trash2 size={16} />
        </button>

        {user.state === 1 && (
          <>
            <button
              onClick={() => onApprove(user)}
              title={messages.approveAction}
              className="rounded-md bg-green-100 p-2 text-green-700 transition hover:bg-green-200 dark:bg-green-800/50 dark:text-green-300"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => onReject(user)}
              title={messages.rejectAction}
              className="rounded-md bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700/60 dark:text-gray-300"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserItem;
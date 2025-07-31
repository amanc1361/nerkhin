"use client";
import React from 'react';
import { User } from '@/app/types/types';
import { userManagementMessages as messages } from '@/app/constants/userManagementMessages';
import { Check, X } from 'lucide-react';

interface UserItemProps {
  user: User;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onApprove, onReject }) => {
  const roleTextMap: { [key: string | number]: string } = {
    3: messages.wholesalersTab,
    4: messages.retailersTab,
    'wholesaler': messages.wholesalersTab,
    'retailer': messages.retailersTab,
  };
  const roleText =  String(user.roles);

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-200 p-4 text-sm dark:border-gray-700">
      <span className="col-span-3 truncate" title={user.fullName}>{user.fullName }</span>
      <span className="col-span-3 truncate text-gray-500 dark:text-gray-400" title={user.cityName}>{user.cityName}</span>
      <span className="col-span-3 truncate text-gray-500 dark:text-gray-400" dir="ltr">{user.phone}</span>
      {/* <span className="col-span-1 text-gray-500 dark:text-gray-400">{roleText}</span> */}
      
      {/* فقط برای کاربران جدید (state=1) دکمه‌های تایید/رد نمایش داده می‌شود */}
      {user.state === 1 && (
        <div className="col-span-2 flex justify-end gap-2">
          <button onClick={() => onApprove(user)} title={messages.approveAction} className="rounded-md bg-green-100 p-2 text-green-700 transition hover:bg-green-200 dark:bg-green-800/50 dark:text-green-300">
            <Check size={16} />
          </button>
          <button onClick={() => onReject(user)} title={messages.rejectAction} className="rounded-md bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-800/50 dark:text-red-400">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
export default UserItem;
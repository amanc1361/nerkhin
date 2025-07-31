"use client";
import React from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { Admin } from '@/app/types/admin/adminManagement';
import { adminManagementMessages as messages } from '@/app/constants/adminManagementMessages';

interface AdminItemProps {
  admin: Admin;
  onDelete: (admin: Admin) => void;
  onEditAccess: (admin: Admin) => void;
}

const AdminItem: React.FC<AdminItemProps> = ({ admin, onDelete, onEditAccess }) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-200 p-4 text-sm dark:border-gray-700">
      <span className="col-span-3 truncate" title={admin.fullName}>{admin.fullName || "ادمین بی‌نام"}</span>
      <span className="col-span-3 truncate text-gray-500 dark:text-gray-400" title={admin.cityName}>{admin.cityName}</span>
      <span className="col-span-2 truncate text-gray-500 dark:text-gray-400" dir="ltr">{admin.phone}</span>
      <div className="col-span-4 flex justify-end gap-4">
        <button onClick={() => onEditAccess(admin)} title={messages.permissions} className="flex items-center gap-1 text-blue-dark transition-colors hover:text-blue-500">
          <Settings size={18} />
          <span className="hidden md:inline">{messages.permissions}</span>
        </button>
        <button onClick={() => onDelete(admin)} title={messages.deleteAdmin} className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-700">
          <Trash2 size={18} />
          <span className="hidden md:inline">{messages.deleteAdmin}</span>
        </button>
      </div>
    </div>
  );
};
export default AdminItem;
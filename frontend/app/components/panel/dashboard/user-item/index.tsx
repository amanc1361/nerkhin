import React from 'react';
import { dashboardMessages } from '@/app/constants/string';
// ما کل آبجکت user را به عنوان prop نمی‌گیریم، فقط فیلدهای لازم
interface DashboardUserItemProps {
  fullName?: string;
  phone?: string;
  role?: string | number;
}

const DashboardUserItem: React.FC<DashboardUserItemProps> = ({ fullName, phone, role }) => {
  const roleText = (role === 3 || String(role) === 'wholesaler') 
    ? dashboardMessages.wholesaler 
    : dashboardMessages.retailer;
    
  return (
    <div className="flex flex-row items-center justify-between text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{fullName || "کاربر بی‌نام"}</span>
      <div className="flex flex-row items-center gap-4 text-gray-500 dark:text-gray-400">
        <span>{phone}</span>
        <span className="rounded-full bg-purple-light px-2 py-1 text-xs text-purple-dark dark:bg-purple-dark dark:text-purple-light">{roleText}</span>
      </div>
    </div>
  );
};

export default DashboardUserItem;
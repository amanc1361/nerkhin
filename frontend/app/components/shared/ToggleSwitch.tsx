// فایل: components/shared/ToggleSwitch.tsx
"use client";

import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  // امضای onChange را اصلاح می‌کنیم تا با رویداد استاندارد input هماهنگ باشد
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  // یک ID برای اتصال label به input
  id: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, disabled = false, id }) => {
  return (
    <div className="flex w-full items-center justify-between py-2">
      <label htmlFor={id} className="cursor-pointer select-none text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
      </label>
      
      {/* این بخش به عنوان یک label عمل می‌کند تا کلیک روی آن هم کار کند */}
      <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only" // مخفی کردن چک‌باکس اصلی
          checked={checked}
          onChange={onChange} // تابع onChange مستقیماً به input داده می‌شود
          disabled={disabled}
        />
        {/* این div ظاهر سوییچ را بر اساس وضعیت چک‌باکس (peer) تغییر می‌دهد */}
        <div className="h-7 w-12 rounded-full bg-gray-300 after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-dark peer-checked:after:translate-x-full dark:bg-gray-600"></div>
      </label>
    </div>
  );
};

export default ToggleSwitch;
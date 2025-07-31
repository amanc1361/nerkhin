// فایل: components/Loading/LoadingSpinner.tsx (نسخه جدید و قابل تنظیم)
"use client";

import React from "react";

// تعریف پراپ‌های جدید برای کامپوننت
interface LoadingSpinnerProps {
  /** نحوه نمایش اسپینر: 'overlay' برای تمام صفحه، 'inline' برای نمایش درجا */
  mode?: 'overlay' | 'inline';
  /** اندازه اسپینر */
  size?: 'small' | 'medium' | 'large';
  /** کلاس‌های CSS اضافی برای استایل‌دهی بیشتر از بیرون */
  className?: string;
  /** متنی که برای صفحه‌خوان‌ها خوانده می‌شود */
  screenReaderText?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  mode = 'overlay', // مقدار پیش‌فرض 'overlay' است تا کدهای قبلی شما دچار مشکل نشوند
  size = 'medium',
  className = '',
  screenReaderText = 'در حال بارگذاری...',
}) => {
  // تعریف کلاس‌های مربوط به اندازه اسپینر
  const sizeClasses = {
    small: 'h-12 w-12 border-t-4 border-b-4', // کوچک‌تر برای استفاده‌های درجا
    medium: 'h-24 w-24 border-t-8 border-b-8', // اندازه پیش‌فرض قبلی
    large: 'h-32 w-32 border-t-8 border-b-8',
  };

  // تعریف کلاس‌های مربوط به حالت نمایش
  const modeClasses = {
    overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm',
    inline: 'flex items-center justify-center', // حالت ساده برای نمایش درجا
  };

  const currentSizeClass = sizeClasses[size];
  const currentModeClass = modeClasses[mode];

  return (
    <div
      className={`${currentModeClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        {/* حلقه پس‌زمینه اسپینر */}
        <div className={`${currentSizeClass} rounded-full border-gray-200 dark:border-gray-600`}></div>
        {/* حلقه چرخان اسپینر */}
        <div className={`absolute top-0 left-0 ${currentSizeClass} rounded-full border-blue-500 dark:border-blue-400 animate-spin`}></div>
      </div>
      <span className="sr-only">{screenReaderText}</span>
    </div>
  );
};

export default LoadingSpinner;
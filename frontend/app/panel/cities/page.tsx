// فایل: app/panel/cities/page.tsx (نسخه کامل و نهایی)
"use client";

import React from 'react';
import { PlusCircle } from 'lucide-react';

import { useManageCities } from '@/app/hooks/useManageCity'; // مسیر صحیح به هوک شما
import { cityMessages } from '@/app/constants/citymessage';   // مسیر صحیح به فایل پیام‌ها

import LoadingSpinner from '@/app/components/Loading/Loading';
import ReusableModal from '@/app/components/shared/generalModal';
import AddNewCityForm from '@/app/components/panel/cities/AddNewCityForm';
import CityItem from '@/app/components/panel/cities/city-item';
import EmptyState from '@/app/components/empty-state/empty-state';

const CitiesPage: React.FC = () => {
  // دریافت تمام state ها و توابع لازم از هوک مدیریت شهرها
  const {
    cities,
    isLoading,
    refetchCities,
    showAddModal,
    openAddModal,
    closeAddModal,
    newCityData,
    handleInputChange,
    handleAddSubmit,
    isSubmitting,
  } = useManageCities();

  // اگر در حال بارگذاری اولیه لیست شهرها هستیم، اسپینر تمام صفحه نمایش داده شود
  if (isLoading && cities.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-full w-full flex-col VazirFont">
      {/* هدر صفحه شامل عنوان و دکمه افزودن شهر جدید */}
      <header className="flex w-full flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{cityMessages.pageTitle}</h1>
        <button
          onClick={openAddModal} // <--- تابع از هوک فراخوانی می‌شود
          className="flex items-center gap-2 rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <PlusCircle size={18} />
          <span>{cityMessages.addNewCity}</span>
        </button>
      </header>

      {/* بخش اصلی که لیست شهرها یا پیام حالت خالی را نمایش می‌دهد */}
      <main className="flex-grow overflow-y-auto">
        {cities.length > 0 ? (
          <div className="p-4 sm:p-6">
            {cities.map((city) => (
              // پراپ‌های صحیح برای کامپوننت CityItem
              <CityItem
                key={city.id}
                city={city}
                onCityDeleted={refetchCities} // <--- پراپ‌های صحیح
              />
            ))}
          </div>
        ) : (
          !isLoading && ( 
            <div className="flex h-full items-center justify-center">
              <EmptyState text={cityMessages.noCities} />
            </div>
          )
        )}
      </main>

      {/* مودال قابل استفاده مجدد برای افزودن شهر جدید */}
      <ReusableModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title={cityMessages.addModalTitle}
      >
        {/* پراپ‌های صحیح برای کامپوننت AddNewCityForm */}
        <AddNewCityForm
          formData={newCityData}
          onFormChange={handleInputChange}
          onSubmit={handleAddSubmit}
          onCancel={closeAddModal}
          isSubmitting={isSubmitting} // <--- پراپ‌های صحیح
        />
      </ReusableModal>
    </div>
  );
};

export default CitiesPage;
// فایل: components/panel/cities/city-item.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import ReusableModal from '@/app/components/shared/generalModal';
import { City } from '@/app/types/types';
import { useItemDelete } from '@/app/hooks/useItemDelete';
import { cityApi } from '@/app/services/cityApi';
import { cityMessages } from '@/app/constants/citymessage';
import LoadingSpinner from '@/app/components/Loading/Loading';

interface CityItemProps {
  city: City;
  onCityDeleted: () => void;
}

// تابع کمکی برای نمایش نوع شهر
const getCityTypeLabel = (typeCode: number): string => {
  switch (typeCode) {
    case 1: return cityMessages.cityTypeCounty;
    case 2: return cityMessages.cityTypeProvinceCenter;
    case 3: return cityMessages.cityTypeCapital;
    default: return cityMessages.cityTypeUnknown;
  }
};

const CityItem: React.FC<CityItemProps> = ({ city, onCityDeleted }) => {
  const { isDeleting, showDeleteModal, openDeleteModal, closeDeleteModal, confirmDelete } = 
    useItemDelete({
      deleteApiCall: (ids) => cityApi.delete(ids),
      onSuccess: onCityDeleted,
      successMessage: cityMessages.deleteSuccess,
      errorMessage: cityMessages.deleteError,
    });

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 p-4 px-6 text-sm dark:border-gray-700">
        <span className="w-1/3 truncate text-right font-medium text-gray-800 dark:text-gray-200" title={city.name}>
          {city.name}
        </span>
        <span className="w-1/3 truncate text-center text-gray-500 dark:text-gray-400" title={getCityTypeLabel(city.type)}>
          {getCityTypeLabel(city.type)}
        </span>
        <div className="flex w-1/3 justify-end">
          <button
            onClick={openDeleteModal}
            className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label={`${cityMessages.delete} ${city.name}`}
            disabled={isDeleting}
          >
            <Image src="/icons/trash/Trash.svg" alt="" width={18} height={18} />
            <span className="hidden sm:inline">{cityMessages.delete}</span>
          </button>
        </div>
      </div>

      <ReusableModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title={cityMessages.deleteModalTitle}
      >
        <div>
          <p className="dark:text-gray-300">
            {cityMessages.confirmDeleteMessage.replace('{cityName}', city.name)}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              disabled={isDeleting}
            >
              {cityMessages.cancel}
            </button>
            <button
              onClick={() => confirmDelete([city.id])}
              className="flex min-w-[100px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-70"
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner  /> : cityMessages.confirmAndDelete}
            </button>
          </div>
        </div>
      </ReusableModal>
    </>
  );
};

export default CityItem;
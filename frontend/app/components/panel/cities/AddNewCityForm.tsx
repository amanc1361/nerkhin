// فایل: components/panel/cities/AddNewCityForm.tsx
"use client";

import React from 'react';
import { cityMessages } from '@/app/constants/citymessage';
import { NewCityFormData } from '@/app/types/types';
import LoadingSpinner from '@/app/components/Loading/Loading'; // یک اسپینر کوچک‌تر شاید بهتر باشد

interface AddNewCityFormProps {
  formData: NewCityFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AddNewCityForm: React.FC<AddNewCityFormProps> = ({ formData, onFormChange, onSubmit, onCancel, isSubmitting }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-4">
      {/* City Name Input */}
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {cityMessages.cityNameLabel}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder={cityMessages.cityNamePlaceholder}
          value={formData.name}
          onChange={onFormChange}
          className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary-main dark:border-gray-600 dark:bg-gray-700"
          required
        />
      </div>

      {/* City Type Select */}
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {cityMessages.cityTypeLabel}
        </label>
        <select
          id="type"
          name="type"
          value={formData.type ?? -1}
          onChange={onFormChange}
          className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary-main dark:border-gray-600 dark:bg-gray-700 bg-white"
          required
        >
          <option value="-1" disabled>{cityMessages.cityTypePlaceholder}</option>
          <option value={1}>{cityMessages.cityTypeCounty}</option>
          <option value={2}>{cityMessages.cityTypeProvinceCenter}</option>
          <option value={3}>{cityMessages.cityTypeCapital}</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          disabled={isSubmitting}
        >
          {cityMessages.cancel}
        </button>
        <button
          type="submit"
          className="flex items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner  /> : cityMessages.add}
        </button>
      </div>
    </form>
  );
};

export default AddNewCityForm;
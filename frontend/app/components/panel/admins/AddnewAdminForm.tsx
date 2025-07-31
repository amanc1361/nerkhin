"use client";

import React from 'react';
import { adminManagementMessages as messages } from '@/app/constants/adminManagementMessages';
import { NewAdminFormData } from '@/app/types/admin/adminManagement';
import LoadingSpinner from '@/app/components/Loading/Loading';
import { City } from '@/app/types/types';

interface AddNewAdminFormProps {
  formData: NewAdminFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  cities: City[];
}

const AddNewAdminForm: React.FC<AddNewAdminFormProps> = ({ formData, onFormChange, onSubmit, onCancel, isSubmitting, cities }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-4">
      {/* Full Name Input */}
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {messages.fullNameLabel}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder={messages.fullNamePlaceholder}
          value={formData.fullName}
          onChange={onFormChange}
          required
          className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary-main dark:border-gray-600 dark:bg-gray-700"
        />
      </div>

      {/* Phone Input */}
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {messages.phoneLabel}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder={messages.phonePlaceholder}
          value={formData.phone}
          onChange={onFormChange}
          required
          className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary-main dark:border-gray-600 dark:bg-gray-700"
          dir="ltr"
        />
      </div>

      {/* City Select */}
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="cityId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {messages.cityLabel}
        </label>
        <select
          id="cityId"
          name="cityId"
          value={formData.cityId ?? -1}
          onChange={onFormChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white p-2.5 outline-none focus:border-primary-main dark:border-gray-600 dark:bg-gray-700"
        >
          <option value={-1} disabled>{messages.selectCityPlaceholder}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {messages.cancel}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-w-[100px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
        >
          {isSubmitting ? <LoadingSpinner size="small" mode="inline" /> : messages.submit}
        </button>
      </div>
    </form>
  );
};

export default AddNewAdminForm;
"use client";
import React from 'react';
import { userManagementMessages as messages } from '@/app/constants/userManagementMessages';
import { NewUserFormData, City } from '@/app/types/types';
import LoadingSpinner from '@/app/components/Loading/Loading';

interface AddNewUserFormProps {
  formData: NewUserFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  cities: City[];
}

const AddNewUserForm: React.FC<AddNewUserFormProps> = ({ formData, onFormChange, onSubmit, onCancel, isSubmitting, cities }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="fullName" className="text-sm font-medium">{messages.fullNameLabel}</label>
        <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={onFormChange} required className="w-full rounded-lg border p-2" />
      </div>
      <div className="flex flex-col items-start gap-1">
        <label htmlFor="phone" className="text-sm font-medium">{messages.phoneLabel}</label>
        <input id="phone" name="phone" type="tel" value={formData.phone} onChange={onFormChange} required className="w-full rounded-lg border p-2" dir="ltr" />
      </div>
      <div className="flex gap-4">
        <div className="w-1/2 flex flex-col items-start gap-1">
          <label htmlFor="role" className="text-sm font-medium">{messages.userRoleLabel}</label>
          <select id="role" name="role" value={formData.role ?? -1} onChange={onFormChange} required className="w-full rounded-lg border bg-white p-2.5">
            <option value="-1" disabled>{messages.selectRolePlaceholder}</option>
            <option value={3}>{messages.wholesalersTab}</option>
            <option value={4}>{messages.retailersTab}</option>
          </select>
        </div>
        <div className="w-1/2 flex flex-col items-start gap-1">
          <label htmlFor="cityId" className="text-sm font-medium">{messages.cityLabel}</label>
          <select id="cityId" name="cityId" value={formData.cityId ?? -1} onChange={onFormChange} required className="w-full rounded-lg border bg-white p-2.5">
            <option value="-1" disabled>{messages.selectCityPlaceholder}</option>
            {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100">
          {messages.cancel}
        </button>
        <button type="submit" disabled={isSubmitting} className="flex min-w-[100px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white disabled:opacity-70">
          {isSubmitting ? <LoadingSpinner  /> : messages.submit}
        </button>
      </div>
    </form>
  );
};
export default AddNewUserForm;
"use client";
import React, { useState } from 'react';
import { subscriptionMessages as messages } from '@/app/constants/subscriptionMessages';
import { NewSubscriptionFormData } from '@/app/types/subscription/subscriptionManagement';
import LoadingSpinner from '@/app/components/Loading/Loading';

interface AddNewSubscriptionFormProps {
  onSubmit: (data: NewSubscriptionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AddNewSubscriptionForm: React.FC<AddNewSubscriptionFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<NewSubscriptionFormData>({ price: '', numberOfDays: null });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'numberOfDays' ? +value : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="w-full">
        <label htmlFor="price" className="block text-sm font-medium mb-1">{messages.priceLabel}</label>
        <input id="price" name="price" type="number" placeholder="e.g., 50000" value={formData.price} onChange={handleChange} required className="w-full rounded-lg border p-2" />
      </div>
      <div className="w-full">
        <label htmlFor="numberOfDays" className="block text-sm font-medium mb-1">{messages.durationLabel}</label>
        <select id="numberOfDays" name="numberOfDays" value={formData.numberOfDays ?? -1} onChange={handleChange} required className="w-full rounded-lg border bg-white p-2.5">
          <option value="-1" disabled>{messages.selectDurationPlaceholder}</option>
          <option value={1}>{messages.durationOptions.monthly}</option>
          <option value={2}>{messages.durationOptions.quarterly}</option>
          <option value={3}>{messages.durationOptions.semiAnnually}</option>
          <option value={4}>{messages.durationOptions.annually}</option>
        </select>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
          {messages.cancel}
        </button>
        <button type="submit" disabled={isSubmitting} className="flex min-w-[100px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm text-white disabled:opacity-70">
          {isSubmitting ? <LoadingSpinner size="small" mode="inline" /> : messages.add}
        </button>
      </div>
    </form>
  );
};
export default AddNewSubscriptionForm;
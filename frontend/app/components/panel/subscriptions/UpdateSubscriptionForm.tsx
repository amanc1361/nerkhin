"use client";
import React, { useState } from 'react';
import { subscriptionMessages as messages } from '@/app/constants/subscriptionMessages';
import { Subscription, UpdateSubscriptionFormData } from '@/app/types/subscription/subscriptionManagement';
import LoadingSpinner from '@/app/components/Loading/Loading';

interface UpdateSubscriptionFormProps {
  subscription: Subscription;
  onSave: (data: UpdateSubscriptionFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const UpdateSubscriptionForm: React.FC<UpdateSubscriptionFormProps> = ({ subscription, onSave, onCancel, isSaving }) => {
  const [price, setPrice] = useState(String(subscription.price));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price.trim()) {
      onSave({ id: subscription.id, price });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">{messages.priceLabel}</label>
        <input id="price" name="price" type="number" placeholder={messages.newPricePlaceholder} value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full rounded-lg border p-2" />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSaving} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
          {messages.cancel}
        </button>
        <button type="submit" disabled={isSaving} className="flex min-w-[100px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm text-white disabled:opacity-70">
          {isSaving ? <LoadingSpinner size="small" mode="inline" /> : messages.edit}
        </button>
      </div>
    </form>
  );
};
export default UpdateSubscriptionForm;
"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Edit, Trash2 } from 'lucide-react';

import { Subscription } from '@/app/types/subscription/subscriptionManagement';
import { subscriptionMessages as messages } from '@/app/constants/subscriptionMessages';
import { useSubscriptionActions } from '@/app/hooks/useSubscriptionActions';
import ReusableModal from '@/app/components/shared/generalModal';
import ConfirmationDialog from '@/app/components/shared/ConfirmationDialog';
import UpdateSubscriptionForm from './UpdateSubscriptionForm';

interface SubscriptionItemProps {
  subscription: Subscription;
  onActionSuccess: () => void;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, onActionSuccess }) => {
  const [modal, setModal] = useState<'update' | 'delete' | null>(null);
  const { isSubmitting, performAction } = useSubscriptionActions(() => {
    setModal(null);
    onActionSuccess();
  });

  const getDurationLabel = (days: number): string => {
    switch (days) {
      case 1: return messages.durationOptions.monthly;
      case 2: return messages.durationOptions.quarterly;
      case 3: return messages.durationOptions.semiAnnually;
      case 4: return messages.durationOptions.annually;
      default: return String(days);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 p-4 text-sm dark:border-gray-700">
        <span className="font-medium text-gray-800 dark:text-gray-200">{getDurationLabel(subscription.numberOfDays)}</span>
        <span className="text-gray-600 dark:text-gray-300">{Number(subscription.price).toLocaleString('fa-IR')} تومان</span>
        <div className="flex justify-end gap-4">
          <button onClick={() => setModal('update')} title={messages.editPrice} className="flex items-center gap-1 text-blue-dark hover:text-blue-500">
            <Edit size={16} />
            <span className="hidden md:inline">{messages.edit}</span>
          </button>
          <button onClick={() => setModal('delete')} title={messages.delete} className="flex items-center gap-1 text-red-500 hover:text-red-700">
            <Trash2 size={16} />
            <span className="hidden md:inline">{messages.delete}</span>
          </button>
        </div>
      </div>

      <ReusableModal isOpen={modal === 'update'} onClose={() => setModal(null)} title={messages.updateModalTitle}>
        <UpdateSubscriptionForm
          subscription={subscription}
          isSaving={isSubmitting}
          onSave={(updatedData) => performAction('update', updatedData)}
          onCancel={() => setModal(null)}
        />
      </ReusableModal>

      <ReusableModal isOpen={modal === 'delete'} onClose={() => setModal(null)} title={messages.deleteModalTitle}>
        <ConfirmationDialog
          message={messages.confirmDeleteMessage}
          onConfirm={() => performAction('delete', subscription)}
          onCancel={() => setModal(null)}
          isConfirming={isSubmitting}
          confirmText={messages.delete}
        />
      </ReusableModal>
    </>
  );
};
export default SubscriptionItem;
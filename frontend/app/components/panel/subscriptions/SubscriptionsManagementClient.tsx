"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { Subscription } from '@/app/types/subscription/subscriptionManagement';
import { subscriptionMessages as messages } from '@/app/constants/subscriptionMessages';
import { useSubscriptionActions } from '@/app/hooks/useSubscriptionActions';
import SubscriptionItem from './SubscriptionItem';
import EmptyState from '@/app/components/empty-state/empty-state';
import ReusableModal from '@/app/components/shared/generalModal';
import AddNewSubscriptionForm from './AddNewSubscriptionForm';

interface SubscriptionsManagementClientProps {
  initialSubscriptions: Subscription[];
}

export const SubscriptionsManagementClient: React.FC<SubscriptionsManagementClientProps> = ({ initialSubscriptions }) => {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  const { isSubmitting, performAction } = useSubscriptionActions(() => {
    setShowAddModal(false); // Close modal on success
    router.refresh(); // Refresh server-fetched data
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex w-full items-center justify-between border-b p-4 dark:border-gray-700">
        <h1 className="text-xl font-semibold dark:text-white">{messages.pageTitle}</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          <PlusCircle size={18} />
          {messages.addNewSubscription}
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4 border-b bg-gray-50 p-4 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <div className="text-right">{messages.planDuration}</div>
        <div className="">{messages.planPrice}</div>
        <div className="text-left">عملیات</div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {initialSubscriptions.length > 0 ? (
          initialSubscriptions.map(sub => (
            <SubscriptionItem key={sub.id} subscription={sub} onActionSuccess={() => router.refresh()} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={messages.noSubscriptionsFound} />
          </div>
        )}
      </div>

      <ReusableModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={messages.addModalTitle}>
        <AddNewSubscriptionForm
          onSubmit={(data) => performAction('add', data)}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
        />
      </ReusableModal>
    </div>
  );
};
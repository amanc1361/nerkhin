"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, BadgeCheck, BadgeX } from 'lucide-react';


import ReusableModal from '@/app/components/shared/generalModal'; // فرض بر وجود این کامپوننت
import { AdminUserViewModel } from '@/app/types/admin/adminManagement';
import { grantSubscriptionDays } from '@/app/services/adminactions';
import { toast } from 'react-toastify';
import { UserSubscriptionFilter } from './UserSubscriptionFilter';
import { userMessages as messages } from '@/lib/server/texts/adminUsermessage';
interface UsersListClientProps {
  users: AdminUserViewModel[];
}

export function UsersListClient({ users }: UsersListClientProps) {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserViewModel | null>(null);
  const [days, setDays] = useState(30);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleOpenModal = (user: AdminUserViewModel) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleGrantSubscription = async () => {
    if (!selectedUser || days < 1) return;
    setSubmitting(true);
    const result = await grantSubscriptionDays({ userId: selectedUser.id, days });
    if (result.success) {
      toast.success(messages.subscriptionGrantedSuccess);
      setModalOpen(false);
      // router.refresh() به دلیل revalidatePath در سرور اکشن دیگر ضروری نیست اما برای اطمینان می‌توان گذاشت
    } else {
      toast.error(messages.errorOccurred);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <header className="flex w-full items-center justify-between border-b p-4 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{messages.pageTitle}</h1>
      </header>

      <div className="p-4">
        <UserSubscriptionFilter />
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {/* Table Headers */}
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300">{messages.fullName}</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300">{messages.userType}</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300">{messages.subscriptionStatus}</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300">{messages.totalPaid}</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-300">{messages.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-semibold text-gray-900 dark:text-white">{user.fullName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.isWholesaler ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                    {user.isWholesaler ? messages.wholesaler : messages.retailer}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {user.hasSubscription ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <BadgeCheck size={18} />
                      <div>
                        <div>{messages.active}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.daysRemaining} روز باقیمانده</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <BadgeX size={18} />
                      <span>{messages.inactive}</span>
                    </div>
                  )}
                  {user.cityName && <div className="mt-1 text-xs text-gray-400">شهر: {user.cityName}</div>}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                  {Number(user.totalPaid).toLocaleString('fa-IR')} تومان
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <button onClick={() => handleOpenModal(user)} className="text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Award size={20} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">{messages.noUsersFound}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grant Subscription Modal */}
      <ReusableModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={`${messages.grantModalTitle} برای ${selectedUser?.fullName}`}>
        <div className="p-4">
          <label htmlFor="days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{messages.daysToGrant}</label>
          <input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            min="1"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600 dark:text-gray-200">{messages.cancel}</button>
            <button onClick={handleGrantSubscription} disabled={isSubmitting} className="rounded-md bg-blue-dark px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {isSubmitting ? '...' : messages.grant}
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
}
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
  const [impersonatingId, setImpersonatingId] = useState<number | null>(null);


  const handleImpersonate = async (userId: number) => {
    setImpersonatingId(userId); // برای نمایش حالت لودینگ
    try {
      const response = await fetch(`/api/auth/impersonate`, {
        method: 'POST', // <-- تغییر به POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), // <-- ارسال userId در بدنه
      });
  
      const data = await response.json();
      
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(`خطا در ورود به جای کاربر: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('خطایی در ارتباط با سرور رخ داد!');
    } finally {
      setImpersonatingId(null);
    }
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
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300">{messages.loginAsUser}</th>
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
  <button 
    onClick={() => handleImpersonate(user.id)}
    disabled={impersonatingId === user.id}
    title="ورود به جای کاربر" 
    className="text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-wait"
  >
    {impersonatingId === user.id ? (
      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h7.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V3.6c0-.4-.2-.8-.5-1.1-.3-.3-.7-.5-1.1-.5z"/><path d="M7 2h2"/><path d="M15 2h2"/><path d="M7 22h2"/><path d="M15 22h2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v1"/><path d="M12 14v1"/></svg>
    )}
  </button>
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
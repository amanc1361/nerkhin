"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { userMessages as messages } from '@/lib/server/texts/adminUsermessage';

export function UserSubscriptionFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">{messages.filter}:</h3>
      <select
        onChange={(e) => handleFilterChange('is_wholesaler', e.target.value)}
        defaultValue={searchParams.get('is_wholesaler') || 'all'}
        className="rounded border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">{messages.allUsers}</option>
        <option value="true">{messages.wholesaler}</option>
        <option value="false">{messages.retailer}</option>
      </select>
      <select
        onChange={(e) => handleFilterChange('has_subscription', e.target.value)}
        defaultValue={searchParams.get('has_subscription') || 'all'}
        className="rounded border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">{messages.allStatuses}</option>
        <option value="true">{messages.hasSubscription}</option>
        <option value="false">{messages.noSubscription}</option>
      </select>
    </div>
  );
}
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { userManagementMessages as messages } from '@/app/constants/userManagementMessages';

interface UserTabsProps {
  onAddUser: () => void;
}
export const UserTabs: React.FC<UserTabsProps> = ({ onAddUser }) => {
  const pathname = usePathname();
  const tabs = [
    { key: 'new-users', label: messages.newUsersTab, href: '/panel/users/new-users' },
    { key: 'wholesalers', label: messages.wholesalersTab, href: '/panel/users/wholesalers' },
    { key: 'retailers', label: messages.retailersTab, href: '/panel/users/retailers' },
  ];
  return (
    <header className="flex w-full flex-shrink-0 items-center justify-between border-b p-4 dark:border-gray-700">
      <nav className="flex items-center gap-2 md:gap-4">
        {tabs.map(tab => (
          <Link key={tab.key} href={tab.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${pathname.includes(tab.key) ? 'bg-blue-dark text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <button onClick={onAddUser} className="flex items-center gap-2 rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
        <PlusCircle size={18} />
        {messages.addNewUser}
      </button>
    </header>
  );
};
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { reportMessages } from '@/app/constants/reportMessages';

export const ReportTabs: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { 
      key: 'new-reports', 
      label: reportMessages.newReportsTab, 
      href: '/panel/reports/new-reports' 
    },
    { 
      key: 'checked-reports', 
      label: reportMessages.checkedReportsTab, 
      href: '/panel/reports/checked-reports' 
    },
  ];
  
  return (
    <header className="flex w-full items-center justify-between border-b p-4 dark:border-gray-700">
      <nav className="flex items-center gap-2 md:gap-4">
        {tabs.map(tab => (
          <Link 
            key={tab.key} 
            href={tab.href}
          
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              pathname === tab.href 
                ? 'bg-blue-dark text-white' 
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
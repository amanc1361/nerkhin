import React, { JSX } from 'react';
import { CircleDollarSignIcon } from 'lucide-react';
import PanelMenuButton from '@/app/components/panel/menu-button';
import Logoutbtn from '@/app/components/panel/LogoutBtn/Logoutbtn';
import { panelNavItems } from '@/app/constants/panelNavItems';
import { panelMessages } from '@/app/constants/string';
import PersianDate from '@/app/utils/persiadate';

interface PanelLayoutProps {
  children: React.ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps): JSX.Element {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen VazirFont bg-gray-100 dark:bg-gray-900">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-dark dark:text-gray-200">
        <div className="h-full container mx-auto">
          <nav className="h-16 flex flex-row justify-between items-center px-4 sm:px-6">
            <div className="flex flex-row items-center justify-center gap-3 text-stone-700 dark:text-stone-300 text-lg sm:text-xl VazirFontMedium">
              <CircleDollarSignIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              <span>{panelMessages.panelTitle}</span>
            </div>
            <div className="flex flex-row justify-end gap-4 items-center">
              <PersianDate />
            </div>
          </nav>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-row overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 md:w-1/6 bg-blue-ultra-dark dark:bg-gray-800 text-white flex flex-col justify-between overflow-y-auto shadow-lg">
          <nav className="flex-grow py-4 px-2">
            {panelNavItems.map((item) => (
              <PanelMenuButton
                key={item.href}
                href={item.href}
                label={item.label}
                menuPathname={item.activePathSegment}
              >
                <item.Icon className="w-5 h-5" />
              </PanelMenuButton>
            ))}
          </nav>

          <div className="w-full flex items-center justify-center p-4 border-t border-blue-dark dark:border-gray-700">
            <Logoutbtn />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow w-5/6 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

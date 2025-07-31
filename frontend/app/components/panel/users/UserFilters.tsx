// components/panel/users/UserFilters.tsx
"use client";

import React, { useState, useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { userManagementMessages as messages } from '@/app/constants/userManagementMessages';
import { City } from '@/app/types/types';
import { Search, X as ClearIcon } from 'lucide-react';
import LoadingSpinner from '@/app/components/Loading/Loading'; // یک اسپینر کوچک برای حالت گذار

export const UserFilters: React.FC<{ cities: City[] }> = ({ cities }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // برای مدیریت input جستجو از یک state داخلی استفاده می‌کنیم
  const [currentSearch, setCurrentSearch] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition(); // هوک برای حالت گذار بدون مسدود کردن UI

  const handleFilterChange = useCallback((key: 'cityId' | 'q', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', '1'); // همیشه با اعمال فیلتر به صفحه ۱ برو

    if (!value || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const query = current.toString();
    // استفاده از startTransition برای ناوبری نرم‌تر
    startTransition(() => {
      router.push(`${pathname}?${query}`);
    });
  }, [searchParams, pathname, router]);

  const clearSearch = () => {
    setCurrentSearch('');
    handleFilterChange('q', '');
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 border-b border-t p-4 dark:border-gray-700 md:flex-row bg-gray-50 dark:bg-gray-800/50">
      <div className="relative w-full md:w-1/2">
        <input
          type="text"
          placeholder={messages.searchPlaceholder}
          value={currentSearch}
          onChange={(e) => setCurrentSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFilterChange('q', currentSearch);
            }
          }}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 pr-8 dark:border-gray-600 dark:bg-gray-700"
        />
        {/* آیکون جستجو */}
        <Search 
          onClick={() => handleFilterChange('q', currentSearch)} 
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" size={20} 
        />
        {/* دکمه پاک کردن جستجو */}
        {currentSearch && (
          <button onClick={clearSearch} className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800">
            <ClearIcon size={18} />
          </button>
        )}
      </div>

      <select
        // --- شروع تغییر اصلی ---
        value={searchParams.get('cityId') || 'all'} // <--- استفاده از value به جای defaultValue
        // --- پایان تغییر اصلی ---
        onChange={(e) => handleFilterChange('cityId', e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-700 md:w-1/2"
      >
        <option value="all">{messages.allCities}</option>
        {cities.map((city) => (
          <option key={city.id} value={String(city.id)}>{city.name}</option>
        ))}
      </select>
      
      {/* نمایش اسپینر کوچک در زمان ناوبری */}
      {isPending && <LoadingSpinner  />}
    </div>
  );
};
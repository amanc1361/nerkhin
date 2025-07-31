"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { reportMessages as messages } from '@/app/constants/reportMessages';
import { Search, X as ClearIcon } from 'lucide-react';
import LoadingSpinner from '@/app/components/Loading/Loading';

// این کامپوننت در حال حاضر فقط شامل جستجو است، اما می‌توانید فیلترهای دیگر (مانند تاریخ) را هم به آن اضافه کنید.
export const ReportFilters: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [currentSearch, setCurrentSearch] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (query: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', '1'); // ریست کردن صفحه‌بندی هنگام جستجو

    if (!query) {
      current.delete('q');
    } else {
      current.set('q', query);
    }
    const search = current.toString();
    const newQuery = search ? `?${search}` : "";

    startTransition(() => {
      router.push(`${pathname}${newQuery}`);
    });
  };

  const clearSearch = () => {
    setCurrentSearch('');
    handleSearch('');
  };

  // این useEffect باعث می‌شود که اگر کاربر با دکمه back/forward مرورگر پارامتر q را تغییر داد،
  // مقدار input هم به‌روز شود.
  useEffect(() => {
    setCurrentSearch(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <div className="flex w-full items-center gap-4 border-b bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="relative w-full md:w-2/3 lg:w-1/2">
        <input 
          type="text"
          placeholder={messages.searchPlaceholder} 
          value={currentSearch}
          onChange={(e) => setCurrentSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(currentSearch); }}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 pr-8 dark:border-gray-600 dark:bg-gray-700"
        />
        {/* آیکون جستجو */}
        <button 
          onClick={() => handleSearch(currentSearch)} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
        {/* دکمه پاک کردن جستجو */}
        {currentSearch && (
          <button 
            onClick={clearSearch} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            aria-label="Clear search"
          >
            <ClearIcon size={18} />
          </button>
        )}
      </div>

      {/* نمایش اسپینر کوچک در زمان ناوبری (تغییر فیلتر) */}
      {isPending && <LoadingSpinner size="small" mode="inline" />}
    </div>
  );
};
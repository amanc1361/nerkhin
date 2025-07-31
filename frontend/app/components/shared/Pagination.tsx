
"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', String(newPage));
    const query = current.toString();
    router.push(`${pathname}?${query}`);
  };
  
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="rounded-lg p-2 transition hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700">
        <ChevronRight size={20} />
      </button>
      <span className="font-medium text-gray-700 dark:text-gray-300">
        صفحه {currentPage} از {totalPages}
      </span>
      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="rounded-lg p-2 transition hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700">
        <ChevronLeft size={20} />
      </button>
    </div>
  );
};
export default Pagination;
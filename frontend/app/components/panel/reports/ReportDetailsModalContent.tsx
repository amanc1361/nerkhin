"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from '@/app/hooks/useAuthenticatedApi';
import { Report } from '@/app/types/report/reportManagement';
import { reportApi } from '@/app/services/reportApi';
import { reportMessages as messages } from '@/app/constants/reportMessages';
import LoadingSpinner from '@/app/components/Loading/Loading';

interface ReportDetailsModalContentProps {
  reportId: number | string;
  onConfirm: (report: Report) => void;
  onCancel: () => void;
  isConfirming: boolean;
  isReviewed: boolean;
}

const rolesMap: { [key: string | number]: string } = {
  1: 'سوپر ادمین', 2: 'ادمین', 3: 'عمده فروش', 4: 'خرده فروش',
};

const DetailRow: React.FC<{ label: string, value?: string | number }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700">
    <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-gray-800 dark:text-gray-200">{value || '-'}</span>
  </div>
);

export const ReportDetailsModalContent: React.FC<ReportDetailsModalContentProps> = ({ reportId, onConfirm, onCancel, isConfirming, isReviewed }) => {
  const { api } = useAuthenticatedApi();
  const [details, setDetails] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!api) return;
      setIsLoading(true);
      try {
        const data = await api.get<Report>(reportApi.getById(reportId));
        setDetails(data);
      } catch (error) {
        toast.error(messages.fetchDetailsError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [api, reportId]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner mode="inline" size="medium" /></div>;
  }
  if (!details) {
    return <div className="p-4 text-center text-red-500">{messages.fetchDetailsError}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2 text-red-600 dark:text-red-400 dark:border-gray-600">مشخصات متخلف</h3>
        <DetailRow label="نام کاربر" value={details.targetUserFullName} />
        <DetailRow label="نام فروشگاه" value={details.targetUserShopName} />
        <DetailRow label="شماره همراه" value={details.targetUserPhone} />
        <DetailRow label="نوع کاربر" value={rolesMap[details.targetUserRole || '']}/>
        <DetailRow label="شهر" value={details.targetUserCity} />
      </div>

      <div className="w-full">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2 text-green-600 dark:text-green-400 dark:border-gray-600">مشخصات شاکی</h3>
        <DetailRow label="نام کاربر" value={details.userFullName} />
        <DetailRow label="نام فروشگاه" value={details.userShopName} />
        <DetailRow label="شماره همراه" value={details.userPhone} />
        <DetailRow label="نوع کاربر" value={rolesMap[details.userRole || '']} />
        <DetailRow label="شهر" value={details.userCity} />
      </div>
      
      <div className="mt-2 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
        <h4 className="font-semibold mb-1 dark:text-gray-200">{details.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">{details.description}</p>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button onClick={onCancel} disabled={isConfirming} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
          {messages.close}
        </button>
        {!isReviewed && (
          <button onClick={() => onConfirm(details)} disabled={isConfirming} className="flex min-w-[120px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-70">
            {isConfirming ? <LoadingSpinner size="small" mode="inline" /> : messages.markAsChecked}
          </button>
        )}
      </div>
    </div>
  );
};
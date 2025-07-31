"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Report, PaginatedReportsResponse } from '@/app/types/report/reportManagement';
import { reportMessages as messages } from '@/app/constants/reportMessages';
import { useReportActions } from '@/app/hooks/useReportActions';

import ReportItem from './ReportItem';
import Pagination from '@/app/components/shared/Pagination';
import EmptyState from '@/app/components/empty-state/empty-state';
import ReusableModal from '@/app/components/shared/generalModal';
import { ReportDetailsModalContent } from './ReportDetailsModalContent';
import { ReportTabs } from './ReportTabs';
import { ReportFilters } from './ReportFilters';


interface ReportManagementClientProps {
  initialData: PaginatedReportsResponse & { page: number };
  isReviewedPage: boolean;
}

export const ReportManagementClient: React.FC<ReportManagementClientProps> = ({ initialData, isReviewedPage }) => {
  const router = useRouter();
  const [modalState, setModalState] = useState<{ type: 'view' | 'confirmCheck' | null; report?: Report }>({ type: null });

  const { isSubmitting, performAction } = useReportActions(() => {
    setModalState({ type: null });
    router.refresh();
  });

  const totalPages = Math.ceil(initialData.totalCount / (initialData.limit || 15));

  const openDetailsModal = (report: Report) => {
    setModalState({ type: 'view', report });
  };
  
  return (
    <div className="flex h-full flex-col">
      <ReportTabs  />
      <ReportFilters />
      <div className="flex-grow overflow-y-auto border-t dark:border-gray-700">
        {initialData.reports.length > 0 ? (
          initialData.reports.map(report => (
            <ReportItem key={report.id} report={report} onViewDetails={openDetailsModal} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState text={messages.noReportsFound} />
          </div>
        )}
      </div>

      <Pagination currentPage={initialData.page} totalPages={totalPages} />

      <ReusableModal
        isOpen={modalState.type === 'view'}
        onClose={() => setModalState({ type: null })}
        title={messages.reportDetailsModalTitle}
      >
        {modalState.report && (
          <ReportDetailsModalContent
            reportId={modalState.report.id}
            onCancel={() => setModalState({ type: null })}
            onConfirm={(report) => performAction('markAsChecked', report)}
            isConfirming={isSubmitting}
            isReviewed={isReviewedPage}
          />
        )}
      </ReusableModal>
    </div>
  );
};
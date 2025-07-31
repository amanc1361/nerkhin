"use client";
import React from 'react';
import moment from 'moment-jalaali';
import { Eye } from 'lucide-react';
import { Report } from '@/app/types/report/reportManagement';
import { reportMessages as messages } from '@/app/constants/reportMessages';

interface ReportItemProps {
  report: Report;
  onViewDetails: (report: Report) => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ report, onViewDetails }) => {
  const formattedDate = moment(report.createdAt).format("jYYYY/jMM/jDD");

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-200 p-4 text-sm dark:border-gray-700">
      <span className="col-span-4 truncate" title={report.title}>{report.title || "بدون عنوان"}</span>
      <span className="col-span-5 truncate text-gray-500 dark:text-gray-400" title={report.description}>{report.description}</span>
      <span className="col-span-2 text-gray-500 dark:text-gray-400" dir="ltr">{formattedDate}</span>
      <div className="col-span-1 flex justify-end">
        <button onClick={() => onViewDetails(report)} className="flex items-center gap-1 text-blue-dark hover:text-blue-500 transition-colors" title={messages.viewDetails}>
          <Eye size={18} />
        </button>
      </div>
    </div>
  );
};
export default ReportItem;
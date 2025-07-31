import moment from 'moment-jalaali';
import React from 'react';
import { dashboardMessages } from '@/app/constants/string';

interface DashboardReportItemProps {
  title?: string;
  description?: string;
  createdAt: string | Date;
}

const DashboardReportItem: React.FC<DashboardReportItemProps> = ({ title, description, createdAt }) => {
  const formattedDate = moment(createdAt).format(dashboardMessages.dateFormat);

  return (
    <div className="flex flex-row items-center justify-between text-sm">
      <span className="w-1/3 truncate font-medium text-gray-700 dark:text-gray-300" title={title}>
        {title || 'بدون عنوان'}
      </span>
      <span className="w-1/3 truncate text-gray-500 dark:text-gray-400 text-center" title={description}>
        {description}
      </span>
      <span className="w-1/3 text-left text-gray-500 dark:text-gray-400" dir="ltr">{formattedDate}</span>
    </div>
  );
};

export default DashboardReportItem;
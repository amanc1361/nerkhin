import React from 'react';

interface DashboardProductItemProps {
  title: string;
  children: React.ReactNode; // برای پاس دادن کامپوننت Image
}

const DashboardProductItem: React.FC<DashboardProductItemProps> = ({ title, children }) => {
  return (
    <div className="flex flex-row items-center gap-3">
      <div className="flex-shrink-0">{children}</div>
      <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={title}>
        {title}
      </span>
    </div>
  );
};

export default DashboardProductItem;
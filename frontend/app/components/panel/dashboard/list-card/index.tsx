import Link from "next/link";
import React from "react";
import { dashboardMessages } from "@/app/constants/string";

interface DashboardListCardProps {
  title: string;
  href?: string;
  children: React.ReactNode;
}

const DashboardListCard: React.FC<DashboardListCardProps> = ({ title, href, children }) => {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex-shrink-0">
        <div className="flex flex-row items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
          {href && (
            <Link href={href} className="text-sm font-medium text-blue-dark hover:underline dark:text-blue-400">
              {dashboardMessages.viewAll}
            </Link>
          )}
        </div>
        <hr className="my-2 dark:border-gray-600" />
      </div>
      <div className="flex-grow overflow-y-auto">{children}</div>
    </div>
  );
};

export default DashboardListCard;
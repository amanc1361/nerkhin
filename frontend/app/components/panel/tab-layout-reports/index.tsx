"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react"; // Import React

interface TabInfo {
  order: number;
  label: string;
  href: string;
}

interface ReportTabLayoutProps {
  tabs: TabInfo[];
}

const ReportTabLayout: React.FC<ReportTabLayoutProps> = ({ tabs }) => {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-2 text-center h-full">
      {tabs.map((tabInfo) => (
        <React.Fragment key={tabInfo.order}> {/* Use React.Fragment for mapping */}
          <div
            className={`border-l-1 divide-x-1 divide-gray-200 ${
              pathname === tabInfo.href ? "bg-blue-dark text-white" : ""
            }`}
          >
            <Link href={tabInfo.href}>
              <div className="h-full content-center">
                <span>{tabInfo.label}</span>
              </div>
              <hr />
            </Link>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ReportTabLayout;

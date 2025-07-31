// app/panel/page.tsx
import React, { Suspense } from "react";
import DashboardListCard from "@/app/components/panel/dashboard/list-card";
import { RequestedProductsList, NewUsersList, NewReportsList } from "@/app/components/panel/dashboard/DashboardDataComponents";

import { dashboardMessages } from "@/app/constants/string";

// کامپوننت ساده برای نمایش حالت بارگذاری هر کارت
function CardSkeleton() {
    return (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
           {/* می‌توانید از یک اسپینر کوچک‌تر یا انیمیشن skeleton استفاده کنید */}
           <div className="animate-pulse">بارگذاری...</div>
        </div>
    );
}

// این حالا یک Server Component است
export default function DashboardPage() {
  return (
    <>
      {/* این کامپوننت کلاینت-ساید هیچ UI رندر نمی‌کند و فقط یک کار انجام می‌دهد */}
   

      <div className="flex h-full w-full flex-col gap-4 p-4 text-gray-dark dark:text-gray-300 sm:p-6 VazirFont">
        
        {/* ردیف اول کارت‌ها */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-1/2">
          {/* کالاهای درخواستی */}
          <Suspense fallback={<CardSkeleton />}>
            <DashboardListCard
              title={dashboardMessages.requestedProductsTitle}
              href={dashboardMessages.newProductsLink}
            >
              <RequestedProductsList />
            </DashboardListCard>
          </Suspense>

          {/* کاربران جدید */}
          <Suspense fallback={<CardSkeleton />}>
            <DashboardListCard
              title={dashboardMessages.newUsersTitle}
              href={dashboardMessages.newUsersLink}
            >
              <NewUsersList />
            </DashboardListCard>
          </Suspense>
        </div>

        {/* ردیف دوم کارت‌ها */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-1/2">
          {/* گزارشات تخلفات */}
          <Suspense fallback={<CardSkeleton />}>
            <DashboardListCard
              title={dashboardMessages.reportsTitle}
              href={dashboardMessages.newReportsLink}
            >
              <NewReportsList />
            </DashboardListCard>
          </Suspense>

          {/* تعداد کاربران آنلاین (این کارت استاتیک است و نیازی به Suspense ندارد) */}
          <DashboardListCard title={dashboardMessages.onlineUsersTitle}>
            <div className="flex h-full w-full items-center justify-center text-center">
              <span className="text-5xl font-bold sm:text-6xl">
                {dashboardMessages.onlineUsersCount}
                <span className="text-xl font-medium sm:text-2xl">
                  {" "}{dashboardMessages.onlineUsersUnit}
                </span>
              </span>
            </div>
          </DashboardListCard>
        </div>
      </div>
    </>
  );
}
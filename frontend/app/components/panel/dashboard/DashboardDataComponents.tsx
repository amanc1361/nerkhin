// components/panel/dashboard/DashboardDataComponents.tsx
import 'server-only';
import { getNewReports, getNewUsers, getProductRequests } from 'lib/server/api';
import DashboardProductItem from './product-item';
import DashboardUserItem from './user-item';
import DashboardReportItem from './report-item';
import EmptyState from '@/app/components/empty-state/empty-state';
import { dashboardMessages } from '@/app/constants/string';
import Image from 'next/image';

export async function RequestedProductsList() {
  const products = await getProductRequests();
  return (
    <>
      {products.length > 0 ? (
        products.slice(0, 4).map((product) => (
          <DashboardProductItem key={product.id} title={product.description??""}>
            <Image
              width={40} height={40} alt={dashboardMessages.productRequestImageAlt}
              src="/icons/imageicon/1200px-Picture_icon_BLACK.svg.png" // مسیر صحیح
              className="rounded-md"
            />
          </DashboardProductItem>
        ))
      ) : (
        <div className="flex h-full items-center justify-center p-4">
          <EmptyState text={dashboardMessages.noProductRequests} />
        </div>
      )}
    </>
  );
}

export async function NewUsersList() {
  const users = await getNewUsers();
  return (
    <>
      {users.length > 0 ? (
        users.slice(0, 4).map((user) => (
          <DashboardUserItem key={user.id} {...user} />
        ))
      ) : (
        <div className="flex h-full items-center justify-center p-4">
          <EmptyState text={dashboardMessages.noNewUsers} />
        </div>
      )}
    </>
  );
}

export async function NewReportsList() {
  const reports = await getNewReports();
  return (
    <>
      {reports.length > 0 ? (
        reports.slice(0, 4).map((report) => (
          <DashboardReportItem key={report.id} {...report} />
        ))
      ) : (
        <div className="flex h-full items-center justify-center p-4">
          <EmptyState text={dashboardMessages.noReports} />
        </div>
      )}
    </>
  );
}
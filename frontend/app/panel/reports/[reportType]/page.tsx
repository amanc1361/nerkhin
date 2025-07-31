// مسیر: app/panel/reports/[reportType]/page.tsx
import React, { Suspense } from "react";
import LoadingSpinner from "@/app/components/Loading/Loading";
import { getPaginatedReports } from "lib/server/server-api";
import { ReportManagementClient } from "@/app/components/panel/reports/ReportManagementClient";
import type { PaginatedReportsResponse } from "@/app/types/report/reportManagement";

const ITEMS_PER_PAGE = 20;

/* ───────── کمکی Async برای واکشی داده‌ها ───────── */
interface ReportsDataViewProps {
  reportType: string;
  page: number;
  searchQuery?: string;
}

async function ReportsDataView({
  reportType,
  page,
  searchQuery,
}: ReportsDataViewProps) {
  const filters: Record<string, any> = { page, limit: ITEMS_PER_PAGE };

  if (reportType === "new-reports") filters.state = 1;
  else if (reportType === "checked-reports") filters.state = 2;

  if (searchQuery) filters.searchText = searchQuery;

  const initialData: PaginatedReportsResponse | null =
    await getPaginatedReports(filters);

  if (!initialData) return null;

  return (
    <ReportManagementClient
      initialData={{ ...initialData, page, limit: ITEMS_PER_PAGE }}
      isReviewedPage={reportType === "checked-reports"}
    />
  );
}

/* ───────── صفحهٔ اصلی (Server Component) ───────── */
interface RouteParams {
  reportType: string;
}

export default async function ReportsPage({
  params,
  searchParams,
}: {
  /** مطابق PageProps رسمی: Promise<any> | undefined */
  params?: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  /* هر دو می‌توانند Promise یا شیء ساده باشند → هماهنگ می‌کنیم */
  const p: RouteParams | undefined =
    params && typeof (params as any).then === "function"
      ? await params
      : (params as unknown as RouteParams | undefined);

  const sp =
    searchParams && typeof (searchParams as any).then === "function"
      ? await searchParams
      : (searchParams as unknown as
          | Record<string, string | string[] | undefined>
          | undefined);

  if (!p?.reportType) {
    return <div className="p-4 text-red-500">Invalid route parameters.</div>;
  }

  const page = Number(sp?.page) || 1;
  const searchQuery = sp?.q ? String(sp.q) : undefined;

  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner mode="overlay" />}>
        <ReportsDataView
          reportType={p.reportType}
          page={page}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

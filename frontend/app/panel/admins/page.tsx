// مسیر: app/panel/admins/page.tsx
import React, { Suspense } from "react";
import LoadingSpinner from "@/app/components/Loading/Loading";
import {
  getPaginatedAdmins,
  getCitiesForFiltering,
} from "lib/server/server-api";
import { AdminManagementClient } from "@/app/components/panel/admins/AdminManagementClient";
import type {
  City,
  PaginatedUsersResponse as PaginatedAdminsResponse,
} from "@/app/types/types";

const ITEMS_PER_PAGE = 15;

/* ───── سرور کامپوننت واسط برای واکشی دیتا ───── */
interface AdminDataViewProps {
  page: number;
  searchQuery?: string;
  cityId?: number;
}

async function AdminDataView({
  page,
  searchQuery,
  cityId,
}: AdminDataViewProps) {
  const filters: Record<string, any> = { page, limit: ITEMS_PER_PAGE };
  if (searchQuery) filters.searchText = searchQuery;
  if (cityId) filters.cityId = cityId;

  const [cities, initialData] = await Promise.all([
    getCitiesForFiltering(),
    getPaginatedAdmins(filters),
  ]);

  return (
    <AdminManagementClient
      initialData={{
        ...(initialData as PaginatedAdminsResponse),
        page,
      }}
      allCities={cities as City[]}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  );
}

/* ───── صفحه: Server Component ───── */
export default async function AdminsPage({
  searchParams,
}: {
  /** مطابق PageProps: Promise<any> | undefined */
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  /* در عمل ممکن است object باشد؛ به Promise تبدیل می‌کنیم */
  const params =
    searchParams && typeof (searchParams as any).then === "function"
      ? await searchParams
      : (await Promise.resolve(searchParams)) ?? {};

  const page = Number(params.page) || 1;
  const searchQuery = params.q ? String(params.q) : undefined;
  const cityIdParam = params.cityId;
  const cityId =
    cityIdParam && cityIdParam !== "all" ? Number(cityIdParam) : undefined;

  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner mode="overlay" />}>
        <AdminDataView
          page={page}
          searchQuery={searchQuery}
          cityId={cityId}
        />
      </Suspense>
    </div>
  );
}

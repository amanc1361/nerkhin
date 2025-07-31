import React, { Suspense } from 'react';
import LoadingSpinner from '@/app/components/Loading/Loading';
import { getPaginatedUsers, getCitiesForFiltering } from 'lib/server/server-api';
import { UserManagementClient } from '@/app/components/panel/users/UserManagementClient';
import type { City } from '@/app/types/types';

const ITEMS_PER_PAGE = 20;

type Params = { userType: string };
type SearchParams = { [key: string]: string | string[] | undefined };

interface UserDataViewProps {
  userType: string;
  page: number;
  searchQuery?: string;
  cityId?: number;
}

// Internal async component responsible for fetching data
async function UserDataView({
  userType,
  page,
  searchQuery,
  cityId,
}: UserDataViewProps) {
  const [cities, initialData] = await Promise.all([
    getCitiesForFiltering(),
    getPaginatedUsers({
      page,
      limit: ITEMS_PER_PAGE,
      ...(userType === 'new-users' && { state: 1 }),
      ...(userType === 'wholesalers' && { role: 3 }),
      ...(userType === 'retailers' && { role: 4 }),
      ...(searchQuery && { searchText: searchQuery }),
      ...(cityId && { cityId }),
    }),
  ]);

  return (
    <UserManagementClient
      initialData={{ ...initialData, page }}
      allCities={cities as City[]}
      itemsPerPage={ITEMS_PER_PAGE}
      userType={userType}
    />
  );
}

// Main page component (Server Component)
export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { userType } = await params;
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const searchQuery = typeof sp.q === 'string' ? sp.q : undefined;
  const cityIdParam = sp.cityId;
  const cityId = cityIdParam && cityIdParam !== 'all' ? Number(cityIdParam) : undefined;

  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <UserDataView
          userType={userType}
          page={page}
          searchQuery={searchQuery}
          cityId={cityId}
        />
      </Suspense>
    </div>
  );
}

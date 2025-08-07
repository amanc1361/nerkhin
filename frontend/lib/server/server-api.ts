'use server';

import { getServerSession } from 'next-auth';

import type {
  City,
  User,
  Report,
  ProductRequest,
  PaginatedUsersResponse,
  Brand,
  Model,
} from '@/app/types/types';

import { API_BASE_URL } from '@/app/config/apiConfig';
import { ApiError } from '@/app/services/apiService';
import { PaginatedAdminsResponse } from '@/app/types/admin/adminManagement';
import { Subscription } from '@/app/types/subscription/subscriptionManagement';
import { PaginatedReportsResponse } from '@/app/types/report/reportManagement';
import {
  Category,
  NewBrandFormData,
} from '@/app/types/category/categoryManagement';
import { brandApi, modelApi } from '@/app/services/brandapi';
import { ProductFilterData } from '@/app/types/model/model';
import { authOptions } from './authOptions';

/* --------------------------------------------------
   Helper: build a valid absolute URL
---------------------------------------------------*/
function joinUrl(base: string, path: string): string {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // collapse duplicate slashes except after protocol
  return `${cleanBase}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
}

/* --------------------------------------------------
   PUBLIC FETCH
---------------------------------------------------*/
async function publicFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const envBase = process.env.INTERNAL_GO_API_URL || '';
  if (!envBase.startsWith('http')) {
    throw new Error(
      'INTERNAL_GO_API_URL باید یک URL کامل (با http/https) باشد.'
    );
  }

  const fullUrl = joinUrl(envBase, path);

  try {
    const response = await fetch(fullUrl, { ...options, cache: 'no-store' });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        errorBody.message || 'Public API request failed',
        response.status,
        errorBody
      );
    }
    return response.status === 204 ? (null as any) : response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(
      (error as Error).message || `Public fetch to ${fullUrl} failed.`
    );
  }
}

/* --------------------------------------------------
   AUTHENTICATED FETCH
---------------------------------------------------*/
async function authenticatedFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  if (!token) {
    throw new Error(
      'User is not authenticated for a server-side API request.'
    );
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${token}`);

  if (!API_BASE_URL.startsWith('http')) {
    throw new Error('API_BASE_URL باید یک URL کامل باشد.');
  }
  const fullUrl = path.startsWith('http')
    ? path
    : joinUrl(API_BASE_URL, path);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to parse API error response' }));
      const apiError: ApiError = {
        name: 'ApiError',
        message: errorData.message || 'API request failed',
        status: response.status,
        data: errorData,
      };
      throw apiError;
    }

    return response.status === 204 ? (null as any) : response.json();
  } catch (error) {
    if ((error as ApiError).name === 'ApiError') throw error;
    console.error(
      `Network or unexpected error in server-side fetch for url ${fullUrl}:`,
      error
    );
    throw new Error('An unexpected server-side network error occurred.');
  }
}

/* --------------------------------------------------
   SPECIFIC DATA FETCHING FUNCTIONS
---------------------------------------------------*/

export async function getCitiesForFiltering(): Promise<City[]> {
  return publicFetch('/city/fetch-all', { method: 'GET' });
}

export async function getPaginatedUsers(
  filters: Record<string, any>
): Promise<PaginatedUsersResponse> {
  return authenticatedFetch('/user/fetch-users', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}

export async function getNewUsersForDashboard(): Promise<User[]> {
  return authenticatedFetch('/user/fetch-users', {
    method: 'POST',
    body: JSON.stringify({ state: 1 }),
  });
}

export async function getProductRequestsForDashboard(): Promise<
  ProductRequest[]
> {
  const allRequests = await authenticatedFetch<ProductRequest[]>(
    '/product-request/fetch-all',
    { method: 'GET' }
  );
  return Array.isArray(allRequests)
    ? allRequests.filter((p) => p.state === 0)
    : [];
}

export async function getPaginatedAdmins(
  filters: Record<string, any>
): Promise<PaginatedAdminsResponse> {
  return authenticatedFetch('/user/fetch-users', {
    method: 'POST',
    body: JSON.stringify({ role: 2, ...filters }),
  });
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  return authenticatedFetch('/subscription/fetch-all', { method: 'GET' });
}

export async function getPaginatedReports(
  filters: Record<string, any>
): Promise<PaginatedReportsResponse> {
  return authenticatedFetch('/report/fetch-reports', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}

export async function getAllCategories(): Promise<Category[]> {
  return authenticatedFetch('/product-category/fetch-main-categories', {
    method: 'GET',
  });
}

export async function getBrandDetails(id: string | number): Promise<Brand> {
  return authenticatedFetch(brandApi.getById(id).url, { method: 'GET' });
}

export async function getModelsByBrand(
  brandId: string | number
): Promise<Model[]> {
  return authenticatedFetch(modelApi.getByBrand(brandId).url, {
    method: 'GET',
  });
}

export async function getFiltersByCategory(
  categoryId: string | number
): Promise<ProductFilterData[]> {
  const response = await authenticatedFetch<{
    productFilters?: ProductFilterData[];
  }>(`/product-filter/fetch-all/${categoryId}`, { method: 'GET' });

  if (response && Array.isArray(response.productFilters)) {
    return response.productFilters;
  }
  console.warn(
    'API response for filters did not have the expected structure.',
    response
  );
  return [];
}

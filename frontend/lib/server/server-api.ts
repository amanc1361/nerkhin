'use server';

import { getServerSession } from 'next-auth';
import type {
  City,
  User,
  ProductRequest,
  PaginatedUsersResponse,
  Brand,
  Model,
} from '@/app/types/types';

import { API_BASE_URL } from '@/app/config/apiConfig';
import { ApiError } from '@/app/services/apiService';
import {
  PaginatedAdminsResponse,
} from '@/app/types/admin/adminManagement';
import { Subscription } from '@/app/types/subscription/subscriptionManagement';
import {
  PaginatedReportsResponse,
} from '@/app/types/report/reportManagement';
import { Category } from '@/app/types/category/categoryManagement';
import { brandApi, modelApi } from '@/app/services/brandapi';
import { ProductFilterData } from '@/app/types/model/model';
import { authOptions } from './authOptions';

/* ---------- helper ---------- */
function joinUrl(base: string, path: string) {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
}

/* ---------- public fetch ---------- */
async function publicFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const envBase = process.env.INTERNAL_GO_API_URL || '';
  const fullUrl = joinUrl(envBase, path);

  const res = await fetch(fullUrl, { ...options, cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || 'Public API request failed', res.status, body);
  }
  return res.status === 204 ? (null as any) : res.json();
}

/* ---------- authenticated fetch ---------- */
async function authenticatedFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) throw new Error('Not authenticated');

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  /*  🟢 NEW: Resolve ROOT_BASE whether API_BASE_URL is absolute or relative  */
  const rootBase = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : joinUrl(process.env.INTERNAL_GO_API_URL || '', API_BASE_URL);

  const fullUrl = path.startsWith('http') ? path : joinUrl(rootBase, path);

  const res = await fetch(fullUrl, { ...options, headers, cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const apiErr: ApiError = {
      name: 'ApiError',
      message: body.message || 'API request failed',
      status: res.status,
      data: body,
    };
    throw apiErr;
  }
  return res.status === 204 ? (null as any) : res.json();
}

/* ---------- specific calls (unchanged) ---------- */

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

export async function getProductRequestsForDashboard(): Promise<ProductRequest[]> {
  const list = await authenticatedFetch<ProductRequest[]>(
    '/product-request/fetch-all',
    { method: 'GET' }
  );
  return Array.isArray(list) ? list.filter(p => p.state === 0) : [];
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
  return authenticatedFetch(modelApi.getByBrand(brandId).url, { method: 'GET' });
}

export async function getFiltersByCategory(
  categoryId: string | number
): Promise<ProductFilterData[]> {
  const res = await authenticatedFetch<{ productFilters?: ProductFilterData[] }>(
    `/product-filter/fetch-all/${categoryId}`,
    { method: 'GET' }
  );
  return Array.isArray(res.productFilters) ? res.productFilters : [];
}

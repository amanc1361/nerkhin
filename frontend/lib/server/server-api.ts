'use server'

import { getServerSession } from 'next-auth';

import type { 
  City, 
  User, 
  Report, 
  ProductRequest, 
  PaginatedUsersResponse, 
  Brand,
  Model
} from '@/app/types/types'; // مسیر به فایل تایپ‌های شما

import { API_BASE_URL } from '@/app/config/apiConfig';
import { ApiError } from '@/app/services/apiService';
import { PaginatedAdminsResponse } from '@/app/types/admin/adminManagement';
import { Subscription } from '@/app/types/subscription/subscriptionManagement';
import { PaginatedReportsResponse } from '@/app/types/report/reportManagement';
import { Category, NewBrandFormData } from '@/app/types/category/categoryManagement';
import { brandApi,  modelApi } from '@/app/services/brandapi';
import { ProductFilterData } from '@/app/types/model/model';
import { authOptions } from './authOptions';

// فایل: lib/server-api.ts
async function publicFetch(path: string, options: RequestInit = {}) {
  const fullUrl = `${process.env.INTERNAL_GO_API_URL}${path}`;
  try {
    const response = await fetch(fullUrl, { ...options, cache: 'no-store' });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(errorBody.message || 'Public API request failed', response.status, errorBody);
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error((error as Error).message || `Public fetch to ${fullUrl} failed.`);
  }
}

// Helper for AUTHENTICATED API calls


// --- Specific Data Fetching Functions ---

// getCitiesForFiltering now uses the public fetcher
export async function getCitiesForFiltering(): Promise<City[]> {
  return publicFetch('/city/fetch-all', { method: 'GET' });
}
async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    throw new Error("User is not authenticated for a server-side API request.");
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${token}`);

  const fullUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      cache: 'no-store', 
    });
    const responseForLogging = response.clone();
    const rawText = await responseForLogging.text();
    console.log(`\n--- RAW RESPONSE FROM GO SERVER for path: ${path} ---`);
    console.log(rawText);
    console.log("--- END RAW RESPONSE ---\n");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse API error response' }));
      console.error(`Server-side API Error to ${fullUrl}:`, { status: response.status, data: errorData });
      const apiError: ApiError = {
          name: 'ApiError',
          message: errorData.message || 'API request failed',
          status: response.status,
          data: errorData,
      };
      throw apiError;
    }
    
    if (response.status === 204) {
      return null;
    }
    return response.json();

  } catch (error) {
    if ((error as ApiError).name === 'ApiError') throw error;
    console.error(`Network or unexpected error in server-side fetch for url ${fullUrl}:`, error);
    throw new Error("An unexpected server-side network error occurred.");
  }
}


export async function getPaginatedUsers(filters: { [key: string]: any }): Promise<PaginatedUsersResponse> {

  return authenticatedFetch('/user/fetch-users', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}


export async function getNewUsersForDashboard(): Promise<User[]> {
  return authenticatedFetch('/user/fetch-users', {
    method: 'POST',
    body: JSON.stringify({ state: 1 }), // state: 1 برای کاربران جدید
  });
}

/**
 * دریافت لیست کالاهای درخواستی برای داشبورد.
 */
export async function getProductRequestsForDashboard(): Promise<ProductRequest[]> {
  const allRequests = await authenticatedFetch('/product-request/fetch-all', { method: 'GET' });
  // فیلتر کردن در سمت سرور Next.js انجام می‌شود
  if (!Array.isArray(allRequests)) return [];
  return allRequests.filter(product => product.state === 0);
}

export async function getPaginatedAdmins(filters: { [key: string]: any }): Promise<PaginatedAdminsResponse> {
  const finalFilters = {
    role: 2, // Hardcode role for admins
    ...filters,
  };
  return authenticatedFetch('/user/fetch-users', {
    method: 'POST',
    body: JSON.stringify(finalFilters),
  });
}
export async function getAllSubscriptions(): Promise<Subscription[]> {
  return authenticatedFetch('/subscription/fetch-all', { method: 'GET' });
}
export async function getPaginatedReports(filters: { [key: string]: any }): Promise<PaginatedReportsResponse> {
  return authenticatedFetch('/report/fetch-reports', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}
export async function getAllCategories(): Promise<Category[]> {

  return authenticatedFetch('/product-category/fetch-main-categories', { method: 'GET' });
}
export async function getBrandDetails(id: string | number): Promise<Brand> {
  // فرض بر این است که شما یک تابع عمومی برای fetch احرازهویت شده دارید
  return authenticatedFetch(brandApi.getById(id).url, { method: 'GET' });
}

export async function getModelsByBrand(brandId: string | number): Promise<Model[]> {
  return authenticatedFetch(modelApi.getByBrand(brandId).url, { method: 'GET' });
}



export async function getFiltersByCategory(categoryId: string | number): Promise<ProductFilterData[]> {
  const response = await authenticatedFetch(`/product-filter/fetch-all/${categoryId}`, { method: 'GET' });

  // بررسی می‌کنیم که آیا پاسخ دریافتی دارای پراپرتی productFilters است و آیا آن یک آرایه است
  if (response && Array.isArray(response.productFilters)) {
    return response.productFilters;
  }
  
  // اگر ساختار پاسخ صحیح نبود، یک آرایه خالی برمی‌گردانیم تا از بروز خطا جلوگیری شود
  console.warn("API response for filters did not have the expected structure.", response);
  return [];
}



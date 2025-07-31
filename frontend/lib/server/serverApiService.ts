// فایل: lib/server/serverApiService.ts
import 'server-only'; // این اطمینان می‌دهد که این کد فقط در سرور ایمپورت می‌شود
import { getServerSession } from 'next-auth';

import { API_BASE_URL } from '@/app/config/apiConfig'; // مسیر صحیح به کانفیگ شما
import { authOptions } from './authOptions';


// این یک نسخه بسیار ساده شده از baseFetch است که فقط برای سرور کار می‌کند
async function serverFetch(
  url: string,
  options: RequestInit = {}
) {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // در سمت سرور، می‌توانیم خطای دقیق‌تری را لاگ بگیریم
    const errorBody = await response.text();
    console.error(`Server-side API Error to ${fullUrl}:`, {
        status: response.status,
        body: errorBody,
    });
    // و یک خطای عمومی‌تر پرتاب کنیم تا به Error Boundary در Next.js برسد
    throw new Error(`API request failed with status ${response.status}`);
  }

  // اگر پاسخ بدنه ندارد (مثلاً status 204)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
}

// آبجکتی مشابه apiService برای استفاده در سرور
export const serverApiService = {
  get: <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    return serverFetch(url, { ...options, method: 'GET' });
  },
  post: <T = any>(url: string, body: Record<string, any>, options: RequestInit = {}): Promise<T> => {
    return serverFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) });
  },
  // می‌توانید متدهای put و delete را هم به همین شکل اضافه کنید
};
// فایل: lib/server/api.ts (اصلاح شده)
import 'server-only';
import { serverApiService } from './serverApiService'; // <--- ایمپورت کلاینت API جدید
import type { Report, User, ProductRequest } from '@/app/types/types'; // مسیر به تایپ‌های شما
import { FetchReportsByFilterResponse, ReportViewModel } from '@/app/types/report/reportManagement';

// --- توابع دریافت داده برای داشبورد (با استفاده از serverApiService) ---

// export async function getNewReports(): Promise<Report[]> {
//   // state: 1 برای گزارش‌های جدید
//   return serverApiService.post<Report[]>('/report/fetch-reports', { state: 1 });
// }

export async function getNewUsers(): Promise<User[]> {
  // state: 1 برای کاربران جدید
  return serverApiService.post<User[]>('/user/fetch-users', { state: 1 });
}

export async function getNewReports(
  limit = 4
): Promise<ReportViewModel[]> {
  const body = {
    state: 1,       // فقط گزارش‌های جدید
    searchText: '', // جستجو نداریم
    page: 1,
    limit,
  };

  const { reports } =
    await serverApiService.post<FetchReportsByFilterResponse>(
      '/report/fetch-reports',
      body
    );

  return reports;
}
export async function getProductRequests(): Promise<ProductRequest[]> {
  const allRequests = await serverApiService.get<ProductRequest[]>('/product-request/fetch-all');
  // فیلتر کردن در اینجا، سمت سرور
  return allRequests.filter(product => product.state === 0);
}
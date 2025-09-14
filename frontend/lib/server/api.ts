// فایل: lib/server/api.ts (اصلاح شده)
import 'server-only';
import { serverApiService } from './serverApiService'; // <--- ایمپورت کلاینت API جدید
import type {  ProductRequest, UserViewModel, FetchUsersByFilterResponse } from '@/app/types/types'; // مسیر به تایپ‌های شما
import { FetchReportsByFilterResponse, ReportViewModel } from '@/app/types/report/reportManagement';


export async function getNewUsers(
  limit = 4
): Promise<UserViewModel[]> {
  const body = {
    state: 1,       // فقط کاربران جدید
    searchText: '', // جستجو نمی‌خواهیم
    page: 1,
    limit,
  };

  const { users } =
    await serverApiService.post<FetchUsersByFilterResponse>(
      '/user/fetch-users',
      body
    );

  return users;
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
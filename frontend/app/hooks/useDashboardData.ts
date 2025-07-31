// hooks/useDashboardData.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getNewReportsAPI } from '@/app/services/report'; // مسیرهای صحیح

import { getProductRequestsAPI } from '@/app/services/products';
import { dashboardMessages } from '@/app/constants/string'; // مسیر صحیح
import { ApiError } from '@/app/services/apiService'; // مسیر صحیح
import { User,Report,ProductRequest } from '@/app/types/types';


interface DashboardData {
  reports: Report[];
  newUsers: User[];
  productRequests: ProductRequest[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void; // برای امکان بارگذاری مجدد داده‌ها
}

export const useDashboardData = (): DashboardData => {
  const [reports, setReports] = useState<Report[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // شروع با true برای بارگذاری اولیه
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // استفاده از Promise.allSettled برای اجرای همزمان و مدیریت خطای هر کدام به صورت جداگانه
      const results = await Promise.allSettled([
        getNewReportsAPI({ state: 1 }), // state: 1 برای گزارش‌های جدید (مطابق کد اصلی شما)
    
        getProductRequestsAPI(),
      ]);

      if (results[0].status === 'fulfilled') {
        setReports(results[0].value as Report[]);
      } else {
        console.error("Error fetching reports:", results[0].reason);
        // می‌توانید خطای خاص هر بخش را نیز در state ذخیره کنید اگر لازم است
      }


      // بررسی کلی برای نمایش یک پیام خطا اگر هر کدام از درخواست‌ها ناموفق بود
      if (results.some(r => r.status === 'rejected')) {
          const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
          if (firstError && firstError.reason instanceof ApiError) {
            toast.error(firstError.reason.message || dashboardMessages.dataFetchError);
          } else if (firstError) {
            toast.error((firstError.reason as Error)?.message || dashboardMessages.dataFetchError);
          } else {
            toast.error(dashboardMessages.dataFetchError);
          }
      }

    } catch (generalError) { // این catch برای خطاهای پیش‌بینی نشده در خود Promise.allSettled است
      console.error("General error in fetchData:", generalError);
      toast.error(dashboardMessages.dataFetchError);
      setError(dashboardMessages.dataFetchError);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback بدون وابستگی چون توابع API خارجی هستند و تغییر نمی‌کنند

  useEffect(() => {
    fetchData();
  }, [fetchData]); // اجرای fetchData هنگام mount شدن

  return {
    reports,
    newUsers,
    productRequests,
    isLoading,
    error,
    refreshData: fetchData, // تابع برای بارگذاری مجدد دستی
  };
};
// فایل: services/cityApi.ts
import {  NewCityFormData } from '@/app/types/types'; // مسیر صحیح به تایپ‌ها

// این آبجکت، ساختار درخواست‌های API را تعریف می‌کند و توسط هوک useAuthenticatedApi استفاده می‌شود
export const cityApi = {
  getAllCity: () => ({
    url: '/city/fetch-all', // Endpoint شما برای دریافت همه شهرها
    method: 'get' as const, // استفاده از const برای تایپ دقیق‌تر
  }),
  create: (cityData: NewCityFormData) => ({
    url: '/city/create',
    method: 'post' as const,
    body: cityData,
  }),
  delete: (cityIds: Array<number | string>) => ({
    url: '/city/batch-delete', // Endpoint شما برای حذف
    method: 'post' as const, // یا 'delete' اگر API شما پشتیبانی می‌کند
    body: { ids: cityIds },
  }),
};

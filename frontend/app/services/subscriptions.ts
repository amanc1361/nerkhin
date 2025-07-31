// فرض کنید apiService.ts در مسیر ../apiService یا مشابه قرار دارد.
// و اینترفیس‌ها از فایل types.ts یا subscriptionTypes.ts ایمپورت شده‌اند.
import apiService from '../services/apiService';
import {
  Subscription,
  Transaction,
  SubscriptionCreationPayload,
  SubscriptionUpdatePayload,
  // SuccessResponse, // اگر برای create/update پاسخ موفقیت‌آمیز برمی‌گردد
} from '../types/types'; // مسیر به فایل اینترفیس‌ها را تنظیم کنید

// --- توابع سرویس بازنویسی شده ---

/**
 * ایجاد یک اشتراک جدید برای کاربر.
 * @param payload داده‌های لازم برای ایجاد اشتراک.
 * @returns Promise با آبجکت اشتراک ایجاد شده (یا پاسخ موفقیت‌آمیز).
 */
export const createSubscription = (payload: SubscriptionCreationPayload): Promise<Subscription> => {
  // اگر API فقط پیام موفقیت برمی‌گرداند، نوع بازگشتی را به SuccessResponse تغییر دهید
  return apiService.post<Subscription>({
    url: '/subscription/create',
    body: { newSubscription: payload }, // ساختار بدنه مطابق کد اصلی شما { newSubscription: data }
 
  });
};

/**
 * دریافت لیست تمام اشتراک‌ها (معمولاً برای ادمین یا بر اساس کاربر احراز هویت شده).
 * @returns Promise با آرایه‌ای از اشتراک‌ها.
 */
export const getAllSubscriptions = (): Promise<Subscription[]> => {
  return apiService.get<Subscription[]>({
    url: '/subscription/fetch-all',

  });
};

/**
 * به‌روزرسانی یک اشتراک موجود.
 * @param payload داده‌های لازم برای به‌روزرسانی اشتراک (شامل id اشتراک).
 * @returns Promise با آبجکت اشتراک آپدیت شده (یا پاسخ موفقیت‌آمیز).
 */
export const updateSubscription = (payload: SubscriptionUpdatePayload): Promise<Subscription> => {
  
  return apiService.put<Subscription>({ // از put استفاده شده، اگر API شما POST انتظار دارد، تغییر دهید
    url: '/subscription/fetch-all', // URL مشکوک برای آپدیت!
    body: { data: payload }, // ساختار بدنه مطابق کد اصلی شما { data }
   
  });
};

/**
 * دریافت لیست اشتراک‌ها بر اساس شناسه شهر.
 * API شما برای این عملیات از POST استفاده می‌کند.
 * @param cityId شناسه شهر.
 * @returns Promise با آرایه‌ای از اشتراک‌های مربوط به آن شهر.
 */
export const getSubscriptionsByCity = (cityId: number): Promise<Subscription[]> => {
  return apiService.post<Subscription[]>({
    url: '/subscription/fetch-subscriptions',
    // نکته: در کد اصلی شما کلید 'cityid' (با d کوچک) بود. من همان را حفظ کرده‌ام.
    // بررسی کنید که آیا این عمدی است یا باید 'cityId' باشد.
    body: { cityid: cityId },

  });
};

/**
 * دریافت تاریخچه تراکنش‌های مالی کاربر (معمولاً کاربر احراز هویت شده).
 * @returns Promise با آرایه‌ای از تراکنش‌ها.
 */
export const getTransactionsHistory = (): Promise<Transaction[]> => {
  return apiService.get<Transaction[]>({
    url: '/user-subscription/fetch-payment-transactions',

  });
};

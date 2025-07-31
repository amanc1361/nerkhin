
import apiService from '../services/apiService'; // یا مثلا './apiService'


export interface PaymentGatewayInfoResponse {
  redirectUrl?: string; // URL درگاه پرداخت برای هدایت کاربر
  paymentId?: string;   // شناسه پرداخت برای پیگیری
  formParameters?: Record<string, string | number>; // اگر نیاز به ارسال فرم به درگاه باشد
  message?: string;     // پیام از سمت سرور
  // ... سایر اطلاعات مورد نیاز برای شروع فرآیند پرداخت
}

// مثال برای جزئیات یک اشتراک
export interface SubscriptionDetails {
  id: string | number;
  userId: string | number;
  planName: string; // یا planId
  status: 'active' | 'pending_payment' | 'cancelled' | 'expired';
  startDate: string; // تاریخ شروع به فرمت ISO (e.g., "2023-10-26T10:00:00Z")
  endDate: string;   // تاریخ پایان به فرمت ISO
  // ... سایر جزئیات اشتراک
}


export interface CreateSubscriptionResponse {
  success: boolean;
  message?: string;
  subscription?: SubscriptionDetails; // جزئیات اشتراک ایجاد یا فعال شده
}



/**
 * دریافت اطلاعات و پارامترهای لازم برای هدایت کاربر به درگاه پرداخت.
 * @param cityId شناسه شهر.
 * @param subscriptionId شناسه طرح اشتراک انتخاب شده.
 * @param callbackUrl آدرس بازگشت پس از عملیات پرداخت.
 * @returns Promise با اطلاعات درگاه پرداخت.
 */
export const getPaymentGatewayInfo = (
  cityId: number,
  subscriptionId: number,
  callbackUrl: string,
): Promise<PaymentGatewayInfoResponse> => {
  // نوع پاسخ را با توجه به API خود تنظیم کنید
  return apiService.post<PaymentGatewayInfoResponse>({
    url: '/user-subscription/fetch-payment-gateway-info',
    body: { cityId, subscriptionId, callbackUrl },
  
  });
};

/**
 * ایجاد یا تایید اشتراک کاربر پس از بازگشت موفق از درگاه پرداخت.
 * @param authority شناسه یا کد مرجع از درگاه پرداخت (معمولاً پس از پرداخت موفق).
 * @returns Promise با نتیجه عملیات ایجاد اشتراک.
 */
export const createSubscription = (
  authority: string, // یا هر پارامتر دیگری که از درگاه برمی‌گردد و برای تایید لازم است
): Promise<CreateSubscriptionResponse> => {
  // نوع پاسخ را با توجه به API خود تنظیم کنید
  return apiService.post<CreateSubscriptionResponse>({
    url: '/user-subscription/create',
    body: { authority },
   
  });
};


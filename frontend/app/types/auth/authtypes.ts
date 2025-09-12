// اینترفیس‌های مثال - آن‌ها را با ساختار واقعی API خود تطبیق دهید

// برای پاسخ اولیه درخواست ورود (مثلاً ارسال کد)
export interface SignInInitiateResponse {
  success: boolean;
  message?: string;
  // ممکن است شامل داده‌های دیگری برای مرحله بعد باشد
}

// برای پاسخ اولیه درخواست ثبت نام (مثلاً ارسال کد یا ایجاد کاربر غیرفعال)
export interface SignUpResponse {
  success: boolean;
  message?: string;
  userId?:  number; // اگر کاربر ایجاد می‌شود اما نیاز به تایید دارد
}

// اطلاعات کاربر که پس از تایید کد و لاگین موفق برگردانده می‌شود
export interface UserAuthData {
  id: string | number;
  phone: string;
  fullName?: string;
  role?: string | number; // یا هر نوع دیگری که برای نقش دارید
  cityId?: number;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | null;
  // ... سایر اطلاعات کاربر
}



export interface VerifyCodeApiResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number; // <--- اضافه شد: زمان انقضا به صورت Unix Timestamp (ثانیه)
  user: UserAuthData;
  message?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | null;
}

// پاسخ مورد انتظار از endpoint بازآوری توکن (/auth/refresh-token)
export interface RefreshTokenApiResponse {
  accessToken: string;
  accessTokenExpiresAt: number; // <--- اضافه شد
  user: UserAuthData;
  message?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | null;
}

// --- دیگر نیازی به DecodedAccessTokenPayload نداریم و می‌توانید آن را حذف کنید ---
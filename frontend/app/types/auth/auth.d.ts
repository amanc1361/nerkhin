
// فایل: types/auth.d.ts (یا هر فایل مرکزی دیگری برای تایپ‌ها)

export interface DecodedPasetoPayload {
  jti: string; // شناسه توکن
  userId: number | string; // شناسه کاربر
  userRole: number | string; // نقش کاربر (مثلاً 1, 2 برای ادمین؛ 3, 4 برای کاربر عادی)
  type: 'access' | 'refresh'; // برای تشخیص نوع توکن (اگر در یک توکن استفاده شود)
  exp?: number; // زمان انقضا (Unix timestamp)
  iat?: number; // زمان صدور (Unix timestamp)
  nbf?:number;
  // ... هر فیلد دیگری که در پی‌لود توکن Paseto خود دارید
}
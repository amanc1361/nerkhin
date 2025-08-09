import { absApiUrl } from "@/app/utils/absurl";






/** ساخت URL کامل متناسب با محیط (در absApiUrl) */
export { absApiUrl };

/** مسیر ثابت رفرش توکن */
export const REFRESH_TOKEN_API_PATH = "/auth/refresh-token";

// app/config/apiConfig.ts
/** 
 * از env می‌خوانیم؛ اگر نبود، پیش‌فرض امن = "/api/go"
 * مطلقاً به "/api/auth" دیفالت نکن.
 */
export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/go").replace(/\/+$/, ""); // حذف اسلش انتهایی

/**
 * فقط روی سرور استفاده می‌شود (Next.js server یا Route Handler)
 * مثال درست شما: "http://nerkhin-backend:8084/api/go"
 */
export const INTERNAL_GO_API_URL =
  (process.env.INTERNAL_GO_API_URL || "").replace(/\/+$/, "");

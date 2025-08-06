import { absApiUrl } from "@/app/utils/absurl";

/** مسیر نسبیِ ثابت برای تمام fetch‌های کلاینت */
//export const API_BASE_URL = "/api";

/** آدرس کامل برای SSR/Node؛ در absApiUrl استفاده می‌شود */
export const API_BASE_URL = "https://nerkhin.com/api/go";


export const INTERNAL_GO_API_URL =
  process.env.INTERNAL_GO_API_URL || "https://nerkhin.com/api";

/** ساخت URL کامل (کلاینت یا سرور) */
export { absApiUrl };

/** مسیر ثابت رفرش توکن (بدون تغییر) */
export const REFRESH_TOKEN_API_PATH = "/auth/refresh-token";

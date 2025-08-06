import { absApiUrl } from "@/app/utils/absurl";

/** مسیر نسبی ثابت برای مرورگر */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/api/go";

/** آدرس داخلی برای SSR / authorize */
export const INTERNAL_GO_API_URL =
  process.env.INTERNAL_GO_API_URL?.replace(/\/$/, "") || "http://nerkhin-backend:8084/api";

/** ساخت URL کامل متناسب با محیط (در absApiUrl) */
export { absApiUrl };

/** مسیر ثابت رفرش توکن */
export const REFRESH_TOKEN_API_PATH = "/auth/refresh-token";

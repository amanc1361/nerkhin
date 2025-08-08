import { absApiUrl } from "@/app/utils/absurl";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/api/go";

export const INTERNAL_GO_API_URL =
  process.env.INTERNAL_GO_API_URL?.replace(/\/$/, "") ||
  "http://nerkhin-backend:8084/api/go";




/** ساخت URL کامل متناسب با محیط (در absApiUrl) */
export { absApiUrl };

/** مسیر ثابت رفرش توکن */
export const REFRESH_TOKEN_API_PATH = "/auth/refresh-token";

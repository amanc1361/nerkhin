// فایل: services/apiService.ts (نسخه نهایی و ساده شده برای NextAuth.js)
"use client";


import { API_BASE_URL } from "@/app/config/apiConfig"; // ایمپورت API_BASE_URL

// --- Custom Error Class (بدون تغییر) ---
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// --- اینترفیس‌ها و تایپ‌های پایه ---
// اینها می‌توانند ساده‌تر شوند چون دیگر نیازی به sendCredentials به این شکل نداریم
// توکن به صورت دستی پاس داده می‌شود.
export interface RequestProps {
  url: string;
  token?: string; // <--- توکن به عنوان پارامتر ورودی اضافه می‌شود
  params?: Record<string, any>;
  customHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

export interface GetRequestProps extends RequestProps {}

export interface MutateRequestProps extends RequestProps {
  body: Record<string, any> | FormData;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// --- تابع baseFetch بسیار ساده‌تر شده ---
async function baseFetch<T_ResponseData>(
  method: HttpMethod,
  props: RequestProps & { body?: Record<string, any> | FormData }
): Promise<T_ResponseData> {
  const { url, token, params, body, customHeaders = {}, signal } = props;

  const headers = new Headers({
    Accept: "application/json",
    ...customHeaders,
  });

  // اگر توکن پاس داده شده، آن را به هدر Authorization اضافه کن
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // API_BASE_URL باید به مسیر پروکسی شما (/api) یا آدرس کامل سرور Go اشاره کند
  let fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  if (params) {
    fullUrl += `?${new URLSearchParams(params).toString()}`;
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      signal,
    });

    if (!response.ok) {
      // اگر پاسخ خطا بود، سعی کن پیام خطا را از بدنه JSON بخوان و یک ApiError پرتاب کن
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // اگر بدنه پاسخ JSON نبود
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T_ResponseData;
    }

    return response.json() as Promise<T_ResponseData>;
  } catch (error) {
    // خطاهای شبکه یا خطاهای پرتاب شده از بلوک بالا را مدیریت کن
    if (error instanceof ApiError) {
      // toast.error(error.message); // می‌توانید نمایش خطا را به محل فراخوانی منتقل کنید
      throw error; // خطای ApiError را دوباره پرتاب کن
    }
    
    console.error("Network or unexpected error in apiService:", error);
    // toast.error("یک خطای شبکه رخ داد.");
    throw new ApiError(
      (error as Error).message || "An unexpected network error occurred",
      0 // status 0 برای خطاهای شبکه
    );
  }
}

// --- آبجکت Export شده (ساده‌تر شده) ---
export const apiService = {
  get: <T_ResponseData = any>(props: GetRequestProps): Promise<T_ResponseData> => {
    return baseFetch<T_ResponseData>("GET", props);
  },
  post: <T_ResponseData = any>(props: MutateRequestProps): Promise<T_ResponseData> => {
    return baseFetch<T_ResponseData>("POST", props);
  },
  put: <T_ResponseData = any>(props: MutateRequestProps): Promise<T_ResponseData> => {
    return baseFetch<T_ResponseData>("PUT", props);
  },
  delete: <T_ResponseData = any>(props: RequestProps): Promise<T_ResponseData> => {
    return baseFetch<T_ResponseData>("DELETE", props);
  },
};

export default apiService;
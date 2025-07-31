// مسیر: hooks/useAuthenticatedApi.ts
"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

import {
  apiService,
  GetRequestProps,
  MutateRequestProps,
  RequestProps,
} from "@/app/services/apiService";

/**
 * Wrapper یکدست برای فراخوانی‌های امن.
 * متد ویژهٔ `postMultipart` برای ارسال FormData اضافه شده است.
 */
export const useAuthenticatedApi = () => {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  /* اگر کاربر لاگین نیست، خطای واحد برگردان */
  const unauthenticatedError = () =>
    Promise.reject(new Error("User not authenticated."));

  const api = useMemo(() => {
    return {
      /* ---------- متدهای JSON معمولی ---------- */

      get: <T = any>(
        props: Omit<GetRequestProps, "token">
      ): Promise<T> => {
        if (!accessToken) return unauthenticatedError();
        return apiService.get<T>({ ...props, token: accessToken });
      },

      post: <T = any>(
        props: Omit<MutateRequestProps, "token">
      ): Promise<T> => {
        if (!accessToken) return unauthenticatedError();
        return apiService.post<T>({ ...props, token: accessToken });
      },

      put: <T = any>(
        props: Omit<MutateRequestProps, "token">
      ): Promise<T> => {
        if (!accessToken) return unauthenticatedError();
        return apiService.put<T>({ ...props, token: accessToken });
      },

      delete: <T = any>(
        props: Omit<RequestProps, "token">
      ): Promise<T> => {
        if (!accessToken) return unauthenticatedError();
        return apiService.delete<T>({ ...props, token: accessToken });
      },

      /* ---------- متد مخصوص فایل (multipart/form-data) ---------- */

      /**
       * ارسال FormData (مثلاً تصاویر + فیلد متنی `data`) به بک‌اند
       * @param url  آدرس کامل یا نسبی (نسبت به API_BASE_URL)
       * @param fd   شیء FormData
       */
      postMultipart: <T = any>(
        url: string,
        fd: FormData
      ): Promise<T> => {
        if (!accessToken) return unauthenticatedError();
        // apiService.post بدنهٔ FormData را می‌پذیرد و هِدِر Content-Type را نمی‌گذارد
        return apiService.post<T>({
          url,
          token: accessToken,
          body: fd,
        });
      },
    };
  }, [accessToken]);

  return {
    api,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
};

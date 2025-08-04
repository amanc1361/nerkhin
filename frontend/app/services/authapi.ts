import { API_BASE_URL } from "@/app/config/apiConfig";
import { RefreshTokenApiResponse, SignUpResponse, VerifyCodeApiResponse } from "@/app/types/auth/authtypes";

export interface SignUpFormData {
  phone: string;
  cityId: number;
  role: number;
  fullName: string;
}


export async function initiateSignInAPI(phone: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to initiate sign in');
  }
  
  return response.json();
}

/**
 * [برای NextAuth.js] - ارسال درخواست ثبت نام کاربر جدید به سرور Go.
 * @param data داده‌های فرم ثبت نام.
 */
export async function userSignUpAPI(data: SignUpFormData): Promise<SignUpResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, { // استفاده از endpoint صحیح /register
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
   
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to sign up user');
  }
  
  return response.json();
}

/**
 * [برای NextAuth.js] - ارسال کد تایید به سرور Go برای دریافت توکن‌ها.
 * این تابع از داخل تابع authorize در NextAuth.js فراخوانی می‌شود.
 * @param phone شماره تلفن.
 * @param code کد تایید.
 */
export async function verifyCodeAPI(
  phone: string,
  code: string
): Promise<VerifyCodeApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // سعی در خواندن پیام خطای سرور Go
    throw new Error(errorData.message || 'Verification failed');
  }

  // پاسخ موفقیت‌آمیز را که شامل accessToken, refreshToken, و user است، برمی‌گرداند.
  return response.json();
}

export async function refreshAccessTokenAPI(refreshToken: string): Promise<RefreshTokenApiResponse> {
 
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to refresh access token');
  }


  return response.json();
}




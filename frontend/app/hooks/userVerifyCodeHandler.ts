// hooks/useVerifyCodeHandler.ts
"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { verifyCodeAPI } from '@/app/services/authapi'; // مسیر به authApi.ts
import { ApiError } from '@/app/services/apiService';         // مسیر به apiService.ts
import { verifyCodeMessages } from '@/app/constants/string'; // مسیر به فایل پیام‌ها

interface UseVerifyCodeHandlerProps {
  phone: string;
}

interface UseVerifyCodeHandlerReturn {
  code: string;
  setCode: (code: string) => void;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useVerifyCodeHandler = ({ phone }: UseVerifyCodeHandlerProps): UseVerifyCodeHandlerReturn => {
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!code.trim()) {
      toast.error("کد تایید نمی‌تواند خالی باشد."); // می‌توانید این متن را هم به authMessages اضافه کنید
      setIsLoading(false);
      return;
    }

    try {
      // verifyCodeAPI طبق طراحی ما، آبجکتی شامل accessToken و user برمی‌گرداند
      const response = await verifyCodeAPI(phone, code);

  
         toast.success(verifyCodeMessages.success);

     
    } catch (err) {
      console.error('Error verifying code:', err);
      if (err instanceof ApiError) {
        toast.error(err.message || verifyCodeMessages.retryErrorCodeVerification);
        setError(err.message || verifyCodeMessages.retryErrorCodeVerification);
      } else if (err instanceof Error) {
        toast.error(err.message || verifyCodeMessages.retryErrorCodeVerification);
        setError(err.message || verifyCodeMessages.retryErrorCodeVerification);
      } else {
        toast.error(verifyCodeMessages.retryErrorCodeVerification);
        setError(verifyCodeMessages.retryErrorCodeVerification);
      }
    } finally {
      setIsLoading(false);
    }
  }, [phone, code, router]); 
  return { code, setCode, isLoading, error, handleSubmit };
};
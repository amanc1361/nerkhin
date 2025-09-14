"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import FingerprintJS from '@fingerprintjs/fingerprintjs'; // <--- ADDED
import { verifyCodeAPI } from '@/app/services/authapi';
import { ApiError } from '@/app/services/apiService';
import { verifyCodeMessages } from '@/app/constants/string';

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
    
    if (!code.trim()) {
      toast.error("کد تایید نمی‌تواند خالی باشد.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // --- ADDED: Generate the unique device ID ---
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const deviceId = result.visitorId;

      if (!deviceId) {
          throw new Error("امکان شناسایی دستگاه وجود ندارد. لطفا دوباره تلاش کنید.");
      }
      
      // --- CHANGED: Pass deviceId as the third argument ---
      const response = await verifyCodeAPI(phone, code, deviceId);
      
      toast.success(verifyCodeMessages.success);
      
      // Handle the successful response, e.g., redirecting the user
      // router.push('/dashboard'); 

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
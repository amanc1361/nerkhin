"use client";

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { validatePhoneNumber } from '@/app/utils/validations'; // مسیر به فایل ولیدیشن شما

import { ApiError } from '@/app/services/apiService';
import { loginFormMessages } from '@/app/constants/string';
import { initiateSignInAPI } from '@/app/services/authapi';

export const useLoginHandler = () => {
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showVerifyCode, setShowVerifyCode] = useState<boolean>(false);


  const handlePhoneSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validatePhoneNumber(phone)) {
      toast.error(loginFormMessages.invalidPhoneNumber);
      return;
    }

    setIsLoading(true);
    try {
      const response = await initiateSignInAPI(phone);
    
      if (response.success) {
        toast.success(response.message || loginFormMessages.sendVerificationCode);
        setShowVerifyCode(true);
      } else {
        toast.error(response.message || loginFormMessages.signInError);
      }
    } catch (error) {
      const message = (error instanceof ApiError || error instanceof Error) 
        ? error.message 
        : loginFormMessages.signInError;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  return { phone, setPhone, isLoading, showVerifyCode, handlePhoneSubmit };
};
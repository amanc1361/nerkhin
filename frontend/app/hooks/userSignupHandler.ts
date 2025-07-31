"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { validatePhoneNumber, validateUsername } from '@/app/utils/validations';
import { NewUserFormData } from '@/app/types/types';
import { signUpFormMessages } from '@/app/constants/string';
import { userSignUpAPI } from '@/app/services/authapi';
import { ApiError } from '@/app/services/apiService';


// این هوک دیگر نیازی به برگرداندن allCities یا isLoadingCities ندارد
interface UseSignUpFormReturn {
  newUser: NewUserFormData;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useSignUpForm = (): UseSignUpFormReturn => {
  const router = useRouter();
  const [newUser, setNewUser] = useState<NewUserFormData>({
    phone: "",
    cityId: null,
    role: null,
    fullName: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // این هوک دیگر مسئول دریافت شهرها نیست

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = name === 'cityId' || name === 'role';
    setNewUser((prev) => ({
      ...prev,
      [name]: isNumeric ? (value === "" || value === "-1" ? null : +value) : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !newUser.cityId || !newUser.role ||
      !validateUsername(newUser.fullName) ||
      !validatePhoneNumber(newUser.phone)
    ) {
      toast.error(signUpFormMessages.validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await userSignUpAPI({
        phone: newUser.phone,
        cityId: newUser.cityId,
        role: newUser.role,
        fullName: newUser.fullName,
      });

      if (response.success) {
        toast.success(signUpFormMessages.signUpSuccess);
        // کاربر را به صفحه تایید کد با شماره تلفن خودش هدایت می‌کنیم
        router.push(`/auth/verify-code?phone=${newUser.phone}`); 
      } else {
        toast.error(response.message || signUpFormMessages.genericSignUpError);
      }
    } catch (err) {
      const errorMessage = (err instanceof ApiError || err instanceof Error) 
        ? err.message 
        : signUpFormMessages.signUpServerError;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [newUser, router]);

  return {
    newUser,
    isLoading,
    handleInputChange,
    handleSubmit,
  };
};
// فایل: components/auth/SignUpForm.tsx (یا مسیر شما)
"use client";

import React from 'react';

import LoadingSpinner from '@/app/components/Loading/Loading';

import { useRouter } from 'next/navigation';
import { City } from '@/app/types/types';
import { useSignUpForm } from '@/app/hooks/userSignupHandler';
import { signUpFormMessages } from '@/app/constants/string'; 
interface SignUpFormProps {
  cities: City[]; // لیست شهرها به عنوان prop دریافت می‌شود
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ cities }) => {
  const { newUser, isLoading, handleInputChange, handleSubmit } = useSignUpForm();
  const router = useRouter();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-5 items-center VazirFont p-4 sm:p-0">
      <div className="w-full sm:w-4/5 flex flex-col gap-2">
        <label htmlFor="fullName" className="font-medium text-gray-700 dark:text-gray-300 self-start">
          {signUpFormMessages.fullNameLabel}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder={signUpFormMessages.fullNamePlaceholder}
          value={newUser.fullName}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-dark dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div className="w-full sm:w-4/5 flex flex-col gap-2">
        <label htmlFor="phone" className="font-medium text-gray-700 dark:text-gray-300 self-start">
          {signUpFormMessages.phoneLabel}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder={signUpFormMessages.phonePlaceholder}
          value={newUser.phone}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-dark dark:bg-gray-700 dark:text-white text-left"
          dir="ltr"
          required
        />
      </div>

      <div className="w-full sm:w-4/5 flex flex-col gap-2">
        <label htmlFor="role" className="font-medium text-gray-700 dark:text-gray-300 self-start">
          {signUpFormMessages.userTypeLabel}
        </label>
        <select
          id="role"
          name="role"
          value={newUser.role ?? ""} // برای کامپوننت کنترل شده
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-dark bg-white dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="" disabled>{signUpFormMessages.userTypePlaceholder}</option>
          <option value={3}>{signUpFormMessages.userTypeWholesaler}</option>
          <option value={4}>{signUpFormMessages.userTypeRetailer}</option>
        </select>
      </div>

      <div className="w-full sm:w-4/5 flex flex-col gap-2">
        <label htmlFor="cityId" className="font-medium text-gray-700 dark:text-gray-300 self-start">
          {signUpFormMessages.cityLabel}
        </label>
        <select
          id="cityId"
          name="cityId"
          value={newUser.cityId ?? ""}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-dark bg-white dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="" disabled>{signUpFormMessages.cityPlaceholder}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-4/5 mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-medium rounded-xl px-8 py-3 transition bg-blue-dark text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {isLoading ? <LoadingSpinner size="small" mode="inline" /> : signUpFormMessages.submitButton}
        </button>
      </div>

      <div className="w-full sm:w-4/5 text-center mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
         
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="font-semibold text-blue-dark hover:underline mr-1"
          >
            {signUpFormMessages.loginRedirectButton}
          </button>
        </span>
      </div>
    </form>
  );
};
// فایل: hooks/useManageCities.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { City, NewCityFormData, CreateCityResponse } from '@/app/types/types'; // مسیر صحیح
import { cityMessages } from '@/app/constants/citymessage'; // مسیر صحیح
import { cityApi } from '@/app/services/cityApi'; // مسیر صحیح
import { ApiError } from '@/app/services/apiService'; // مسیر صحیح

export const useManageCities = () => {
  const { api, isAuthenticated, isLoading: isAuthLoading } = useAuthenticatedApi();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  // State برای نگهداری داده‌های فرم، با نوع صحیح NewCityFormData
  const [newCityData, setNewCityData] = useState<NewCityFormData>({ name: "", type: null });

  const fetchCities = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const cityList = await api.get<City[]>(cityApi.getAllCity());
      setCities(cityList);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error(cityMessages.errorFetching);
    } finally {
      setIsLoading(false);
    }
  }, [api, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCities();
    }
    if (!isAuthLoading && !isAuthenticated) {
        setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, fetchCities]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = name === 'type';
    // به‌روزرسانی state فرم با داده‌های ورودی کاربر
    setNewCityData(prev => ({
      ...prev,
      [name]: isNumericField ? (value === "" || value === "-1" ? null : +value) : value,
    }));
  }, []);

  const handleAddSubmit = useCallback(async () => {
    // اعتبارسنجی داده‌های فرم
    if (!newCityData.name.trim() || newCityData.type === null || newCityData.type === -1) {
      toast.error(cityMessages.errorAdding);
      return;
    }
    setIsSubmitting(true);
    try {
      // ارسال داده‌های فرم به API
      const response = await api.post<CreateCityResponse>(cityApi.create(newCityData));
      
      // بررسی پاسخ API 
      if (response.success) {
        toast.success(response.message || cityMessages.addSuccess);
        setShowAddModal(false);
        setNewCityData({ name: "", type: null }); // ریست کردن فرم
        await fetchCities(); // بارگذاری مجدد لیست شهرها
      } else {
        toast.error(response.message || cityMessages.errorServerAdding);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : cityMessages.errorServerAdding;
      toast.error(message);
      console.error("Error adding city:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [api, newCityData, fetchCities]);

  return {
    cities,
    isLoading: isLoading || isAuthLoading,
    refetchCities: fetchCities,
    showAddModal,
    openAddModal: () => setShowAddModal(true),
    closeAddModal: () => setShowAddModal(false),
    newCityData, // state فرم با نام صحیح
    handleInputChange,
    handleAddSubmit,
    isSubmitting,
  };
};
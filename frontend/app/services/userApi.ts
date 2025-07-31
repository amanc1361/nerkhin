import { NewUserFormData } from "@/app/types/types";

// services/userApi.ts
export const userApi = {
  // پارامترها باید شامل موارد صفحه‌بندی مانند page و limit باشند
  getAll: (params: { [key: string]: any }) => ({
    url: '/user/fetch-users',
    method: 'post' as const,
    body: params,
  }),
  create: (newUserData: NewUserFormData) => ({
    url: '/user/add-new-user',
    method: 'post' as const,
    body: newUserData,
  }),
  changeState: (payload: { userId: number | string; targetState: number }) => ({
    url: '/user/change-state',
    method: 'post' as const,
    body: payload,
  }),
};


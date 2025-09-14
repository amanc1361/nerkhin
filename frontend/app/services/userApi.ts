import { NewUserFormData } from "@/app/types/types";

export const userApi = {
  // گرفتن لیست کاربران (با صفحه‌بندی و فیلترها)
  getAll: (params: { [key: string]: any }) => ({
    url: "/user/fetch-users",
    method: "post" as const,
    body: params,
  }),

  // ایجاد کاربر جدید
  create: (newUserData: NewUserFormData) => ({
    url: "/user/add-new-user",
    method: "post" as const,
    body: newUserData,
  }),

  // تغییر وضعیت (approve = 5, reject = 2 و غیره)
  changeState: (payload: { userId: number ; targetState: number }) => ({
    url: "/user/change-state",
    method: "post" as const,
    body: payload,
  }),

  // حذف کاربر
  deleteUser: ( userId: number  ) => ({
    url: `/user/delete/${userId}`,
    method: "delete" as const,
   
  }),

  // فعال/غیرفعال کردن کاربر
  setActive: (payload: { userId: number | string; active: boolean }) => ({
    url: "/user/set-active",
    method: "post" as const,
    body: payload,
  }),


  updateDeviceLimit: (payload: { userId: number; limit: number }) => ({
    url: `/user/users/device-limit`, // You need to create this route in your Go backend
    method: 'PUT', // Using PUT for updating a specific resource property
    body: payload,
  }),
  listUserDevices: (userId: number) => ({
    url: `/user/users/${userId}/devices`,
    method: 'GET',
  }),
  deleteUserDevice: (userId: number, deviceId: string) => ({
    url: `/user/users/${userId}/devices/${deviceId}`,
    method: 'DELETE',
  }),
};


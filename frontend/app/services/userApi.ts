import { NewUserFormData } from "@/app/types/types";

// تمام URL ها برای تطابق با روت‌های ادمین در بک‌اند اصلاح شدند
export const userApi = {
  // گرفتن لیست کاربران
  list: (params: { [key: string]: any }) => ({
    url: "/user/users/filter", // اصلاح مسیر
    method: "POST" as const,
    body: params,
  }),

  // ایجاد کاربر جدید
  create: (newUserData: NewUserFormData) => ({
    url: "/user/users", // اصلاح مسیر
    method: "POST" as const,
    body: newUserData,
  }),

  // تغییر وضعیت کاربر
  changeState: (payload: { userId: number; targetState: number }) => ({
    url: "/user/change-state", // اصلاح مسیر
    method: "POST" as const,
    body: payload,
  }),

  // حذف یک کاربر
  deleteUser: (userId: number) => ({
    url: `/user/delete/${userId}`, // اصلاح مسیر
    method: "DELETE" as const,
  }),

  // آپدیت محدودیت دستگاه برای یک کاربر
  updateDeviceLimit: (payload: { userId: number; limit: number }) => ({
    url: `/user/users/device-limit`, // اصلاح مسیر
    method: 'PUT',
    body: payload,
  }),

  // گرفتن لیست دستگاه‌های یک کاربر
  listUserDevices: (userId: number) => ({
    url: `/user/users/${userId}/devices`, // اصلاح مسیر
    method: 'GET',
  }),

  // حذف یک دستگاه خاص از یک کاربر
  deleteUserDevice: (userId: number, deviceId: string) => ({
    url: `/user/users/${userId}/devices/${deviceId}`, // اصلاح مسیر
    method: 'DELETE',
  }),

  // --- CHANGED: حذف تمام دستگاه‌های یک کاربر ---
  deleteAllUserDevices: (userId: number) => ({
    url: `/user/users/${userId}/devices`, // DELETE روی این آدرس یعنی حذف همه دستگاه‌ها
    method: 'DELETE',
  }),

  // --- CHANGED: آپدیت محدودیت برای همه کاربران ---
  updateAllDeviceLimits: (payload: { limit: number }) => ({
    url: `/user/users/all/device-limit`, // آدرس مجزا برای عملیات کلی
    method: 'PUT',
    body: payload, // ارسال آبجکت به جای عدد خام
  }),
};
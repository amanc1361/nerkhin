import { NewUserFormData } from "@/app/types/types";

// تمام URL ها برای تطابق با روت‌های ادمین در بک‌اند اصلاح شدند
export const userApi = {
  // گرفتن لیست کاربران
  list: (params: { [key: string]: any }) => ({
    url: "/admin/users/filter", // اصلاح مسیر
    method: "POST" as const,
    body: params,
  }),

  // ایجاد کاربر جدید
  create: (newUserData: NewUserFormData) => ({
    url: "/admin/users", // اصلاح مسیر
    method: "POST" as const,
    body: newUserData,
  }),

  // تغییر وضعیت کاربر
  changeState: (payload: { userId: number; targetState: number }) => ({
    url: "/admin/users/change-state", // اصلاح مسیر
    method: "POST" as const,
    body: payload,
  }),

  // حذف یک کاربر
  deleteUser: (userId: number) => ({
    url: `/admin/users/${userId}`, // اصلاح مسیر
    method: "DELETE" as const,
  }),

  // آپدیت محدودیت دستگاه برای یک کاربر
  updateDeviceLimit: (payload: { userId: number; limit: number }) => ({
    url: `/admin/users/device-limit`, // اصلاح مسیر
    method: 'PUT',
    body: payload,
  }),

  // گرفتن لیست دستگاه‌های یک کاربر
  listUserDevices: (userId: number) => ({
    url: `/admin/users/${userId}/devices`, // اصلاح مسیر
    method: 'GET',
  }),

  // حذف یک دستگاه خاص از یک کاربر
  deleteUserDevice: (userId: number, deviceId: string) => ({
    url: `/admin/users/${userId}/devices/${deviceId}`, // اصلاح مسیر
    method: 'DELETE',
  }),

  // --- CHANGED: حذف تمام دستگاه‌های یک کاربر ---
  deleteAllUserDevices: (userId: number) => ({
    url: `/admin/users/${userId}/devices`, // DELETE روی این آدرس یعنی حذف همه دستگاه‌ها
    method: 'DELETE',
  }),

  // --- CHANGED: آپدیت محدودیت برای همه کاربران ---
  updateAllDeviceLimits: (payload: { limit: number }) => ({
    url: `/admin/users/all/device-limit`, // آدرس مجزا برای عملیات کلی
    method: 'PUT',
    body: payload, // ارسال آبجکت به جای عدد خام
  }),
};
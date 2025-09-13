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
};

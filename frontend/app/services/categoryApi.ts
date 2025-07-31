import { NewBrandFormData } from "@/app/types/category/categoryManagement";

export const categoryApi = {
  // ما از GetMainCategories در سرویس Go استفاده می‌کنیم که هم دسته و هم زیردسته‌ها را برمی‌گرداند
  getAll: () => ({
    url: '/product-category/main-categories',
    method: 'get' as const,
  }),
  create: (data: FormData) => ({ // برای آپلود فایل از FormData استفاده می‌کنیم
    url: '/product-category/create',
    method: 'post' as const,
    body: data,
    
  }),
  delete: (id: number | string) => ({
    url: `/product-category/${id}`,
    method: 'delete' as const, // یا DELETE
   
  }),
  
};
export const brandApi = {
  create: (data: NewBrandFormData) => ({
    url: '/product-brand/create',
    method: 'post' as const,
    body: data,
  }),
    getByCategory: (categoryId: number | string) => ({
    url: `/product-brand/fetch-brands/${categoryId}`, // فرض می‌کنیم چنین endpoint ای در Go دارید
    method: 'get' as const,
  }),
  update: (data: { id: number | string, title: string }) => ({
    url: '/product-brand/update',
    method: 'post' as const, // یا PUT
    body: data,
  }),
  delete: (id: number | string) => ({
    url: `/product-brand/${id}`,
    method: 'delete' as const,
  }),
};
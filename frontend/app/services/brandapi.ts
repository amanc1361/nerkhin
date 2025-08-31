import { NewModelFormData } from "@/app/types/model/model";


export const brandApi = {
  getById: (id: string | number) => ({ url: `/product-brand/fetch/${id}`, method: 'get' as const }),
  getBrandByCategoryId: (id: string | number) => ({ url: `/product-brand/fetch-brands/${id}`, method: 'get' as const }),
};

export const modelApi = {
  getByBrand: (brandId: string | number) => ({ url: `/product-model/by-brand/${brandId}`, method: 'get' as const }),
  create: (data: NewModelFormData) => ({ url: '/product-model/create', method: 'post' as const, body: data }),
  update: (data: { id: string | number, title: string }) => ({ url: '/product-model/update', method: 'post' as const, body: data }),
  delete: (id: string | number) => ({ url: `/product-model/delete/${id}`, method: 'delete' as const }),
};





export const productApi = {
  create: (data: FormData) => ({ url: '/product/create', method: 'post' as const, body: data }),
getByBrand: (brandId: string | number, page = 1, pageSize = 200) => ({
  url: `/product/by-brand/${brandId}?page=${page}&page_size=${pageSize}`,
  method: "get" as const,
}),
  delete: (id: number | string) => ({ url: `/product/delete/${id}`, method: "delete" as const }),
  update: (data: FormData) => ({ url: "/product/update", method: "post" as const, body: data }),
   createWithUrl: "/product/create",
   updateWithUrl: "/product/update", 
};


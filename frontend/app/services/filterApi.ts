// services/filterApi.ts
type CreateFilterDto = { categoryId: number; title: string };
type UpdateFilterDto = { id: number; categoryId: number; title: string };

type CreateOptionDto = { filterId: number; title: string };
type UpdateOptionDto = { id: number; filterId: number; title: string };

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w-]+/g, "");

export const filterApi = {
  // ---- read collections ----
  getByCategory: (categoryId: string | number) => ({
    url: `/product-filter/fetch-all/${categoryId}`,
    method: "get" as const,
  }),

  // ---- read single ----
  fetchFilter: (id: number) => ({
    url: `/product-filter/fetch/${id}`,
    method: "get" as const,
  }),
  fetchOption: (id: number) => ({
    url: `/product-filter-option/fetch/${id}`,
    method: "get" as const,
  }),

  // ---- filter CRUD ----
  createFilter: (data: CreateFilterDto) => {
    const { categoryId, title } = data;
    return {
      url: "/product-filter/create",
      method: "post" as const,
      body: {
        categoryId,
        name: slugify(title),
        displayName: title.trim(),
        options: [] as string[],
      },
    };
  },

  // مهم: بک‌اند انتظار ProductFilterData دارد: { filter: {...}, options: [...] }
  updateFilter: (data: UpdateFilterDto) => {
    const { id, categoryId, title } = data;
    return {
      url: "/product-filter/update",
      method: "put" as const,
      body: {
        filter: {
          id,
          categoryId,
          name: slugify(title),      // اگر نمی‌خواهید slug عوض شود، مقدار فعلی name را بدهید
          displayName: title.trim(),
        },
        options: [], // اینجا گزینه‌ها را تغییر نمی‌دهیم
      },
    };
  },

  deleteFilter: (id: number) => ({
    url: `/product-filter/delete/${id}`,
    method: "delete" as const,
  }),

  // ---- option CRUD ----
  createOption: (data: CreateOptionDto) => {
    const { filterId, title } = data;
    return {
      url: "/product-filter/option/create",
      method: "post" as const,
      body: {
        filterId,
        name: title.trim(),
      },
    };
  },

  // به PUT تغییر داده شد و بدنه با struct بک‌اند هم‌راستا شد
  updateOption: (data: UpdateOptionDto) => ({
    url: "/product-filter-option/update",
    method: "put" as const,
    body: {
      id: data.id,
      filterId: data.filterId,
      name: data.title.trim(),
    },
  }),

  deleteOption: (id: number) => ({
    url: `/product-filter-option/delete/${id}`,
    method: "delete" as const,
  }),
};

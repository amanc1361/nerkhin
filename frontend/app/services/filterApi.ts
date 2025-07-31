// services/filterApi.ts
export const filterApi = {
      getByCategory: (categoryId: string | number) => ({ url: `/product-filter/fetch-all/${categoryId}`, method: 'get' as const }),

  createFilter: (data: { categoryId: number; title: string }) => {
    const { categoryId, title } = data;
    const payload = {
      categoryId,
      name: title.trim().toLowerCase().replace(/\s+/g, "_"), // slug ساده
      displayName: title.trim(),
      options: [] as string[],
    };

    return {
      url: "/product-filter/create",
      method: "post" as const,
      body: payload,
    };
  },
  updateFilter: (data: { id: number; title: string }) => ({
    url: "/product-filter/update",
    method: "post" as const,
    body: data,
  }),
  deleteFilter: (id: number) => ({
    url: `/product-filter/delete/${id}`,
    method: "delete" as const,
  }),
  /** ↙️ متد خواندن فیلتر */
  fetchFilter: (id: number) => ({
    url: `/product-filter/fetch/${id}`,
    method: "get" as const,
  }),

  /* CRUD گزینه */
  createOption: (data: { filterId: number; title: string }) => {
    const { filterId, title } = data;
    const payload = {
      filterId,
      name: title.trim(),
    
    };
    return {
url: "/product-filter/option/create",
    method: "post" as const,
    body: payload,
    }
    
  },
  updateOption: (data: { id: number; title: string }) => ({
    url: "/product-filter-option/update",
    method: "post" as const,
    body: data,
  }),
  deleteOption: (id: number) => ({
    url: `/product-filter-option/delete/${id}`,
    method: "delete" as const,
  }),
  /** ↙️ متد خواندن گزینه */
  fetchOption: (id: number) => ({
    url: `/product-filter-option/fetch/${id}`,
    method: "get" as const,
  }),
};

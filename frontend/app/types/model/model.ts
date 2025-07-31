




export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}
export interface Category { id: number | string; title: string; subCategories?: Category[] }

// این تایپ‌ها برای بخش فیلترها که قبلاً تعریف نشده بودند، اضافه شده‌اند
export interface ProductFilter { id: number | string; name: string; displayName: string; }
export interface ProductFilterOption { id: number | string; name: string; filterId: number | string; }
export interface ProductFilterData {
  filter: ProductFilter;
  options: ProductFilterOption[];
}

export interface FiltersResponse {
  categoryTitle:    string;
  subcategoryTitle: string;
  productFilters:   ProductFilterData[];
}

export interface NewModelFormData { title: string; brandId: number | string; }
export interface NewProductFormData {
  brandId: number | string;
  description: string;
  tags: string[];
  filterOptionIds: number[];
  defaultOptionId: number | null;
}

export interface SuccessResponse { success: boolean; message?: string; }
export interface ApiError extends Error { status?: number; data?: any; }
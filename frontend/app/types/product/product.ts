// types/productManagement.d.ts
export interface Category { id: number | string; title: string; }
export interface Brand { id: number | string; title: string; categoryId: number | string; }
export interface ProductFilter { id: number | string; name: string; displayName: string; }
export interface ProductFilterOption { id: number | string; name: string; filterId: number | string; }
export interface ProductFilterData {
  filter: ProductFilter;
  options: ProductFilterOption[];
}

export interface Product {
  id: number | string;
  modelName:  string;
  brandId:number;
  description: string;
  // ... سایر فیلدهای محصول
}

export interface NewModelFormData { title: string; brandId: number | string; }
export interface NewProductFormData {
  modelId: number | string;
  description: string;
  tags: string[];
  // آرایه‌ای از ID گزینه‌های فیلتر انتخاب شده
  filterOptionIds: number[];
  // ID گزینه فیلتر پیش‌فرض
  defaultOptionId: number | null;
}
export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  isDefault: boolean;
}

  export interface ProductTag {
    id: number;
    productId: number;
    tag: string;
  }

export interface ProductFilterRelationViewModel {
  id:number;
  filterId: number;
  optionId: number;
  filterTitle: string;
  optionTitle: string;
}
export interface ProductSmallViewModel {
  id: number;
  modelName:string;
 
}

export interface ProductViewModel {
  id: number;
  modelName:string;
  brandId: number;
  defaultImageUrl: string;
  description: string;
  state: number;           // Confirmed = 1 …
  likesCount: number;
  shopsCount: number;
  createdAt: string;
  updatedAt: string;
  imagesCount?: number;
  subCategoryId: number;
  subCategoryTitle: string;
  categoryTitle: string;
  brandTitle: string;
  isLiked: boolean;


  filterRelations: ProductFilterRelationViewModel[];
  tags: ProductTag[];
}

export interface PaginatedProducts {
  products: ProductViewModel[];
  totalCount: number;
}

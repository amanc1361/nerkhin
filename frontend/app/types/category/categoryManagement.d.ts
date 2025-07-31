// types/categoryManagement.d.ts
export interface Category {
  id: number ;
  title: string;
  parentId: number | null;
  imageUrl: string;

  subCategories?: Category[];
}

 
export interface NewCategoryFormData {
  title: string;
  parentId: number | null;
  image: File | null;
}
export interface Brand {
  id: number | string;
  title: string;
  categoryId: number | string;
}

export interface NewBrandFormData {
  title: string;
  categoryId: number | string;
}


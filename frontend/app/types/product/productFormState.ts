// export interface ProductTag {
//   id: number;          // 0 برای تگ‌های جدید
//   productId: number;   // یا null در حالت ایجاد محصول
//   tag: string;
// }
// export interface ProductFormState {
//   description: string;
//   tags: ProductTag[];
//   selectedOptions: Record<number, number[]>;   // ⬅️ آرایهٔ عددی
//   __newFilter?: number;
//   __newOption?: number;
//   // سایر فیلدهای شما …
// }
// types/product/ProductFormState.ts
export interface ProductTag {
  id: number;
  productId: number;
  tag: string;
}

export interface ProductFormState {
  modelName:string;
  description: string;
  tags: ProductTag[];

  /** کلید = filterId، مقدار = آرایهٔ optionId های انتخاب‌شده */
  selectedOptions: Record<number, number[]>;

  /** تصاویر موجود روی سرور */
  remoteImages: { id: number; url: string; isDefault: boolean }[];

  /** فایل‌های جدید آپلودشده */
  newImages: File[];

  /** ایندکس تصویر پیش‌فرض در آرایه‌ی ‹remoteImages + newImages› */
  defaultImageIndex: number;

  /* متغیّرهای موقت برای کامبوی افزودن گزینه */
  __newFilter?: number;
  __newOption?: number;
}

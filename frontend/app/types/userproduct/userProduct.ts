// app/types/userproduct/userProduct.ts

// برای decimal ها در فرانت‌اند رشته در نظر می‌گیریم
export type DecimalString = string;

// --------- مدل‌های اصلی سمت سرور (نمایش/ویو) ---------

export type ProductFilterRelationViewModel = {
  id: number;
  filterId: number;
  optionId: number;
};

export type UserProduct = {
  id: number;
  userId: number;
  productId: number;

  brandId: number;     // gorm:"->"
  categoryId: number;  // gorm:"->"
  modelName: string;   // gorm:"->" column:model_name

  isDollar: boolean;
  dollarPrice?: DecimalString | null; // nullable
  otherCosts?: DecimalString | null;  // nullable
  finalPrice: DecimalString;          // required

  order: number;       // column: order_c
  isHidden: boolean;
  createdAt: string;   // ISO
  updatedAt?: string | null; // ISO or null
};

export type UserProductView = UserProduct & {
  productCategory: string;
  productBrand: string;
  productModel: string;
  description: string;
  defaultImageUrl: string;
  defaultFilter?: ProductFilterRelationViewModel | null;
  isFavorite: boolean;
  shopsCount: number;
};

export type ShopViewModel = {
  shopInfo: {
    id: number;
    userName?: string;
    city?: string;
    phoneNumber?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    likesCount?: number;
    shopAddress?: string;
    shopPhone1?: string;
    shopPhone2?: string;
    shopName?: string;
    createdAt?: string;
    instagramUrl?: string;
    telegramUrl?: string;
    whatsappUrl?: string;
    websiteUrl?: string;
    updatedAt?: string;

    // سایر فیلدهای کاربر که نیاز داری به تدریج اضافه کن
  } | null;
  products: UserProductView[];
};

// --------- تایپ‌های استفاده‌شده در UI فعلی (بدون تغییر نام‌) ---------

export type ProductSummary = {
  id?: number;
  brandTitle?: string;
  modelName?: string;
  imageUrl?: string | null;
};

export type UserProductVM = {
  id: number;
  isVisible?: boolean;     // اگر داشتی
  isDollar?: boolean;
  dollarPrice?: string | null;
  otherCosts?: string | null;
  finalPrice?: string | number;
  createdAt?: string;
  product?: ProductSummary;
};

export type PriceListVM = {
  usdPrice?: number | string | null;
};

// --------- Payloads (client -> API) ----------

export type CreateUserProductPayload = {
  categoryId: number;
  brandId: number;
  modelId: number;
  isDollar: boolean;
  dollarPrice?: DecimalString; // decimal string
  otherCosts?: DecimalString;  // decimal string
  finalPrice: DecimalString;   // decimal string
};


export type UpdateUserProductPayload = {
  id: number;
  isDollar?: boolean;
  dollarPrice?: DecimalString;
  otherCosts?: DecimalString;
  finalPrice?: DecimalString;
};

export type DeleteUserProductPayload = { id: number };
export type ChangeStatusPayload   = { userProductId: number };
export type ChangeOrderPayload    = { topProductId: number; bottomProductId: number };
export type FetchByFilterPayload  = { categoryId?: number; searchText?: string };

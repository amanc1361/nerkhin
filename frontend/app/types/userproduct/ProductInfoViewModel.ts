// اگر ProductViewModel از قبل داری، همین را ایمپورت کن:

import { ProductViewModel } from "../product/product";


export type ProductShop = {
  id: number;
  userId: number;
  finalPrice: string;        // backend: decimal => FE: string
  defaultImageUrl?: string | null;
  shopCity?: string | null;
  shopPhone1?: string | null;
  shopPhone2?: string | null;
  shopPhone3?: string | null;
  shopName?: string | null;
  isLiked: boolean;
  likesCount: number;
  updatedAt: string;     
  imagesCount?: number;    // ISO
};

export type ProductInfoViewModel = {
  shopProducts: ProductShop[];
  productInfo: ProductViewModel;
};

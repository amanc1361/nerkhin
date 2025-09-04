// app/types/userproduct/market.ts
export type SortUpdated = "asc" | "desc";

export type MarketSearchQuery = {
  // paging
  limit?: number;
  offset?: number;

  // sort
  sortBy?: "updated" | "order";
  sortUpdated?: SortUpdated; // "asc" | "desc"

  // filters
  categoryId?: number;
  subCategoryId?: number;
  brandId?: number[];     // multi
  optionId?: number[];    // multi
  filterId?: number[];    // multi
  tag?: string[];         // multi
  search?: string;
  isDollar?: boolean | null;
  cityId?: number;

  // flags
  onlyVisible?: boolean;          // default: true
  enforceSubscription?: boolean;  // default: false
};

export type UserProductMarketView = {
  id: number;
  productId: number;
  userId: number;
  isDollar: boolean;
  finalPrice: string;            // decimal::text
  dollarPrice?: string | null;   // nullable::text
  order: number;

  modelName: string;
  brandId: number;
  defaultImageUrl: string;
  imagesCount: number;
  description: string;

  categoryId: number;
  categoryTitle: string;
  brandTitle: string;

  shopName: string;
  cityId: number;
  cityName: string;

  updatedAt: string;
  isFavorite: boolean;
};

export type MarketSearchResult = {
  items: UserProductMarketView[];
  total: number;
};

// VM برای نمایش در UI
export type MarketItemVM = {
  id: number;
  productId: number;
  userId: number;
  isDollar: boolean;
  finalPrice: string;
  dollarPrice: string | null;
  order: number;

  modelName: string;
  brandId: number;
  brandTitle: string;
  categoryId: number;
  categoryTitle: string;

  imageUrl: string | null; // absolutized
  imagesCount: number;
  description: string;

  shopName: string;
  cityId: number;
  cityName: string;

  updatedAt: string;
  isLiked: boolean;
};

export type MarketSearchVM = {
  items: MarketItemVM[];
  total: number;
};

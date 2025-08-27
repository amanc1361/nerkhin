// app/types/userProduct.ts
export type ProductSummary = {
  id?: number;
  brandTitle?: string;
  modelName?: string;
  imageUrl?: string | null;
};

export type UserProductVM = {
  id: number;
  isVisible?: boolean;
  isDollar?: boolean;
  dollarPrice?: string;
  otherCosts?: string;
  finalPrice?: string | number;
  createdAt?: string;
  product?: ProductSummary;
};

export type PriceListVM = {
  usdPrice?: number | string | null;
};

/* -------- payloads (client -> API) -------- */
export type CreateUserProductPayload = {
  categoryId: number;
  brandId: number;
  modelId: number;
  isDollar: boolean;
  dollarPrice?: string;   // decimal string
  otherCosts?: string;    // decimal string
  finalPrice: string;     // decimal string
};

export type UpdateUserProductPayload = {
  id: number;
  isDollar?: boolean;
  dollarPrice?: string;
  otherCosts?: string;
  finalPrice?: string;
};

export type DeleteUserProductPayload = { id: number };
export type ChangeStatusPayload   = { userProductId: number };
export type ChangeOrderPayload    = { topProductId: number; bottomProductId: number };
export type FetchByFilterPayload  = { categoryId?: number; searchText?: string };

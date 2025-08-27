import { ChangeOrderPayload, ChangeStatusPayload, FetchByFilterPayload, UpdateUserProductPayload } from "../types/userproduct/userProduct";


export const userProductApi = {
  fetchMyShop:        () => ({ url: "/user-product/fetch-shop",       method: "get"  as const }),
  fetchPriceList:     () => ({ url: "/user-product/fetch-price-list", method: "get"  as const }),
  changeOrder:  (data: ChangeOrderPayload) =>
                       ({ url: "/user-product/change-order",          method: "post" as const, body: data }),
  changeStatus: (data: ChangeStatusPayload) =>
                       ({ url: "/user-product/change-status",         method: "post" as const, body: data }),
  update:       (data: UpdateUserProductPayload) =>
                       ({ url: "/user-product/update",                method: "post" as const, body: data }),
  remove: (id: number) =>
    ({ url: `/user-product/delete/${id}`, method: "delete" as const }),
  fetchRelatedShops: (productId: number) =>
                       ({ url: `/user-product/fetch-shops/${productId}`, method: "get" as const }),
  fetchByFilter: (data: FetchByFilterPayload) =>
                       ({ url: "/user-product/fetch-products",        method: "post" as const, body: data }),
};

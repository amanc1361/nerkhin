import { MarketSearchQuery } from "../types/userproduct/market";
import { ChangeOrderPayload, ChangeStatusPayload, FetchByFilterPayload, UpdateUserProductPayload } from "../types/userproduct/userProduct";

function buildMarketSearchQS(q?: MarketSearchQuery) {
  if (!q) return "";
  const p = new URLSearchParams();

  if (typeof q.limit === "number") p.set("limit", String(q.limit));
  if (typeof q.offset === "number") p.set("offset", String(q.offset));
  if (q.sortBy) p.set("sortBy", q.sortBy);
  if (q.sortUpdated) p.set("sortDir", q.sortUpdated);

  if (q.categoryId) p.set("categoryId", String(q.categoryId));
  if (q.subCategoryId) p.set("subCategoryId", String(q.subCategoryId));
  q.brandId?.forEach((v) => p.append("brandId", String(v)));
  q.optionId?.forEach((v) => p.append("optionId", String(v)));
  q.filterId?.forEach((v) => p.append("filterId", String(v)));
  q.tag?.forEach((v) => p.append("tag", v));
  if (q.search) p.set("search", q.search);

  if (q.isDollar === true) p.set("isDollar", "1");
  else if (q.isDollar === false) p.set("isDollar", "0");

  if (q.cityId) p.set("cityId", String(q.cityId));
  if (q.enforceSubscription) p.set("enforceSubscription", "1");
  if (q.onlyVisible === false) p.set("onlyVisible", "0");

  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export const userProductApi = {
  marketSearch(q?: MarketSearchQuery) {
    const qs = buildMarketSearchQS(q);
    return { method: "get" as const, url: `/user-product/search${qs}` };
  },
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

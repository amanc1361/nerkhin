// app/[role]/products/page.tsx

import { fetchMyShopProductsSSR, fetchPriceListSSR } from "@/lib/server/userProductAction";
import MyProductsPage from "./MyproductsPage";


export default async function Page({ params }: { params: { role: "wholesaler" | "retailer" } }) {
  const role = params.role;
  const [items, priceList] = await Promise.all([fetchMyShopProductsSSR(), fetchPriceListSSR()]);
  const usdPrice = priceList?.usdPrice ?? "";
  return <MyProductsPage role={role} initialItems={items} usdPrice={usdPrice} locale="fa" />;
}

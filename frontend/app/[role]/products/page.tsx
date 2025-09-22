import { fetchMyShopProductsSSR, fetchPriceListSSR } from "@/lib/server/userProductAction";
import MyProductsPage from "./MyproductsPage";

type Role = "wholesaler" | "retailer";
type RoleParam = { role: Role };
type Search = Record<string, string | string[] | undefined>;

export default async function Page({
  params,
  searchParams,
}: Readonly<{
  params: Promise<RoleParam>;
  searchParams?: Promise<Search>;
}>) {
  const { role } = await params;

  const [shopData, priceList] = await Promise.all([
    fetchMyShopProductsSSR({ limit: 40, offset: 0 }), // شروع با صفحه اول
    
    fetchPriceListSSR(),
  ]);
  console.log(shopData)
  const usdPrice = priceList?.usdPrice ?? "";
  const dollarUpdate=shopData.shopInfo?.dollarUpdate ?? false;
  const rounded=shopData.shopInfo?.rounded ?? false;

  return (
    <MyProductsPage
      role={role}
      initialData={shopData}
      usdPrice={usdPrice}
      dollarUpdate={dollarUpdate}
      rounded={rounded}
      locale="fa"
    />
  );
}

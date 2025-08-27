// app/[role]/products/page.tsx

import { fetchMyShopProductsSSR, fetchPriceListSSR } from "@/lib/server/userProductAction";
import MyProductsPage from "./MyproductsPage";



type Role = "wholesaler" | "retailer";
type RoleParam = { role: Role };

export default async function Page(
  {
    params,
  }: Readonly<{
    // ⚠️ دقیقا مطابق constraint پروژه: Promise<any> | undefined
    // ما نوع دقیق‌تر رو داخل Promise می‌گذاریم
    params: Promise<RoleParam>; 
    searchParams?: Record<string, string | string[] | undefined>;
  }>
) {
  const { role } = await params; // اگر پروژه‌ات همیشه Promise می‌دهد، این دقیقاً مطابق قرارداد است

  const [items, priceList] = await Promise.all([
    fetchMyShopProductsSSR(),
    fetchPriceListSSR(),
  ]);

  const usdPrice = priceList?.usdPrice ?? "";

  return (
    <MyProductsPage
      role={role}
      initialItems={items}
      usdPrice={usdPrice}
      locale="fa"
    />
  );
}


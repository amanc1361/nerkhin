// app/[role]/products/page.tsx

import { fetchMyShopProductsSSR, fetchPriceListSSR } from "@/lib/server/userProductAction";
import MyProductsPage from "./MyproductsPage";



type Role = "wholesaler" | "retailer";
type RoleParam = { role: Role };
type Search = Record<string, string | string[] | undefined>;

export default async function Page({
  params,
  searchParams,
}: Readonly<{
  // ✅ همسو با PageProps سراسری شما که Promise می‌خواهد
  params: Promise<RoleParam>;
  searchParams?: Promise<Search>;
}>) {
  const { role } = await params; // اگر Promise نباشد هم TS سازگار است (await روی non-Promise مشکلی ندارد)

  // اگر جایی به searchParams نیاز داشتی:
  // const sp = searchParams ? await searchParams : undefined;

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

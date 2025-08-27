// app/[role]/products/page.tsx

import { fetchMyShopProductsSSR, fetchPriceListSSR } from "@/lib/server/userProductAction";
import MyProductsPage from "./MyproductsPage";


type Role = "wholesaler" | "retailer";
type Params = { role: Role };
type MaybePromise<T> = T | Promise<T>;

type PageProps = Readonly<{
  params: MaybePromise<Params>;
  searchParams?: Record<string, string | string[] | undefined>;
}>;

export default async function Page({ params }: PageProps) {
  const { role } = await params; // ← اگر Promise باشد await بازش می‌کند، اگر نباشد هم OK است

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

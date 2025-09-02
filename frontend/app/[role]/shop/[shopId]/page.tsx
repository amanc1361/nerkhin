import Link from "next/link";

import type { ShopViewModel, UserProductView } from "@/app/types/userproduct/userProduct";
import ShopHeader from "@/app/components/shop/ShopHeader";
import ShopProductsList from "@/app/components/shop/ShopProductsList";
import { buildShopLabels } from "@/lib/server/118n/buildShopLabels";
import { fetchMyShopProductsRawSSR } from "@/lib/server/userProductAction";


type Role = "wholesaler" | "retailer";

export default async function Page({
  params,
}: { params: Promise<{ role: Role; shopId: string }> }) {
  const { role, shopId } = await params;

  const vm = (await fetchMyShopProductsRawSSR({ shopId: Number(shopId) })) as ShopViewModel;
  console.log(vm);
  const shopInfo: any = (vm as any)?.shopInfo || {};
  console.log(shopInfo)
  const products: UserProductView[] = Array.isArray((vm as any)?.products) ? (vm as any).products : [];
  const labels = await buildShopLabels("fa", products.length);

  return (
    <div dir="rtl" className=" max-w-md mx-auto">
      <ShopHeader
        t={labels}
        info={vm}
      />
      <div className="mt-4 px-4">

      <div className="mt-4 text-sm text-gray-700">{labels.productsCountText} : {products.length}</div>

      <ShopProductsList role={role} products={products} />

      
      </div>
    </div>
  );
}

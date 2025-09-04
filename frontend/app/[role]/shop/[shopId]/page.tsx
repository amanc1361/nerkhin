
import type { ShopViewModel, UserProductView } from "@/app/types/userproduct/userProduct";
import ShopHeader from "@/app/components/shop/ShopHeader";
import ShopProductsList from "@/app/components/shop/ShopProductsList";
import { buildShopLabels } from "@/lib/server/118n/buildShopLabels";
import { fetchMyShopProductsRawSSR } from "@/lib/server/userProductAction";
import { getMyFavoriteAccounts } from "@/lib/server/faviroteAccount";

/* افزوده: فقط برای SSR علاقه‌مندی‌ها */


type Role = "wholesaler" | "retailer";

export default async function Page({
  params,
}: { params: Promise<{ role: Role; shopId: string }> }) {
  const { role, shopId } = await params;

  const vm = (await fetchMyShopProductsRawSSR({ shopId: Number(shopId) })) as ShopViewModel;

  const shopInfo: any = (vm as any)?.shopInfo || {};
  const products: UserProductView[] = Array.isArray((vm as any)?.products) ? (vm as any).products : [];
  const labels = await buildShopLabels("fa", products.length);

  // --- فقط همین تکه مهم است: ownerUserId را تضمین می‌کنیم + وضعیت لایک را ست می‌کنیم
  // از هر فیلدی که موجود است، آی‌دی صاحب فروشگاه را برمی‌داریم
  const ownerUserId =
    Number(shopInfo?.ownerUserId) ||
    Number(shopInfo?.userId) ||
    Number((vm as any)?.ownerUserId) ||
    Number((await params).shopId) ||
    0;

    let favorites: any[] = [];
    try {
      favorites = await getMyFavoriteAccounts(); // ← خروجی مستقیم: FavoriteAccount[]
      if (!Array.isArray(favorites)) favorites = [];
    } catch {
      favorites = [];
    }
    
    // 3) مچ‌کردن خیلی ساده: targetUserId با ownerUserId
    const fav = ownerUserId > 0
      ? favorites.find((f) => Number(f?.targetUserId) === ownerUserId)
      : undefined;
    
    // 4) پرکردن فلگ‌ها داخل shopInfo
    const enhancedVm: ShopViewModel = {
      ...(vm as any),
      shopInfo: {
        ...((vm as any)?.shopInfo ?? {}),
        ownerUserId,                         // حتماً ست می‌کنیم تا کلاینت targetUserId داشته باشه
        isLikedByViewer: Boolean(fav),       // برای رنگ دکمه
        favoriteId: fav?.id ?? null,         // برای حذف
      },
    } as ShopViewModel;
  // --- پایان تکه مهم

  return (

    <div dir="rtl" className=" max-w-md mx-auto">
      
      <ShopHeader
        t={labels}
        info={enhancedVm}  // ← همین باعث می‌شود دکمه فعال شود و متد داخلی فراخوانی گردد
      />
      <div className="mt-4 px-4">
        <div className="mt-4 text-sm text-gray-700">
          {labels.productsCountText} : {products.length}
        </div>
        <ShopProductsList role={role} products={products} />
      </div>
    </div>
  );
}

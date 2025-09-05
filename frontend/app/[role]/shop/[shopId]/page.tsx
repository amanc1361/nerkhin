// app/[role]/shop/[shopId]/page.tsx
import type { ShopViewModel, UserProductView } from "@/app/types/userproduct/userProduct";
import ShopHeader from "@/app/components/shop/ShopHeader";
import ShopProductsList from "@/app/components/shop/ShopProductsList";
import { buildShopLabels } from "@/lib/server/118n/buildShopLabels";
/**
 * نکته: این تابع باید در فایل سروری خودت موجود باشد.
 * امضا: async function fetchShopByUserIdSSR({ userId }: { userId: number }): Promise<ShopViewModel>
 * این تابع داخل خودش به روت جدید (مثلاً GET /user-product/shop/:uid) می‌زند و خروجی ShopViewModel برمی‌گرداند.
 */
import { fetchShopByUserIdSSR } from "@/lib/server/userProductAction";
import { getMyFavoriteAccounts } from "@/lib/server/faviroteAccount";

type Role = "wholesaler" | "retailer";

export default async function Page({
  params,
}: {
  params: { role: Role; shopId: string }; // ← دیگر Promise نیست
}) {
  const { role, shopId } = params;

  // ⚠️ در روت جدید uid همان ownerUserId است؛ ما از shopId موجود در URL به‌عنوان userId استفاده می‌کنیم.
  const vm = (await fetchShopByUserIdSSR({ userId: Number(shopId) })) as ShopViewModel;

  const shopInfo: any = (vm as any)?.shopInfo || {};
  const products: UserProductView[] = Array.isArray((vm as any)?.products)
    ? (vm as any).products
    : [];

  const labels = await buildShopLabels("fa", products.length);

  // --- استخراج ownerUserId و تزریق فلگ‌های علاقه‌مندی
  const ownerUserId =
    Number(shopInfo?.ownerUserId) ||
    Number(shopInfo?.userId) ||
    Number((vm as any)?.ownerUserId) ||
    Number(shopId) || // از پارامتر URL به‌عنوان fallback
    0;

  let favorites: any[] = [];
  try {
    favorites = await getMyFavoriteAccounts(); // FavoriteAccount[]
    if (!Array.isArray(favorites)) favorites = [];
  } catch {
    favorites = [];
  }

  const fav =
    ownerUserId > 0
      ? favorites.find((f) => Number(f?.targetUserId) === ownerUserId)
      : undefined;

  const enhancedVm: ShopViewModel = {
    ...(vm as any),
    shopInfo: {
      ...((vm as any)?.shopInfo ?? {}),
      ownerUserId,
      isLikedByViewer: Boolean(fav),
      favoriteId: fav?.id ?? null,
    },
  } as ShopViewModel;
  // --- پایان تزریق

  return (
    <div dir="rtl" className="max-w-md mx-auto">
      <ShopHeader t={labels} info={enhancedVm} />
      <div className="mt-4 px-4">
        <div className="mt-4 text-sm text-gray-700">
          {labels.productsCountText} : {products.length}
        </div>
        <ShopProductsList role={role} products={products} />
      </div>
    </div>
  );
}

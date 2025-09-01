// app/[role]/product/[productId]/page.tsx
import ProductGallery from "@/app/components/market/ProductGallery";
import ProductActionBar from "@/app/components/market/ProductActionBar";
import ShopOffersList from "@/app/components/market/ShopOffersList";

import { getMarketMessages } from "@/lib/server/texts/marketMessages";
import { ProductInfoViewModel } from "@/app/types/userproduct/ProductInfoViewModel";
import { buildGalleryFromDefault } from "@/app/utils/iamge";
import { fetchProductInfoSSR } from "@/lib/server/fetchProductinfo";

type Role = "wholesaler" | "retailer";

export default async function Page(
  { params }: { params: Promise<{ role: Role; productId: string }> } // ← اگر constraintت Promise می‌خواد
) {
  const { productId: pidStr } = await params;
  const t = getMarketMessages("fa");
  const productId = Number(pidStr);

  const data: ProductInfoViewModel = await fetchProductInfoSSR(productId);
  const p = data.productInfo;
  const images = buildGalleryFromDefault(p.id, p.imagesCount??1);

  return (
    <div dir="rtl" className="px-4 py-3 max-w-2xl mx-auto text-right">
      <h1 className="text-base font-semibold mb-2">
        {p.categoryTitle} / {p.brandTitle} — {p.modelName}
      </h1>

      <ProductGallery images={images} alt={`${p.brandTitle} ${p.modelName}`} />
     
      <ProductActionBar
        t={{ specs: t.action.specs, compare: t.action.compare, favorite: t.action.favorite }}
      />



      <ShopOffersList
        t={{
          // فقط متن/تمپلیت؛ تابع نده
          sellerCountTemplate: t.common.sellerCount, // مثل: "تعداد فروشنده: {n}"
          call: t.common.call,
          city: t.common.city,
        }}
        items={data.shopProducts}
      />
    </div>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ role: Role; productId: string }> }
) {
  try {
    const { productId: pidStr } = await params;
    const t = getMarketMessages("fa");
    const pid = Number(pidStr);
    const data = await fetchProductInfoSSR(pid);
    const p = data.productInfo;
    return { title: `${p.brandTitle} ${p.modelName} | ${t.search}`, description: p.description };
  } catch {
    return { title: "Product" };
  }
}

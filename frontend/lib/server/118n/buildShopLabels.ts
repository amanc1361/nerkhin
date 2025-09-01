// lib/server/i18n/buildShopLabels.ts
"use server";

import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";

/** خروجی 100% قابل‌سریالایز برای پاس‌دادن به کلاینت‌ها */
export async function buildShopLabels(locale: "fa" | "en", productsCount: number) {
  const t = getUserProductMessages(locale);

  return {
    showOnMap: t?.shop?.showOnMap ?? "",
    report: t?.shop?.report ?? "",
    like: t?.shop?.like ?? "",
    address: t?.shop?.address ?? "",
    phones: t?.shop?.phones ?? "",
    city: t?.shop?.city ?? "",
    back: t?.shop?.back ?? "",
    // هر تابعی مثل productsCount اینجا ارزیابی می‌شود تا رشته شود
    productsCountText:t?.shop?.productsCount,
     
    emptyProducts: t?.shop?.empty??"",
  };
}

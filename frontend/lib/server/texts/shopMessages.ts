// lib/server/texts/shopMessages.ts
export type ShopMessages = {
    titleFallback: string;
    buttons: {
      showOnMap: string;
      report: string;
      like: string;
    };
    labels: {
      productsCount: (n: number) => string;
      phones: string;
      address: string;
      city: string;
    };
    empty: {
      products: string;
    };
  };
  
  const fa: ShopMessages = {
    titleFallback: "فروشگاه",
    buttons: {
      showOnMap: "نمایش روی نقشه",
      report: "گزارش تخلف",
      like: "پسندها",
    },
    labels: {
      productsCount: (n) => `محصولات فروشگاه: ${n}`,
      phones: "شماره‌های تماس",
      address: "آدرس",
      city: "شهر",
    },
    empty: { products: "هیچ محصولی یافت نشد." },
  };
  
  const en: ShopMessages = {
    titleFallback: "Shop",
    buttons: {
      showOnMap: "Show on map",
      report: "Report",
      like: "Likes",
    },
    labels: {
      productsCount: (n) => `Shop products: ${n}`,
      phones: "Phones",
      address: "Address",
      city: "City",
    },
    empty: { products: "No products found." },
  };
  
  export function getShopMessages(locale: "fa" | "en" = "fa"): ShopMessages {
    return locale === "en" ? en : fa;
  }
  
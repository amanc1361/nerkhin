// lib/texts/marketMessages.ts
export type MarketMessages = {
  datePrefix: string;
  searchPlaceholder: string;
  searchCta: string;
  categoriesTitle: string;
  menu: {
    search: string;
    myAccount: string;
    myProducts: string;
  };
  emptyState: string;
  errorState: string;
};

export const getMarketMessages = (locale: "fa" | "en" = "fa"): MarketMessages => {
  if (locale === "en") {
    return {
      datePrefix: "Date",
      searchPlaceholder: "Search…",
      searchCta: "Search for a product",
      categoriesTitle: "Popular categories",
      menu: { search: "Search", myAccount: "My Account", myProducts: "My Products" },
      emptyState: "No category found.",
      errorState: "Could not load categories.",
    };
  }

  // fa (default)
  return {
    datePrefix: "تاریخ",
    searchPlaceholder: "جستجو…",
    searchCta: "کالای مورد نظر را جستجو کنید",
    categoriesTitle: "دسته‌های پر‌جستجو",
    menu: { search: "جستجو", myAccount: "حساب من", myProducts: "محصولات من" },
    emptyState: "دسته‌ای یافت نشد.",
    errorState: "خطا در دریافت دسته‌بندی‌ها.",
  };
};

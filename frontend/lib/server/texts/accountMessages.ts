// lib/texts/accountMessages.ts
export type AccountMessages = {
  header: {
    roleWholesale: string;
    roleRetail: string;
    badgeText: (roleLabel: string) => string;
    validityPrefix: string;
    months: string;
    days: string;
  };
  actions: {
    editShop: string;
    extendAccount: string;
  };
  list: {
    likes: string;
    transactions: string;
    rules: string;
    customers: string; // فقط برای عمده‌فروش نمایش داده می‌شود
  };
  empty: {
    noSubscription: string;
  };
};

export const getAccountMessages = (locale: "fa" | "en" = "fa"): AccountMessages => {
  if (locale === "en") {
    return {
      header: {
        roleWholesale: "Wholesaler",
        roleRetail: "Retailer",
        badgeText: (r) => `Store | ${r}`,
        validityPrefix: "Account validity:",
        months: "months",
        days: "days",
      },
      actions: { editShop: "Edit Shop", extendAccount: "Extend Account" },
      list: { likes: "My Likes", transactions: "My Transactions", rules: "Rules & Policies", customers: "My Customers" },
      empty: { noSubscription: "No active subscription" },
    };
  }

  // fa
  return {
    header: {
      roleWholesale: "عمده‌فروش",
      roleRetail: "خرده‌فروش",
      badgeText: (r) => `فروشگاه | ${r}`,
      validityPrefix: "اعتبار حساب:",
      months: "ماه",
      days: "روز",
    },
    actions: { editShop: "ویرایش فروشگاه", extendAccount: "تمدید حساب" },
    list: { likes: "پسندهای من", transactions: "تراکنش‌های من", rules: "قوانین و مقررات", customers: "مشتریان من" },
    empty: { noSubscription: "اشتراک فعالی ثبت نشده" },
  };
};

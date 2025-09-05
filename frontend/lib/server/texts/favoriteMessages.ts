export function getFavoriteMessages(lang: "fa" | "en" = "fa") {
    if (lang === "fa") {
      return {
        title: "پسندهای فروشگاه من",
        shopLink: "فروشگاه",
        retailer: "خرده فروش",
        wholesaler: "عمده فروش",
        person: "کاربر",
        empty: "هنوز کسی فروشگاه شما را پسند نکرده است.",
      };
    }
    return {
      title: "People who liked my shop",
      shopLink: "Shop",
      retailer: "Retailer",
      wholesaler: "Wholesaler",
      person: "User",
      empty: "No likes yet.",
    };
  }
  
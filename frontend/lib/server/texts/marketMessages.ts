// lib/texts/marketMessages.ts
export type MarketMessages = {
  datePrefix: string;
  searchPlaceholder: string;
  searchCta: string;
    subcategoriesTitle: string;

  categoriesTitle: string;
  action:{
    search: string;
    back: string;
    compare:string;
    like:string;
    bookmark:string;
    
  };
  money:{
    usdShort:string;
  }
  search :{
    placeholder: string;
    filters: string;
    pickCity: string;
    export: string;
  };
  common:{
    loading: string;
    of:string;
  }
  list:{
    empty: string;
  }
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
      action:{
        search: "Search",
        back: "Back",
        bookmark:"bookmark",
        compare:"compare",
        like:"like",
      },
      search:{
        placeholder: "Search…",
        filters: "Filters",
        pickCity: "Pick a city",
        export: "Export",
      },
      common:{
        loading: "Loading...",
        of:"off",
      },
      list:{
        empty: "No results.",
      },
      money:{
        usdShort:"Dollar",
      },
      datePrefix: "Date",
      searchPlaceholder: "Search…",
      searchCta: "Search for a product",
      categoriesTitle: "Popular categories",
      menu: { search: "Search", myAccount: "My Account", myProducts: "My Products" },
      emptyState: "No category found.",
      errorState: "Could not load categories.",
            subcategoriesTitle: "Subcategories",

    };
  }

  // fa (default)
  return {
    action:{
      search: "جستجو",
      back: "بازگشت",
      bookmark:"علامت گذاری",
      compare:"مقایسه",
      like:"پسند",
    },
    search:{
      placeholder: "جستجو…",
      filters: "فیلترها",
      pickCity: "انتخاب شهر",
      export: "تصدير",
    },
    common:{
      of:"از",
      loading: "در حال بارگزاری...",
    },
    money:{
      usdShort:"دلار"
    },
    list:{
      empty: "نتيجه ای یافت نشد.",
    },
    datePrefix: "تاریخ",
    searchPlaceholder: "جستجو…",
    searchCta: "کالای مورد نظر را جستجو کنید",
    categoriesTitle: "دسته‌های پر‌جستجو",
    menu: { search: "جستجو", myAccount: "حساب من", myProducts: "محصولات من" },
    emptyState: "دسته‌ای یافت نشد.",
    errorState: "خطا در دریافت دسته‌بندی‌ها.",
        subcategoriesTitle: "زیرشاخه‌ها",

  };
};




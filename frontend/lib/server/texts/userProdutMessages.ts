// lib/texts/userProductMessages.ts
export type UserProductMessages = {
  title: string;
  loading: string;
  modals: {
    delete: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
  };
  shop :{
    showOnMap: string;
    report: string;
    like: string;
    address: string;
    phones: string;
    city: string;
    productsCount:  string;
    empty: string;
    back:string;
  }
  editModal: {
    title: string;
    cancelBtn: string;
    saveBtn: string;
  };
  toolbar: {
    share: string;
    jpg: string;
    pdf: string;
    save: string;
    priceList: string;
    dollarPrice: (price: string) => string;
    addProduct: string;
  };
  filters: {
    title: string
    brand: string
    brandAll: string
    category: string
    subCategory: string
    priceType: string
    priceAny: string
    priceDollar: string
    priceRial: string
    sortUpdated: string
    sortNewest: string
    sortOldest: string
    searchPlaceholder: string
    apply: string
    clear: string
  };
  summary: (count: number) => string;
  headers: { currency: string; sort: string; product: string };
  item: {
    edit: string;
    delete: string;
    hide: string;
    show: string;
    hidden: string;
    confirmDeleteTitle: string;
    confirmDeleteText: string;
    confirm: string;
    cancel: string;
    moveUp: string;
    moveDown: string;
    hiddenBadge: string;
  };
  empty: { title: string; subtitle: string; cta: string };
  toasts: {
    deleted: string;
    updated: string;
    statusChanged: string;
    orderSaved: string;
    error: string;
  };
  /** متن‌های فرم افزودن محصول عمده‌فروش */
  form: {
    brandLabel: string;
    productLabel: string;
    searchPlaceholder: string;
    toggleDollar: string;
    dollarPriceLabel: string;
    otherCostsLabel: string;
    finalPriceLabel: string;
    addBtn: string;
    requestBtn: string;
    priceTitle: string;
    currencySuffix: string;
    notes: {
      dailyDollar: string;
      fees: string;
      notFound: string;
    };
    validations: {
      brand: string;
      product: string;
      dollarPrice: string;
      finalPrice: string;
    };
  };
};

export const getUserProductMessages = (locale: "fa" | "en" = "fa"): UserProductMessages => {
  if (locale === "en") {
    return {
      shop:{
        back:"Back",
        showOnMap: "Show on map",
        report: "Report",
        like: "Likes",
        address: "Address",
        phones: "Phones",
        city: "City",
        productsCount: "Products count",
        empty: "Empty",
      },
      loading: "Loading...",
      title: "My Products",
      filters:{
        title: "Filters",
        brand: "Brand",
        brandAll: "All",
        category: "Category",
        subCategory: "Subcategory",
        priceType: "Price type",
        priceAny: "Any",
        priceDollar: "Dollar",
        priceRial: "Rial",
        sortUpdated: "Updated",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        searchPlaceholder: "Search...",
        apply: "Apply",
        clear: "Clear",
      },
      modals: {
        delete: {
          title: "Remove product",
          message: "Are you sure you want to delete this product?",
          confirm: "Yes",
          cancel: "Cancel",
        },
      },
      
      editModal: {
        title: "Edit product",
        cancelBtn: "Cancel",
        saveBtn: "Save",
      },
      toolbar: {
        share: "Price list",
        save: "Save",
        jpg: "JPG",
        priceList: "priceList",
        pdf: "PDF",
        dollarPrice: (p) => `USD price: ${p}`,
        addProduct: "Add product",
      },
      summary: (c) => `Shop products: ${c} item${c === 1 ? "" : "s"}`,
      headers: { currency: "Currency", sort: "Sort", product: "Product" },
      item: {
        edit: "Edit",
        delete: "Delete",
        hide: "Hide",
        show: "Show",
        hidden: "Hidden",
        confirmDeleteTitle: "Remove product",
        confirmDeleteText: "Are you sure you want to delete this product?",
        confirm: "Yes",
        cancel: "Cancel",
        moveUp: "Move up",
        moveDown: "Move down",
        hiddenBadge: "Hidden",
      },
      empty: {
        title: "No products yet",
        subtitle: "Start by adding your first product.",
        cta: "Add product",
      },
      toasts: {
        deleted: "Product deleted",
        updated: "Saved successfully",
        statusChanged: "Visibility changed",
        orderSaved: "Order updated",
        error: "Something went wrong",
      },
      form: {
        brandLabel: "Select brand",
        productLabel: "Select model",
        searchPlaceholder: "Search model...",
        toggleDollar: "Enter USD price",
        dollarPriceLabel: "USD price (visible only to you)",
        otherCostsLabel: "Rial costs (visible only to you)",
        finalPriceLabel: "Sale price (Rial)",
        addBtn: "Add product",
        requestBtn: "Request product",
        priceTitle: "Sale price",
        currencySuffix: "Toman",
        notes: {
          dailyDollar: "Enter the day's USD rate so final prices update.",
          fees: "If there are extra costs like shipping, enter them.",
          notFound: "If you can't find the product, use Request product.",
        },
        validations: {
          brand: "Please select a brand.",
          product: "Please select a model.",
          dollarPrice: "Please enter the USD price.",
          finalPrice: "Please enter the sale price.",
        },
      },
    };
  }

  return {
    shop:{
      back:"برگشت",
      showOnMap:"نمایش روی نقشه",
      report:"گزارش",
      like:"لایک",
      address:"آدرس",
      phones:"تلفن",
      city:"شهر",
      productsCount:"محصولات",
      empty:"هیچ محصولی وجود ندارد",
    },
    loading: "در حال بارگزاری..",
    title: "محصولات من",
    filters: {
      title: "فیلترها",
      brand: "برند",
      brandAll: "همه",
      category: "دسته",
      subCategory: "زیردسته",
      priceType: "نوع قیمت",
      priceAny: "هر دو",
      priceDollar: "دلار",
      priceRial: "ریال",
      sortUpdated: "به روز رسانی شده",
      sortNewest: "جدیدترین",
      sortOldest: "قدیمیترین",
      searchPlaceholder: "جستجو...",
      apply: "اعمال",
      clear: "پاک کردن",
    },
    modals: {
      delete: {
        title: "حذف محصول",
        message: "از حذف این محصول مطمئن هستید؟",
        confirm: "بله",
        cancel: "انصراف",
      },
    },
    editModal: {
      title: "ویرایش محصول",
      cancelBtn: "انصراف",
      saveBtn: "ذخیره",
    },
    toolbar: {
      share: "لیست قیمت",
      save: "ذخیره",
      priceList: "لیست قیمت",
      jpg: "JPG",
      pdf: "PDF",
      dollarPrice: (p) => `قیمت دلار: ${p}`,
      addProduct: "افزودن محصول",
    },
    summary: (c) => `محصولات فروشگاه: ${c} محصول`,
    headers: { currency: "ارز", sort: "ترتیب", product: "کالا" },
    item: {
      edit: "ویرایش",
      delete: "حذف",
      hide: "عدم نمایش",
      show: "نمایش",
      hidden: "غیرفعال",
      confirmDeleteTitle: "حذف محصول",
      confirmDeleteText: "از حذف این محصول مطمئن هستید؟",
      confirm: "بله",
      cancel: "انصراف",
      moveUp: "بالا",
      moveDown: "پایین",
      hiddenBadge: "غیرفعال",
    },
    empty: {
      title: "محصولی ثبت نشده",
      subtitle: "از دکمه افزودن محصول شروع کنید.",
      cta: "افزودن محصول",
    },
    toasts: {
      deleted: "محصول حذف شد",
      updated: "ذخیره شد",
      statusChanged: "وضعیت نمایش تغییر کرد",
      orderSaved: "ترتیب ذخیره شد",
      error: "خطایی رخ داد",
    },
    form: {
      brandLabel: "انتخاب برند",
      productLabel: "انتخاب مدل",
      searchPlaceholder: "جستجوی مدل...",
      toggleDollar: "وارد کردن قیمت دلاری",
      dollarPriceLabel: "قیمت دلاری محصول (تنها شما آن را می‌بینید)",
      otherCostsLabel: "هزینه‌های ریالی (تنها شما آن را می‌بینید)",
      finalPriceLabel: "قیمت فروش (تومان)",
      addBtn: "افزودن محصول",
      requestBtn: "درخواست محصول",
      priceTitle: "قیمت فروش",
      currencySuffix: "تومان",
      notes: {
        dailyDollar: "قیمت دلار روز را وارد کنید تا قیمت نهایی کالاها به‌روز شود.",
        fees: "در صورت داشتن هزینه‌های جانبی مثل کرایه بار، آن را وارد کنید.",
        notFound: "اگر محصول مدنظر را پیدا نکردید، گزینهٔ درخواست محصول را بزنید.",
      },
      validations: {
        brand: "لطفاً برند را انتخاب کنید.",
        product: "لطفاً مدل را انتخاب کنید.",
        dollarPrice: "لطفاً قیمت دلاری را وارد کنید.",
        finalPrice: "لطفاً قیمت فروش را وارد کنید.",
      },
    },
  };
};

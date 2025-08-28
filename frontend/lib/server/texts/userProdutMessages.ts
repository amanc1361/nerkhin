// lib/texts/userProductMessages.ts
export type UserProductMessages = {
  title: string;
  toolbar: {
    share: string;
    jpg: string;
    pdf: string;
    save: string;
    priceList:string;
    dollarPrice: (price: string) => string;
    addProduct: string;
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
  };
  empty: { title: string; subtitle: string; cta: string };
  toasts: {
    deleted: string;
    updated: string;
    statusChanged: string;
    orderSaved: string;
    error: string;
  };
};

export const getUserProductMessages = (locale: "fa" | "en" = "fa"): UserProductMessages => {
  if (locale === "en") {
    return {
      title: "My Products",
      toolbar: {
        share: "Price list",
        save: "Save",
        jpg: "JPG",
        priceList:"priceList",
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
    };
  }

  return {
    title: "محصولات من",
    toolbar: {
      share: "لیست قیمت",
      save: "ذخیره",
      priceList:"لیست قیمت",
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
  };
};

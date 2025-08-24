// lib/texts/shopEditMessages.ts
export type ShopEditMessages = {
  title: string;
  changeImage: string;
  fields: {
    shopName: string;
    phone1: string;
    phone2: string;
    phone3: string;
    address: string;
    description: string;
    map: string;
  };
  socials: {
    title: string;
    add: string;
    edit: string;
    remove: string;
    instagram: string;
    telegram: string;
    website: string;
    whatsapp: string;
    placeholder: string;
  };
  actions: {
    save: string;
    saving: string;
    saved: string;
    cancel: string;
  };
  errors: {
    unknown: string;
  };
};

export const getShopEditMessages = (locale: "fa" | "en" = "fa"): ShopEditMessages => {
  if (locale === "en") {
    return {
      title: "Edit Shop",
      changeImage: "Change image",
      fields: {
        shopName: "Shop title",
        phone1: "Phone 1",
        phone2: "Phone 2",
        phone3: "Phone 3",
        address: "Shop address",
        description: "Description",
        map: "Map",
      },
      socials: {
        title: "Social networks",
        add: "Add",
        edit: "Edit",
        remove: "Remove",
        instagram: "Instagram",
        telegram: "Telegram",
        website: "Website",
        whatsapp: "WhatsApp",
        placeholder: "e.g. instagram.com/yourshop",
      },
      actions: { save: "Save", saving: "Saving…", saved: "Saved", cancel: "Cancel" },
      errors: { unknown: "Something went wrong." },
    };
  }

  // fa
  return {
    title: "ویرایش فروشگاه",
    changeImage: "ویرایش تصویر",
    fields: {
      shopName: "عنوان فروشگاه",
      phone1: "تلفن ۱",
      phone2: "تلفن ۲",
      phone3: "تلفن ۳",
      address: "آدرس فروشگاه",
      description: "توضیحات",
      map: "نقشه",
    },
    socials: {
      title: "شبکه‌های مجازی",
      add: "افزودن",
      edit: "ویرایش",
      remove: "حذف",
      instagram: "اینستاگرام",
      telegram: "تلگرام",
      website: "وب‌سایت",
      whatsapp: "واتس‌اپ",
      placeholder: "مثلاً instagram.com/yourshop",
    },
    actions: { save: "ذخیره تغییرات", saving: "در حال ذخیره…", saved: "ذخیره شد", cancel: "انصراف" },
    errors: { unknown: "خطایی رخ داد." },
  };
};

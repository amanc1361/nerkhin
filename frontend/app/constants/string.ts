// مثلا در: constants/siteTexts.ts

interface SiteTexts {
  siteName: string;
  siteDescription: string; // توضیحات کلی سایت برای متا تگ‌ها و موارد مشابه

  header: {
    navLinks: {
      aboutUs: string;
      services: string;
      contactUs: string;
    };
    authButton: string;
  };

  hero: {
    titleHighlight: string;
    mainSloganLines: string[];
    secondarySloganLines: string[];
  };

  aboutUs: {
    sectionTitle: string;
    card1: {
      title: string;
      text: string;
    };
    card2: {
      title: string;
      listItems: string[];
    };
  };

  services: {
    sectionTitle: string;
    introLines: string[];
    listItems: string[];
  };

  contactUs: {
    sectionTitle: string;
    intro: string;
    phoneLabel: string;
    phoneNumbers: string[];
    emailLabel: string;
    emailValue: string;
    emailLinkText: string; // متنی که برای لینک ایمیل نمایش داده می‌شود
  };

  footer: {
    copyright: string;
    enamadAltText: string;
  };
}

export const siteTexts: SiteTexts = {
  siteName: 'نرخین',
  siteDescription: 'با استفاده از وب سایت نرخین از به روز ترین قیمتهای عمده فروشان سراسر کشور باخبر شوید',

  header: {
    navLinks: {
      aboutUs: 'درباره ما',
      services: 'خدمات',
      contactUs: 'تماس با ما',
    },
    authButton: 'ورود/ثبت نام',
  },

  hero: {
    titleHighlight: 'نرخین', // می‌تواند از siteName هم گرفته شود
    mainSloganLines: ['شفافیت، سرعت و ارتباط آسان', 'برای بازار لوازم خانگی'],
    secondarySloganLines: ['یک پل ارتباطی مطمئن', 'بین عمده‌فروشان و خرده‌فروشان لوازم خانگی'],
  },

  aboutUs: {
    sectionTitle: 'ما کی هستیم؟',
    card1: {
      title: 'درباره ما',
      text: 'نرخین جایی است که فناوری و تجارت به هم می‌رسند. ما در تلاشیم تا با ایجاد بازاری شفاف و امن، خریدوفروش در صنعت لوازم خانگی را به سطحی جدید ببریم.',
    },
    card2: {
      title: 'ماموریت ما',
      listItems: [
        'کمک به عمده‌فروشان برای شناسایی و هدف‌گذاری مشتریان.',
        'ارائه دسترسی آسان به خرده‌فروشان برای مقایسه و انتخاب بهترین تأمین‌کنندگان.',
        'کمک به عمده‌فروشان برای شناسایی و هدف‌گذاری مشتریان.', // این مورد در کد اصلی شما تکرار شده بود
        'ایجاد بازاری کارآمد، شفاف و قابل‌اعتماد برای همه.',
      ],
    },
  },

  services: {
    sectionTitle: 'خدمات',
    introLines: ['چرا نرخین را انتخاب کنید؟', 'ما خدمات زیر را ارائه می‌دهیم تا تجارت شما هوشمندتر و سریع‌تر شود:'],
    listItems: [
      'دسترسی به قیمت‌های لحظه‌ای: مشاهده قیمت‌ها به‌صورت آنلاین و به‌روز.',
      'هدف‌گذاری هوشمند: ابزارهایی برای عمده‌فروشان جهت شناسایی بازار هدف.',
      'ارتباط مستقیم: امکان مذاکره و معامله مستقیم با طرف مقابل.',
      'پشتیبانی قوی: تیمی متعهد برای رفع نیازهای شما در هر لحظه.',
    ],
  },

  contactUs: {
    sectionTitle: 'تماس با ما',
    intro: 'همین حالا در تماس باشید ما آماده‌ایم تا به تمام سوالات شما پاسخ دهیم:',
    phoneLabel: 'تلفن:',
    phoneNumbers: ['09183543211', '08734216568'],
    emailLabel: 'ایمیل:',
    emailValue: 'nerrkhin@gmail.com',
    emailLinkText: 'nerrkhin@gmail.com',
  },
  

  footer: {
    copyright: 'کلیه حقوق مادی و معنوی این وب سایت برای کامران محمد زردی محفوظ است',
    enamadAltText: 'نماد اعتماد الکترونیکی',
  },
};
const authPageMessages = {
  accessDenied: "دسترسی ندارید لطفا دوباره وارد شوید",
  roleError: "خطایی در دریافت نقش کاربر رخ داده است. لطفاً دوباره وارد شوید",
  loginIconAlt: "آیکون ورود کاربر", // متن جایگزین بهتر برای تصویر
};
// ثابت‌ها برای IDهای انکرها (لینک‌های داخلی صفحه)
export const ANCHOR_IDS = {
  ABOUT_US: "aboutUsAnchor",
  SERVICES: "servicesAnchor",
  CONTACT_US: "contactUsAnchor",
};
// مثلاً در فایل: constants/authMessages.ts
export const loginFormMessages = {
  phoneNumberLabel: "شماره همراه خود را وارد کنید",
  phoneNumberPlaceholder: "شماره همراه",
  sendVerificationCode: "ارسال کد تایید",
  noAccount: "حساب کاربری ندارید؟ ثبت نام کنید",
  signInError: "خطا در ورود. لطفا دوباره تلاش کنید.",
  invalidPhoneNumber: "لطفا شماره همراه معتبر را وارد کنید.",
  // می‌توانید پیام‌های موفقیت یا سایر موارد را هم اینجا اضافه کنید
};
// مثلاً در فایل: constants/authMessages.ts (ادامه موارد قبلی)
export const verifyCodeMessages = {
  formTitle: "کد تایید به شماره {phone} ارسال شد", // {phone} یک placeholder است
  codeInputPlaceholder: "کد تایید",
  submitButton: "ثبت",
  success: "ورود موفقیت آمیز. خوش آمدید!",
  errorCodeVerification: "خطا در تایید کد.",
  retryErrorCodeVerification: "خطا در تایید کد. لطفا دوباره تلاش کنید.",
  adminPanelRedirect: "/panel", // مسیر پنل ادمین
  userDashboardRedirect: "/bazaar", // مسیر داشبورد کاربر
};
// مثلاً در فایل: constants/authMessages.ts (ادامه موارد قبلی)
export const signUpFormMessages = {
  formTitle: "ایجاد حساب کاربری جدید", // مثال، اگر عنوانی برای فرم دارید
  fullNameLabel: "نام و نام خانوادگی",
  fullNamePlaceholder: "نام و نام خانوادگی خود را وارد کنید",
  phoneLabel: "شماره موبایل",
  phonePlaceholder: "مثال: 09123456789",
  userTypeLabel: "نوع کاربری",
  userTypePlaceholder: "نوع کاربری خود را انتخاب کنید",
  userTypeWholesaler: "عمده فروش",
  userTypeRetailer: "خرده فروش",
  cityLabel: "انتخاب شهر",
  cityPlaceholder: "شهر خود را انتخاب کنید",
  submitButton: "ثبت نام",
  loginRedirectButton: "حساب کاربری دارید؟ وارد شوید",
  validationError: "لطفا مقادیر معتبر را وارد کنید.",
  cityFetchError: "خطا در دریافت لیست شهرها",
  signUpSuccess: "ثبت نام با موفقیت انجام شد. کد تایید برای شما ارسال خواهد شد.", // یا هدایت به صفحه تایید
  signUpServerError: "خطا در سمت سرور یا مشکل در اتصال اینترنت. لطفا دوباره تلاش کنید.",
  genericSignUpError: "خطا در فرآیند ثبت نام.",
};
// مثلاً در constants/pageMessages.ts یا بالای فایل کامپوننت
export const authStatusMessages = {
  pageTitle: "وضعیت ثبت نام", // برای <title> متا تگ صفحه، اگر این یک صفحه کامل است
  sentIconAlt: "علامت تایید", // یا "عملیات موفقیت آمیز"
  statusLabel: "وضعیت",
  signUpSuccessMessage: "ثبت نام موفقیت آمیز",
  approvalPendingInfo: "اطلاعات کاربر شما ثبت شد. پس از تایید مدیران سایت میتوانید وارد حساب کاربری خود شوید.",
  backToLoginButton: "بازگشت به صفحه ورود",
};
// constants/panelMessages.ts
export const panelMessages = {
  panelTitle: "پنل مدیریت نرخین",
  dashboard: "داشبورد",
  cities: "شهرها",
  categories: "دسته‌بند‌ی‌ها",
  products: "محصولات",
  users: "کاربران",
  reports: "تخلفات", // یا گزارش‌ها
  admins: "ادمین‌ها",
  usersubscriptions:"مشترکین",
  subscriptions: "تعرفه‌ها", // یا اشتراک‌ها
  logout: "خروج از حساب کاربری", // برای Logoutbtn اگر متن دارد
};
// فایل: constants/dashboardMessages.ts
export const dashboardMessages = {
  requestedProductsTitle: "کالاهای درخواستی",
  newProductsLink: "/panel/products/new-products",
  noProductRequests: "هیچ کالای درخواستی وجود ندارد",
  productRequestImageAlt: "تصویر پیش‌فرض کالا", // یا از product.description استفاده شود

  newUsersTitle: "کاربران جدید",
  newUsersLink: "/panel/users/new-users",
  noNewUsers: "هیچ کاربر جدیدی وجود ندارد",

  reportsTitle: "گزارشات تخلفات",
  newReportsLink: "/panel/reports/new-reports",
  noReports: "هیچ تخلفی وجود ندارد",
  viewAll: "نمایش همه",
  onlineUsersTitle: "تعداد کاربران آنلاین",
  onlineUsersCount: "۲۴", // این فعلاً ثابت است، اگر قرار است داینامیک باشد، باید از API بیاید
  onlineUsersUnit: "نفر",
     wholesaler: "عمده فروش",
  retailer: "خرده فروش",
   dateFormat: "jYYYY/jMM/jDD",

  // پیام‌های خطا
  dataFetchError: "خطا در دریافت اطلاعات یا نبود اینترنت",
};
export const panelProductNavLabels = {
  requestedProducts: "کالاهای درخواستی",
  approvedProducts: "کالاهای ثبت شدە", 
  addNewProduct: "افزودن کالای جدید",
};

export const cityMessages = {
  pageTitle: "مدیریت شهرها", // (برای متا تگ title یا عنوان صفحه)
  addNewCityButton: "افزودن شهر جدید",
  errorFetchingCities: "خطا در دریافت لیست شهرها یا نبود اینترنت",
  errorAddingCity: "خطا در افزودن شهر. لطفا مقادیر معتبر وارد کنید.",
  errorServerAddingCity: "خطا در سمت سرور هنگام افزودن شهر. لطفا دوباره تلاش کنید.",
  cityAddedSuccess: "شهر با موفقیت اضافه شد.",
  noCitiesFound: "هیچ شهری یافت نشد.",
  // متن‌های مربوط به مودال AddNewCity (اگر داخل آن کامپوننت مدیریت نمی‌شوند)
  modalTitle: "افزودن شهر جدید",
  cityNameLabel: "نام شهر",
  cityNamePlaceholder: "نام شهر را وارد کنید",
  cityTypeLabel: "نوع شهر",
  cityTypePlaceholder: "نوع شهر را انتخاب کنید",
  // ... سایر انواع شهر برای select options ...
  submitButton: "ثبت شهر",
  cancelButton: "انصراف",
};

export const cityItemMessages = {
  deleteSuccess: "شهر با موفقیت حذف شد.",
  deleteError: "خطا در حذف شهر.",
  deleteErrorRetry: "خطا در حذف شهر. لطفا دوباره تلاش کنید.",
  deleteButtonLabel: "حذف شهر",
  deleteModalTitle: "حذف شهر",
  deleteModalActionText: "آیا از حذف این شهر مطمئن هستید؟ این عمل قابل بازگشت نیست.", // یا متن دقیق‌تری برای مودال
  confirmDeleteButton: "بله، حذف کن",
  cancelDeleteButton: "انصراف",
  cityTypeCounty: "شهرستان",
  cityTypeProvinceCenter: "مرکز استان",
  cityTypeCapital: "پایتخت",
  cityTypeUnknown: "نامشخص",
};
package translate

import "github.com/nerkhin/internal/core/domain/msg"

var (
	LANG_EN = "en" // English
	LANG_FA = "fa" // Persian
)

var translations = map[string]map[string]string{
	msg.SubscriptionPayment: {
		LANG_FA: "خرید اشتراک نرخین",
	},

	// database
	msg.ErrFKViolationUserCity: {
		LANG_FA: "شهر مورد نظر معتبر نیست",
	},
	msg.ErrDeleteSubCategoryViolation: {
		LANG_FA: "حذف دستەبندی دارای شاخە امکان پذیر نیست",
	},
	msg.ErrDeleteProductCategoryViolation: {
		LANG_FA: "امکان حذف دستەبندی استفادە شدە در کالا وجود ندارد",
	},
	msg.ErrDeleteProductBrandViolation: {
		LANG_FA: "امکان حذف برند استفادە شدە در کالا وجود ندارد",
	},
	msg.ErrDeleteProductModelViolation: {
		LANG_FA: "امکان حذف مدل استفادە شدە در کالا وجود ندارد",
	},
	msg.ErrDeleteProductFilterViolation: {
		LANG_FA: "امکان حذف فیلتر استفادە شدە در کالا وجود ندارد",
	},
	msg.ErrDeleteProductFilterOptionViolation: {
		LANG_FA: "امکان حذف فیلتر استفادە شدە در کالا وجود ندارد",
	},
	msg.ErrDuplicateProductCategoryBrandModelViolation: {
		LANG_FA: "امکان ایجاد یا ویرایش کالا با ترکیب دستەبندی، برند و مدل تکراری وجود ندارد",
	},
	msg.ErrDuplicateUserPhoneViolation: {
		LANG_FA: "امکان افزودن کاربر با شمارە موبایل تکراری وجود ندارد",
	},
	msg.ErrDuplicateFavoriteProductViolation: {
		LANG_FA: "شما قبلا این کالا را پسند کردەاید",
	},
	msg.ErrDuplicateUserProductViolation: {
		LANG_FA: "امکان افزودن محصول تکراری بە فروشگاه وجود ندارد",
	},
	msg.ErrDuplicateSubscriptionNumberOfDaysViolation: {
		LANG_FA: "امکان افزودن تعرفە تکراری وجود ندارد",
	},
	msg.ErrDuplicateUserSubscriptionViolation: {
		LANG_FA: "فقط یک تعرفە از هر شهر میتوانید خریداری کنید",
	},
	msg.ErrDuplicateUserPaymentTransactionRefIDViolation: {
		LANG_FA: "تراکنش پرداخت قبلا تایید شدە است",
	},
	msg.ErrDuplicateFavoriteAccountViolation: {
		LANG_FA: "شما قبلا این فروشگاه را پسند کردەاید",
	},

	// product category
	msg.ErrCreatingRootCategoryIsForbidden: {
		LANG_FA: "شما دسترسی ایجاد دستە بندی اصلی را ندارید",
	},
	msg.ErrDeleteProductSubCategoryBrandViolation: {
		LANG_FA: "به دلیل وجود برند در این زیر شاخە، امکان حذف آن وجود ندارد",
	},
	msg.ErrDeleteProductSubCategoryModelViolation: {
		LANG_FA: "به دلیل وجود مدل در این زیر شاخە، امکان حذف آن وجود ندارد",
	},
	msg.ErrDeleteProductSubCategoryFilterViolation: {
		LANG_FA: "به دلیل وجود فیلتر در این زیر شاخە، امکان حذف آن وجود ندارد",
	},

	// city
	msg.ErrCityTypeIsNotValid: {
		LANG_FA: "نوع شهر معتبر نیست",
	},

	//user
	msg.ErrUserPhoneCannotBeEmpty: {
		LANG_FA: "شمارە تلفن باید مقدار داشتە باشد",
	},
	msg.ErrUserCityCannotBeEmpty: {
		LANG_FA: "شهر کاربر باید مقدار داشتە باشد",
	},
	msg.ErrUserRoleIsNotValid: {
		LANG_FA: "نقش کاربر معتبر نیست",
	},
	msg.ErrUserStateIsNotValid: {
		LANG_FA: "وضعیت کاربر معتبر نیست",
	},
	msg.ErrUserFullNameCannotBeEmpty: {
		LANG_FA: "نام و نام خانوادگی کاربر نباید خالی باشد",
	},
	msg.ErrNewUserIsNotAllowedToChangeUserInfo: {
		LANG_FA: "کاربر جدید دسترسی ویرایش اطلاعات را ندارد",
	},
	msg.ErrOperationNotAllowedForThisUser: {
		LANG_FA: "شما دسترسی انجام این عملیات را ندارید",
	},
	msg.ErrOperationNotAllowedForNonApprovedUser: {
		LANG_FA: "کاربر شما هنوز تایید نشدە است",
	},
	msg.ErrUpdatingUserRoleIsNotAllowed: {
		LANG_FA: "شما اجازە تغییر نوع کاربری را ندارید",
	},
	msg.ErrUpdatingUserStateIsNotAllowed: {
		LANG_FA: "شما اجازە تغییر وضعیت کاربر را ندارید",
	},
	msg.ErrNewUserRoleShouldBeRetailerOrWholesaler: {
		LANG_FA: "نوع کاربری باید خردە فروش یا عمدە فروش باشد",
	},
	msg.ErrUserChangeStateIsNotValid: {
		LANG_FA: "تغییر بە وضعیت مورد نظر امکان پذیر نیست",
	},
	msg.ErrOnlyWholesalerCanUpdateShop: {
		LANG_FA: "امکان ویرایش فروشگاه فقط برای کاربر عمدە فروش وجود دارد",
	},

	// auth
	msg.ErrInvalidCredentials: {
		LANG_FA: "شمارە موبایل یا گذرواژە واردشدە اشتباه است",
	},
	msg.ErrUserDoesNotExist: {
		LANG_FA: "کاربری با این شمارە موبایل وجود ندارد",
	},
	msg.ErrUserIsNotApprovedYet: {
		LANG_FA: "کاربر هنوز تایید نشدە است",
	},
	msg.ErrPhoneIsNotValid: {
		LANG_FA: "شماره موبایل/تلفن وارد شده معتبر نیست",
	},

	// verification-code
	msg.ErrVerificationCodeLengthIsNotValid: {
		LANG_FA: "طول کد واردشدە اشتباه است",
	},
	msg.ErrCodeIsWrong: {
		LANG_FA: "کد واردشدە اشتباه است",
	},
	msg.ErrSendingVerificationCodeFailed: {
		LANG_FA: "ارسال کد تایید با خطا مواجە شد",
	},

	// product model
	msg.ErrModelTitleCannotBeEmpty: {
		LANG_FA: "عنوان مدل نباید خالی باشد",
	},
	msg.ErrModelCategoryCannotBeEmpty: {
		LANG_FA: "زیردستە تعیین نشدە است",
	},
	msg.ErrModelCategoryShouldBeSubCategory: {
		LANG_FA: "مدل باید بە یک زیردستە متصل باشد",
	},

	// product brand
	msg.ErrBrandTitleCannotBeEmpty: {
		LANG_FA: "عنوان برند نباید خالی باشد",
	},
	msg.ErrBrandCategoryCannotBeEmpty: {
		LANG_FA: "زیردستە تعیین نشدە است",
	},
	msg.ErrBrandCategoryShouldBeSubCategory: {
		LANG_FA: "برند باید بە یک زیردستە متصل باشد",
	},

	// product-filter
	msg.ErrFilterNameCannotBeEmpty: {
		LANG_FA: "عنوان پنل ادمین فیلتر نمیتواند خالی باشد",
	},
	msg.ErrFilterOptionNameCannotBeEmpty: {
		LANG_FA: "عنوان گزینەی فیلتر نمیتواند خالی باشد",
	},
	msg.ErrProductCannotHaveDuplicateFilters: {
		LANG_FA: "کالا نمیتواند فیلترهای تکراری داشتە باشد",
	},
	msg.ErrFilterCategoryCannotBeEmpty: {
		LANG_FA: "زیردستە تعیین نشدە است",
	},
	msg.ErrFilterCategoryShouldBeSubCategory: {
		LANG_FA: "فیلتر باید بە یک زیردستە متصل باشد",
	},

	// product
	msg.ErrProductMustHaveCategory: {
		LANG_FA: "کالا باید دستەبندی داشتە باشد",
	},
	msg.ErrProductCategoryHasSubCategories: {
		LANG_FA: "دستەبندی انتخاب شدە برای کالا دارای شاخە است و باید یکی از شاخەهای آن بە عنوان دستەبندی کالا انتخاب شود",
	},
	msg.ErrProductImagesExceededLimit: {
		LANG_FA: "تعداد تصاویر آپلودشدە بیش از تعداد مجاز است",
	},
	msg.ErrProductImageSizeExceededLimit: {
		LANG_FA: "حجم تصویر/تصاویر آپلود شدە بیش از حد مجاز(٥٠٠ کیلوبایت) است",
	},
	msg.ErrTagCannotBeEmpty: {
		LANG_FA: "تگ نمیتواند خالی باشد",
	},
	msg.ErrProductCategoryHasNotProductBrand: {
		LANG_FA: "دستەبندی برند و دستەبندی کالا مطابقت ندارد",
	},
	msg.ErrProductCategoryHasNotProductModel: {
		LANG_FA: "دستەبندی مدل و دستەبندی کالا مطابقت ندارد",
	},
	msg.ErrProductCategoryHasNotProductFilter: {
		LANG_FA: "دستەبندی فیلتر و دستەبندی کالا مطابقت ندارد",
	},

	// report
	msg.ErrReportTitleCannotBeEmpty: {
		LANG_FA: "عنوان گزارش نمیتواند خالی باشد",
	},
	msg.ErrReportDescriptionCannotBeEmpty: {
		LANG_FA: "توضیحات گزارش تخلف نمیتواند خالی باشد",
	},
	msg.ErrReportStateIsNotValid: {
		LANG_FA: "وضعیت گزارش معتبر نیست",
	},
	msg.ErrReportChangeStateIsNotValid: {
		LANG_FA: "تغییر بە وضعیت مورد نظر امکان پذیر نیست",
	},
	msg.ErrTargetUserIsNotApproved: {
		LANG_FA: "ثبت گزارش فقط برای کاربران تاییدشدە امکان پذیر است",
	},
	msg.ErrReportingNonWholeSalerUserIsNotAllowed: {
		LANG_FA: "ثبت گزارش فقط برای فروشگاه عمدە فروش امکان پذیر است",
	},

	// user product
	msg.ErrProductCategoryIsNotSpecified: {
		LANG_FA: "دستە بندی محصول انتخاب نشدە است",
	},
	msg.ErrProductBrandIsNotSpecified: {
		LANG_FA: "برند محصول انتخاب نشدە است",
	},
	msg.ErrProductModelIsNotSpecified: {
		LANG_FA: "مدل محصول انتخاب نشدە است",
	},
	msg.ErrDollarPriceIsNotSet: {
		LANG_FA: "قیمت دلاری محصول نامعتبر است",
	},
	msg.ErrFinalPriceIsNotSet: {
		LANG_FA: "قیمت فروش محصول معتبر نیست",
	},
	msg.ErrShopDollarPriceIsNotSet: {
		LANG_FA: "قیمت دلار فروشگاه وارد نشدە است",
	},
	msg.ErrProductWithThisBrandAndModelDoesNotExist: {
		LANG_FA: "محصول با برند و مدل انتخاب شدە وجود ندارد",
	},
	msg.ErrChangeOrderRequestIsNotValid: {
		LANG_FA: "درخواست تغییر وضعیت معتبر نیست",
	},
	msg.ErrPricesDoNotMatch: {
		LANG_FA: "مجموع قیمت دلاری و قیمت سایر هزینە ها باید برابر قیمت فروش باشد",
	},
	msg.ErrYouDoNotAccessToThisShop: {
		LANG_FA: "شما بە این فروشگاه دسترسی ندارید",
	},
	msg.ErrNoSubscriptionsBought: {
		LANG_FA: "باید حداقل اشتراک یک شهر را خریداری کنید",
	},

	// subscription
	msg.ErrPriceIsNotValid: {
		LANG_FA: "تعرفەی طرح تعیین نشدە است",
	},
	msg.ErrSubscriptionPeriodIsNotValid: {
		LANG_FA: "مدت زمان طرح تعرفە تعریف نشدە است",
	},

	// user subscription
	msg.ErrUserSubscriptionCityIsNotSpecified: {
		LANG_FA: "شهر تعرفە مشخص نشدە است",
	},
	msg.ErrUserSubscriptionSubscriptionIsNotSpecified: {
		LANG_FA: "تعرفەای برای خرید انتخاب نشدە است",
	},
	msg.ErrPaymentAmountIsNotValid: {
		LANG_FA: "مبلغ پرداختی معتبر نیست",
	},
	msg.ErrCallBackUrlShouldNotBeEmpty: {
		LANG_FA: "آدرس پذیرندە معتبر نیست",
	},
	msg.ErrPaymentTransactionIsNotVerified: {
		LANG_FA: "تراکنش پرداخت تایید نشدە است",
	},
	msg.ErrPaymentTransactionIsAlreadyVerified: {
		LANG_FA: "تراکنش پرداخت قبلا تایید شدە است",
	},
	msg.ErrChosenSubscriptionIsNotValid: {
		LANG_FA: "تراکنش انتخاب شدە معتبر نیست",
	},
	msg.ErrChosenCityIsNotValid: {
		LANG_FA: "شهر انتخاب شدە معتبر نیست",
	},
	msg.ErrPaymentHasFailed: {
		LANG_FA: "تراکنش پرداختی معتبر نبودە است",
	},
	msg.ErrYouHaveAlreadyBoughtSubscriptionForThisCity: {
		LANG_FA: "اشتراک این شهر برای شما فعال است و تا پایان آن، امکان خرید دوبارە وجود ندارد",
	},

	// favorite account
	msg.ErrLikingOwnShopIsForbidden: {
		LANG_FA: "امکان پسند کردن فروشگاه خودتان وجود ندارد",
	},
}

func isLangValid(lang string) bool {
	return lang == LANG_FA || lang == LANG_EN
}

func Translate(lang string, message string) (string, bool) {
	innerMap, ok := translations[message]
	if !ok {
		return message, false
	}

	langIsValid := isLangValid(lang)
	if !langIsValid {
		return message, false
	}

	translation, ok := innerMap[lang]
	if !ok {
		return message, false
	}

	return translation, true
}

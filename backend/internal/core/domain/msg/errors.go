package msg

var (
	// general
	ErrInternal        = "internal error"
	ErrRecordNotFound  = "record not found"
	ErrConflictingData = "data conflicts with existing data in unique column"
	ErrUnauthorized    = "user is unauthorized to access the resource"
	ErrForbidden       = "user is forbidden to access the resource"
	ErrDataIsNotValid  = "data is invalid"

	// database
	ErrFKViolationUserCity                           = "ERROR: insert or update on table \"user_t\" violates foreign key constraint \"user_t_city_id_fkey\" (SQLSTATE 23503)"
	ErrDeleteSubCategoryViolation                    = "ERROR: update or delete on table \"product_category\" violates foreign key constraint \"product_category_parent_id_fkey\" on table \"product_category\" (SQLSTATE 23503)"
	ErrDeleteProductCategoryViolation                = "ERROR: update or delete on table \"product_category\" violates foreign key constraint \"product_category_id_fkey\" on table \"product\" (SQLSTATE 23503)"
	ErrDeleteProductSubCategoryBrandViolation        = "ERROR: update or delete on table \"product_category\" violates foreign key constraint \"product_brand_category_id_fkey\" on table \"product_brand\" (SQLSTATE 23503)"
	ErrDeleteProductSubCategoryModelViolation        = "ERROR: update or delete on table \"product_category\" violates foreign key constraint \"product_model_category_id_fkey\" on table \"product_model\" (SQLSTATE 23503)"
	ErrDeleteProductSubCategoryFilterViolation       = "ERROR: update or delete on table \"product_category\" violates foreign key constraint \"product_filter_category_id_fkey\" on table \"product_filter\" (SQLSTATE 23503)"
	ErrDeleteProductBrandViolation                   = "ERROR: update or delete on table \"product_brand\" violates foreign key constraint \"product_brand_id_fkey\" on table \"product\" (SQLSTATE 23503)"
	ErrDeleteProductModelViolation                   = "ERROR: update or delete on table \"product_model\" violates foreign key constraint \"product_model_id_fkey\" on table \"product\" (SQLSTATE 23503)"
	ErrDeleteProductFilterViolation                  = "ERROR: update or delete on table \"product_filter\" violates foreign key constraint \"product_filter_relation_filter_id_fkey\" on table \"product_filter_relation\" (SQLSTATE 23503)"
	ErrDeleteProductFilterOptionViolation            = "ERROR: update or delete on table \"product_filter_option\" violates foreign key constraint \"product_filter_relation_filter_option_id_fkey\" on table \"product_filter_relation\" (SQLSTATE 23503)"
	ErrDuplicateProductCategoryBrandModelViolation   = "ERROR: duplicate key value violates unique constraint \"product_category_id_brand_id_model_id_key\" (SQLSTATE 23505)"
	ErrDuplicateUserPhoneViolation                   = "ERROR: duplicate key value violates unique constraint \"user_t_phone_key\" (SQLSTATE 23505)"
	ErrDuplicateFavoriteProductViolation             = "ERROR: duplicate key value violates unique constraint \"favorite_product_user_id_product_id_key\" (SQLSTATE 23505)"
	ErrDuplicateFavoriteAccountViolation             = "ERROR: duplicate key value violates unique constraint \"favorite_account_user_id_target_user_id_key\" (SQLSTATE 23505)"
	ErrDuplicateUserProductViolation                 = "ERROR: duplicate key value violates unique constraint \"user_product_user_id_product_id_key\" (SQLSTATE 23505)"
	ErrDuplicateSubscriptionNumberOfDaysViolation    = "ERROR: duplicate key value violates unique constraint \"subscription_number_of_days_key\" (SQLSTATE 23505)"
	ErrDuplicateUserSubscriptionViolation            = "ERROR: duplicate key value violates unique constraint \"user_subscription_user_id_city_id_key\" (SQLSTATE 23505)"
	ErrDuplicateUserPaymentTransactionRefIDViolation = "ERROR: duplicate key value violates unique constraint \"user_payment_transaction_history_ref_id_key\" (SQLSTATE 23505)"

	// product category
	ErrCreatingRootCategoryIsForbidden = "product category: creating main category is forbidden"

	// city
	ErrCityTypeIsNotValid = "city: city type is not valid"

	// user
	ErrUserPhoneCannotBeEmpty                  = "user: phone cannot be empty"
	ErrUserCityCannotBeEmpty                   = "user: city cannot be empty"
	ErrUserRoleIsNotValid                      = "user: role is not valid"
	ErrUserStateIsNotValid                     = "user: state is not valid"
	ErrUserFullNameCannotBeEmpty               = "user: full name cannot be empty"
	ErrOperationNotAllowedForThisUser          = "user: operation not allowed for this user"
	ErrOperationNotAllowedForNonApprovedUser   = "user: operation not allowed for non-approved user"
	ErrNewUserIsNotAllowedToChangeUserInfo     = "user: new user is not allowed to change user info"
	ErrUpdatingUserRoleIsNotAllowed            = "user: updating user role is not allowed"
	ErrUpdatingUserStateIsNotAllowed           = "user: updating user state is not allowed"
	ErrNewUserRoleShouldBeRetailerOrWholesaler = "user: new user role should be retailer or wholesaler"
	ErrUserChangeStateIsNotValid               = "user: user change state is not valid"
	ErrOnlyWholesalerCanUpdateShop             = "user: only wholesaler can update shop"
	ErrProductMustHaveModel                    = "user: the product not have brand"
	// auth
	ErrInvalidCredentials         = "auth: invalid phone or password"
	ErrTokenDuration              = "auth: invalid token duration format"
	ErrTokenCreation              = "auth: creating token failed"
	ErrExpiredToken               = "auth: access token is expired"
	ErrInvalidToken               = "auth: access token is invalid"
	ErrUserDoesNotExist           = "auth: user does not exist"
	ErrUserIsNotApprovedYet       = "auth: user is not approved yet"
	ErrEmptyAuthorizationHeader   = "auth: authorization header is not provided"
	ErrInvalidAuthorizationHeader = "auth: authorization header format is invalid"
	ErrInvalidAuthorizationType   = "auth: authorization type is not supported"
	ErrPhoneIsNotValid            = "user: user phone is not valid"

	// verification code
	ErrVerificationCodeLengthIsNotValid = "verification-code: code length is not valid"
	ErrCodeIsWrong                      = "verification-code: code is wrong"
	ErrSendingVerificationCodeFailed    = "verification-code: sending code failed"

	// product model
	ErrModelTitleCannotBeEmpty          = "product model: title cannot be empty"
	ErrModelCategoryCannotBeEmpty       = "product model: category cannot be empty"
	ErrModelCategoryShouldBeSubCategory = "product model: model should be linked to a subcategory"
	ErrModelBrandCannotBeEmpty          = "product model :model can not be empty"
	ErrModelHasProducts                 = "product model: model has a product"

	// product brand
	ErrBrandTitleCannotBeEmpty          = "product brand: title cannot be empty"
	ErrBrandCategoryCannotBeEmpty       = "product brand: category cannot be empty"
	ErrBrandCategoryShouldBeSubCategory = "product brand: brand should be linked to a subcategory"

	// product filter
	ErrFilterNameCannotBeEmpty           = "product-filter: filter name cannot be empty"
	ErrFilterOptionNameCannotBeEmpty     = "product-filter: filter option cannot be empty"
	ErrProductCannotHaveDuplicateFilters = "product-filter: product cannot have duplicate filters"
	ErrFilterCategoryCannotBeEmpty       = "product-filter: category cannot be empty"
	ErrFilterCategoryShouldBeSubCategory = "product-filter: filter should be linked to a subcategory"

	// product
	ErrProductMustHaveCategory            = "product: product must have category"
	ErrProductCategoryHasSubCategories    = "product: product category has sub categories and should be assigned to one of its sub categories"
	ErrProductImagesExceededLimit         = "product: images exceeded limit"
	ErrProductImageSizeExceededLimit      = "product: image size exceeded limit"
	ErrTagCannotBeEmpty                   = "product: tag cannot be empty"
	ErrProductCategoryHasNotProductBrand  = "product: product category has not product brand"
	ErrProductCategoryHasNotProductModel  = "product: product category has not product model"
	ErrProductCategoryHasNotProductFilter = "product: product category has not product filter option"

	// report
	ErrReportTitleCannotBeEmpty               = "report: title cannot be empty"
	ErrReportDescriptionCannotBeEmpty         = "report: description cannot be empty"
	ErrReportStateIsNotValid                  = "report: state is not valid"
	ErrReportChangeStateIsNotValid            = "report: change state is not valid"
	ErrTargetUserIsNotApproved                = "report: target user is not approved"
	ErrReportingNonWholeSalerUserIsNotAllowed = "report: reporting a non wholesaler user is not allowed"

	// user product
	ErrProductCategoryIsNotSpecified            = "user product: product category is not specified"
	ErrProductBrandIsNotSpecified               = "user product: product brand is not specified"
	ErrProductModelIsNotSpecified               = "user product: product model is not specified"
	ErrDollarPriceIsNotSet                      = "user product: dollar price is not set"
	ErrFinalPriceIsNotSet                       = "user product: product final price is not set"
	ErrShopDollarPriceIsNotSet                  = "user product: user shop dollar price is not set"
	ErrProductWithThisBrandAndModelDoesNotExist = "user product: product with this brand and mode does not exist"
	ErrChangeOrderRequestIsNotValid             = "user product: requested products are not consecutive."
	ErrPricesDoNotMatch                         = "user product: prices do not match and are invalid"
	ErrYouDoNotAccessToThisShop                 = "user product: you do not have access to this shop"
	ErrNoSubscriptionsBought                    = "user product: you have to buy at least a subscription to see data"

	// subscription
	ErrPriceIsNotValid              = "subscription: price is not valid"
	ErrSubscriptionPeriodIsNotValid = "subscription: period is not valid"

	// user subscription
	ErrUserSubscriptionCityIsNotSpecified          = "user subscription: city is not specified"
	ErrUserSubscriptionSubscriptionIsNotSpecified  = "user subscription: subscription is not specified"
	ErrPaymentAmountIsNotValid                     = "user subscription: payment amount is not valid"
	ErrCallBackUrlShouldNotBeEmpty                 = "user subscription: callBackUrl should not be empty"
	ErrPaymentTransactionIsAlreadyVerified         = "user subscription: payment transaction is already verified"
	ErrPaymentTransactionIsNotVerified             = "user subscription: payment transaction is not verified"
	ErrChosenSubscriptionIsNotValid                = "user subscription: chosen subscription is not valid"
	ErrChosenCityIsNotValid                        = "user subscription: chosen city is not valid"
	ErrPaymentHasFailed                            = "user subscription: payment has failed"
	ErrYouHaveAlreadyBoughtSubscriptionForThisCity = "user subscription: you have already bought subscription for this city"

	// favorite account
	ErrLikingOwnShopIsForbidden = "favorite account: liking own shop is forbidden"
)

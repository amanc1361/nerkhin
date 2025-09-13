package handler

import (
	"context"
	"encoding/base64"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
	"github.com/skip2/go-qrcode"
	ptime "github.com/yaa110/go-persian-calendar"
)

type UserProductHandler struct {
	service      port.UserProductService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterUserProductHandler(service port.UserProductService, tokenService port.TokenService,
	appConfig config.App) *UserProductHandler {
	return &UserProductHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createUserProductRequest struct {
	ProductID   int64  `json:"productId"`
	CategoryID  int64  `json:"categoryId"`
	BrandID     int64  `json:"brandId"`
	IsDollar    bool   `json:"isDollar"`
	DollarPrice string `json:"dollarPrice"`
	OtherCosts  string `json:"otherCosts"`
	FinalPrice  string `json:"finalPrice"`
}

type createUserProductResponse struct {
	ID int64 `json:"id" example:"1"`
}

func decimalPtrIfPositive(s string) *decimal.Decimal {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	// حذف جداکننده هزارگان رایج
	s = strings.ReplaceAll(s, ",", "")
	s = strings.ReplaceAll(s, "٬", "") // جداکنندهٔ فارسی
	d, err := decimal.NewFromString(s)
	if err != nil {
		return nil
	}
	if d.Cmp(decimal.Zero) <= 0 {
		return nil
	}
	return &d
}
func (h *UserProductHandler) Search(c *gin.Context) {

	viewerID := currentUserIDOrZero(c)

	limit := atoiDefault(c.Query("limit"), 100)
	offset := atoiDefault(c.Query("offset"), 0)

	sortBy := strings.TrimSpace(c.Query("sortBy"))
	sortUpdated := domain.SortUpdated(strings.ToLower(strings.TrimSpace(c.Query("sortDir"))))

	categoryID := int64(atoiDefault(c.Query("categoryId"), 0))
	subCategoryID := int64(atoiDefault(c.Query("subCategoryId"), 0))

	brandIDs := parseInt64Multi(c.QueryArray("brandId"))
	optionIDs := parseInt64Multi(c.QueryArray("optionId"))
	filterIDs := parseInt64Multi(c.QueryArray("filterId"))
	tags := uniqueNonEmpty(c.QueryArray("tag"))
	search := strings.TrimSpace(c.Query("search"))

	var isDollarPtr *bool
	if v := strings.TrimSpace(c.Query("isDollar")); v != "" {
		if v == "true" || v == "1" {
			t := true
			isDollarPtr = &t
		} else if v == "false" || v == "0" {
			f := false
			isDollarPtr = &f
		}
	}

	var cityIDPtr *int64
	if v := strings.TrimSpace(c.Query("cityId")); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil && id > 0 {
			cityIDPtr = &id
		}
	}

	priceMin := decimalPtrIfPositive(c.Query("priceMin"))
	priceMax := decimalPtrIfPositive(c.Query("priceMax"))



	enforceSubscription := c.Query("enforceSubscription") == "1"

	onlyVisible := true
	if v := c.Query("onlyVisible"); v == "0" {
		onlyVisible = false
	}

	q := &domain.UserProductSearchQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortUpdated: sortUpdated,

		CategoryID:    categoryID,
		SubCategoryID: subCategoryID,
		BrandIDs:      brandIDs,
		IsDollar:      isDollarPtr,
		Search:        search,
		TagList:       tags,
		FilterIDs:     filterIDs,
		OptionIDs:     optionIDs,
		CityID:        cityIDPtr,

		// --- ست‌کردن فیلدهای قیمت (اضافه‌شده) ---
		PriceMin: priceMin,
		PriceMax: priceMax,

		OnlyVisible:           &onlyVisible,
		EnforceSubscription:   enforceSubscription,
		ViewerID:              viewerID,
		RequireWholesalerRole: true, // محصولات عمده‌فروش‌ها
	}

	res, err := h.service.SearchPaged(c.Request.Context(), q)
	if err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}
	handleSuccess(c, res)
}

func atoiDefault(s string, def int) int {
	if v, err := strconv.Atoi(strings.TrimSpace(s)); err == nil && v >= 0 {
		return v
	}
	return def
}

func parseInt64Multi(arr []string) []int64 {
	out := make([]int64, 0, len(arr))
	seen := map[int64]struct{}{}
	for _, s := range arr {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if v, err := strconv.ParseInt(s, 10, 64); err == nil && v > 0 {
			if _, ok := seen[v]; !ok {
				seen[v] = struct{}{}
				out = append(out, v)
			}
		}
	}
	return out
}

func uniqueNonEmpty(arr []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(arr))
	for _, s := range arr {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if _, ok := seen[s]; !ok {
			seen[s] = struct{}{}
			out = append(out, s)
		}
	}
	return out
}

func currentUserIDOrZero(c *gin.Context) int64 {
	if v, ok := c.Get("userId"); ok {
		if id, ok2 := v.(int64); ok2 && id > 0 {
			return id
		}
	}
	return 0
}

func (uph *UserProductHandler) Create(c *gin.Context) {
	var req createUserProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)

	if req.DollarPrice == "" {
		req.DollarPrice = "0"
	}
	dollarPriceDecimal, err := decimal.NewFromString(req.DollarPrice)
	if err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	if req.OtherCosts == "" {
		req.OtherCosts = "0"
	}
	otherCostsDecimal, err := decimal.NewFromString(req.OtherCosts)
	if err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	if req.FinalPrice == "" {
		req.FinalPrice = "0"
	}
	finalPrice, err := decimal.NewFromString(req.FinalPrice)
	if err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	category := &domain.UserProduct{
		ProductID:  req.ProductID,
		UserID:     authPayload.UserID,
		CategoryID: req.CategoryID,
		BrandID:    req.BrandID,
		IsDollar:   req.IsDollar,
		DollarPrice: decimal.NullDecimal{
			Decimal: dollarPriceDecimal,
			Valid:   !dollarPriceDecimal.IsZero(),
		},
		OtherCosts: decimal.NullDecimal{
			Decimal: otherCostsDecimal,
			Valid:   !otherCostsDecimal.IsZero(),
		},
		FinalPrice: finalPrice,
	}

	id, err := uph.service.CreateUserProduct(ctx, category)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	resp := createUserProductResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

func (uph *UserProductHandler) FetchShopProductsOld(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	products, err := uph.service.FetchShopProducts(ctx, currentUserID, currentUserID, currentUserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, products)
}

type changeUserProductOrderRequest struct {
	TopProductID    int64 `json:"topProductId"`
	BottomProductID int64 `json:"bottomProductId"`
}

func (uph *UserProductHandler) ChangeOrder(c *gin.Context) {
	var req changeUserProductOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	err := uph.service.ChangeOrder(ctx, currentUserID, req.TopProductID, req.BottomProductID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, err)
}

type fetchProductsByFilterRequest struct {
	CategoryID int64  `json:"categoryId"`
	SearchText string `json:"searchText"`
}

func (uph *UserProductHandler) FetchProductsByFilter(c *gin.Context) {
	var req fetchProductsByFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	products, err := uph.service.GetProductsByFilter(ctx, currentUserId, &domain.UserProductFilter{
		CategoryID: req.CategoryID,
		SearchText: req.SearchText,
	})
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, products)
}

type fetchShopsRequest struct {
	ProductID int64 `uri:"productId"`
}

func (uph *UserProductHandler) FetchShops(c *gin.Context) {
	var req fetchShopsRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	shops, err := uph.service.FetchRelatedShopProducts(ctx, req.ProductID, currentUserId)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, shops)
}

func (uph *UserProductHandler) FetchPriceList(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	priceList, err := uph.service.GetPriceList(ctx, currentUserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, priceList)
}

type fetchShopByUserIdRequest struct {
	UserID int64 `uri:"uid"`
}

func (uph *UserProductHandler) FetchShopByUserId(c *gin.Context) {
	var req fetchShopByUserIdRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	priceList, err := uph.service.FetchShopProducts(ctx, currentUserID, req.UserID, req.UserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, priceList)
}

type updateUserProductRequest struct {
	ID          int64  `json:"id"`
	IsDollar    bool   `json:"isDollar"`
	DollarPrice string `json:"dollarPrice"`
	OtherCosts  string `json:"otherCosts"`
	FinalPrice  string `json:"finalPrice"`
}

// internal/adapter/http/handler/user_product_handler.go
// GET /api/go/user-product/fetch-shop
// ?shopId=...&brandIds=1,2&categoryId=...&subCategoryId=...&isDollar=1|0&sortUpdated=asc|desc&search=...&limit=...&offset=...
func (psh *UserProductHandler) FetchShopProducts(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID
	userID := currentUserID
	shopID, _ := strconv.ParseInt(c.Query("shopId"), 10, 64)

	parseIDs := func(s string) []int64 {
		if s = strings.TrimSpace(s); s == "" {
			return nil
		}
		parts := strings.Split(s, ",")
		out := make([]int64, 0, len(parts))
		for _, p := range parts {
			if v, err := strconv.ParseInt(strings.TrimSpace(p), 10, 64); err == nil && v > 0 {
				out = append(out, v)
			}
		}
		return out
	}

	var isDollarPtr *bool
	if d := strings.TrimSpace(c.Query("isDollar")); d != "" {
		switch d {
		case "1", "true", "TRUE":
			t := true
			isDollarPtr = &t
		case "0", "false", "FALSE":
			f := false
			isDollarPtr = &f
		}
	}

	categoryID, _ := strconv.ParseInt(c.Query("categoryId"), 10, 64)
	subCatID, _ := strconv.ParseInt(c.Query("subCategoryId"), 10, 64)
	limit, _ := strconv.Atoi(c.Query("limit"))
	offset, _ := strconv.Atoi(c.Query("offset"))
	sort := domain.SortDir(strings.ToLower(c.Query("sortUpdated")))
	search := c.Query("search")

	q := &domain.UserProductQuery{
		ShopID:        shopID,
		BrandIDs:      parseIDs(c.Query("brandIds")),
		CategoryID:    categoryID,
		SubCategoryID: subCatID,
		IsDollar:      isDollarPtr,
		Search:        search,
		SortUpdated:   sort,
		Limit:         limit,
		Offset:        offset,
	}

	vm, err := psh.service.FetchShopProductsFiltered(c, currentUserID, shopID, userID, q)
	if err != nil {
		HandleError(c, err, psh.AppConfig.Lang)
		return
	}
	handleSuccess(c, vm)
}
func (uph *UserProductHandler) Update(c *gin.Context) {
	var req updateUserProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)

	userProduct := &domain.UserProduct{
		ID:       req.ID,
		UserID:   authPayload.UserID,
		IsDollar: req.IsDollar,
	}

	dollarPrice := decimal.NullDecimal{Valid: false}
	if req.DollarPrice != "" {
		dollarPriceDecimal, err := decimal.NewFromString(req.DollarPrice)
		if err != nil {
			validationError(c, err, uph.AppConfig.Lang)
			return
		}

		dollarPrice.Decimal = dollarPriceDecimal
		dollarPrice.Valid = true
	}

	otherCostsPrice := decimal.NullDecimal{Valid: false}
	if req.OtherCosts != "" {
		otherCostsDecimal, err := decimal.NewFromString(req.OtherCosts)
		if err != nil {
			validationError(c, err, uph.AppConfig.Lang)
			return
		}

		otherCostsPrice.Decimal = otherCostsDecimal
		otherCostsPrice.Valid = true
	}

	finalPrice := decimal.NullDecimal{Valid: false}
	if req.FinalPrice != "" {
		finalPriceDecimal, err := decimal.NewFromString(req.FinalPrice)
		if err != nil {
			validationError(c, err, uph.AppConfig.Lang)
			return
		}

		finalPrice.Decimal = finalPriceDecimal
		finalPrice.Valid = true
	}

	if dollarPrice.Valid {
		userProduct.DollarPrice = dollarPrice
	}

	if otherCostsPrice.Valid {
		userProduct.OtherCosts = otherCostsPrice
	}

	if finalPrice.Valid {
		userProduct.FinalPrice = finalPrice.Decimal
	}

	ctx := c.Request.Context()

	err := uph.service.UpdateUserProduct(ctx, userProduct)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchUserProductByIdRequest struct {
	UpID int64 `uri:"upId" example:"1"`
}

func (uph *UserProductHandler) Fetch(c *gin.Context) {
	var req fetchUserProductByIdRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	userProduct, err := uph.service.FetchUserProductById(ctx, req.UpID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, userProduct)
}

type deleteUserProductByIdRequest struct {
	Id int64 `uri:"id" binding:"required"`
}

func (uph *UserProductHandler) Delete(c *gin.Context) {
	var req deleteUserProductByIdRequest

	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := uph.service.BatchDeleteUserProduct(ctx, req.Id)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type changeVisibilityStatusRequest struct {
	UserProductID int64 `json:"userProductId"`
}

func (uph *UserProductHandler) ChangeVisibilityStatus(c *gin.Context) {
	var req changeVisibilityStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := uph.service.ChangeVisibilityStatus(ctx, req.UserProductID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

func tryParseTimeString(s string) (time.Time, bool) {
	layouts := []string{
		time.RFC3339Nano,
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02 15:04:05",
		"2006/01/02 15:04:05",
		"2006-01-02",
	}
	for _, l := range layouts {
		if t, err := time.Parse(l, s); err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}

/* ───────── Small helpers ───────── */

func moneyIRR(n decimal.Decimal) string {

	// مقدار اصلی
	d := n

	// تبدیل به عدد صحیح ریالی (بدون اعشار)
	// اگر اعشار داری و میخوای حذف بشه، IntPart استفاده کن
	num := d.IntPart()
	s := fmt.Sprintf("%d", num)

	neg := ""
	if num < 0 {
		neg = "-"
		s = s[1:] // علامت منفی رو حذف می‌کنیم
	}

	// اضافه کردن ویرگول به هر سه رقم
	var out []byte
	c := 0
	for i := len(s) - 1; i >= 0; i-- {
		out = append(out, s[i])
		c++
		if c%3 == 0 && i != 0 {
			out = append(out, ',')
		}
	}

	// برگردوندن آرایه (چون برعکس ساخته شده)
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}

	return neg + string(out)
}

const lrm = "\u200E"

func moneyIRR_LTR(n decimal.Decimal) string {
	return lrm + moneyIRR(n) + lrm
}

func ymdJalali_LTR(t time.Time) string {
	s := fmt.Sprintf("%d/%s/%s", t.Year(), pad2(int(t.Month())), pad2(t.Day()))
	return lrm + s + lrm
}

var jalaliMonths = [...]string{
	"", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
	"مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
}

func jalaliDateLong(t ptime.Time) string {
	return fmt.Sprintf("%d %s %d", t.Day(), jalaliMonths[int(t.Month())], t.Year())
}

func pad2(n int) string {
	if n < 10 {
		return fmt.Sprintf("0%d", n)
	}
	return fmt.Sprintf("%d", n)
}

func joinNonEmpty(parts ...string) string {
	var out []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, " ")
}

func firstNonEmpty(a, b string) string {
	if strings.TrimSpace(a) != "" {
		return a
	}
	return b
}

func firstNonEmptyInt64(a, b int64) int64 {
	if a != 0 {
		return a
	}
	return b
}

func uniqueStr(ss []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(ss))
	for _, s := range ss {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		if _, ok := seen[s]; !ok {
			seen[s] = struct{}{}
			out = append(out, s)
		}
	}
	return out
}

func htmlEsc(s string) string { return html.EscapeString(s) }

// مسیر فونت‌ها (طبق Dockerfile شما)
const localFontDir = "/assets/fonts"

// نام‌های احتمالی فونت‌ها (هر کدام موجود بود برداشته می‌شود)
var vazirRegCandidates = []string{
	"Vazirmatn-Regular.woff2",
	"Vazirmatn-FD-Regular.woff2",
	"Vazirmatn-Regular.ttf",
	"Vazirmatn-FD-Regular.ttf",
	"VazirFD.ttf",
}
var vazirBoldCandidates = []string{
	"Vazirmatn-Bold.woff2",
	"Vazirmatn-FD-Bold.woff2",
	"Vazirmatn-Bold.ttf",
	"Vazirmatn-FD-Bold.ttf",
	"Vazirmatn-FD-Bold.ttf",
}

// تاریخ ایتم‌ها به صورت yyyy/mm/dd جلالی (LTR)
func jalaliYMDFromAny(v any) string {
	jt := ptime.New(v.(time.Time))
	if jt.Time().IsZero() {
		return "—"
	}
	return ymdJalali_LTR(jt.Time()) // خروجی مثل: 1404/06/18
}

func pickExistingFont(fontDir string, names []string) (fullPath, mime, format string, ok bool) {
	for _, n := range names {
		p := filepath.Join(fontDir, n)
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			ext := strings.ToLower(filepath.Ext(n))
			switch ext {
			case ".woff2":
				return p, "font/woff2", "woff2", true
			case ".ttf":
				return p, "font/ttf", "truetype", true
			default:
				return p, "font/ttf", "truetype", true
			}
		}
	}
	return "", "", "", false
}

func fontDataURI(path, mime string) (string, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(b), nil
}

const siteBaseURL = "https://nerrkhin.com"

// CSS @font-face با فونت لوکال به صورت data:URI
func buildLocalVazirmatnCSS() string {
	regPath, regMime, regFmt, ok1 := pickExistingFont(localFontDir, vazirRegCandidates)
	boldPath, boldMime, boldFmt, ok2 := pickExistingFont(localFontDir, vazirBoldCandidates)
	if !ok1 || !ok2 {
		// اگر فونت پیدا نشد، CSS خالی برگردان (fallback به سیستم)
		return ""
	}
	regURI, err1 := fontDataURI(regPath, regMime)
	boldURI, err2 := fontDataURI(boldPath, boldMime)
	if err1 != nil || err2 != nil {
		return ""
	}

	family := "Vazirmatn Local"
	css := fmt.Sprintf(`
@font-face {
  font-family: '%s';
  src: url('%s') format('%s');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: '%s';
  src: url('%s') format('%s');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
`, family, regURI, regFmt, family, boldURI, boldFmt)

	return css
}

// ===================== ساخت HTML (RTL+Vazirmatn) =====================
// نیاز به این پکیج دارید:
// go get github.com/skip2/go-qrcode
// اگر قبلاً دارید، همین را نگه دارید.

// buildQRDataURI: متن را به PNG QR تبدیل می‌کند و result را به‌صورت data:URI برمی‌گرداند.
func buildQRDataURI(text string, size int) string {
	if strings.TrimSpace(text) == "" {
		return ""
	}
	if size <= 0 {
		size = 128
	}
	png, err := qrcode.Encode(text, qrcode.Medium, size)
	if err != nil || len(png) == 0 {
		return ""
	}
	b64 := base64.StdEncoding.EncodeToString(png)
	return "data:image/png;base64," + b64
}

func shopLogoURL(u string) string {
	u = strings.TrimSpace(u)
	if u == "" {
		return ""
	}
	// اگر خودش کامل بود، دست نزن
	if strings.HasPrefix(u, "http://") || strings.HasPrefix(u, "https://") {
		return u
	}
	// اگر هرجای رشته "/uploads/" داشت → همون‌جارو به مسیر وب تبدیل کن
	if i := strings.Index(u, "/uploads/"); i >= 0 {
		return siteBaseURL + u[i:] // از /uploads/... به بعد
	}
	// اگر خودش از /uploads شروع می‌شود
	if strings.HasPrefix(u, "/uploads/") {
		return siteBaseURL + u
	}
	// در بدترین حالت: فرض کن فقط نام فایل است
	return siteBaseURL + "/uploads/" + u
}

// now از نوع ptime.Time در کد شماست؛ اینجا signature شما را دست‌نخورده نگه می‌دارم.
func buildPriceListHTML(vm domain.ShopViewModel, now interface{}) string {
	shopName := strings.TrimSpace(vm.ShopInfo.ShopName)
	if shopName == "" {
		shopName = "—"
	}
	phones := strings.Join([]string{vm.ShopInfo.ShopPhone1, vm.ShopInfo.ShopPhone2, vm.ShopInfo.ShopPhone3}, " , ")
	addr := strings.TrimSpace(vm.ShopInfo.ShopAddress)

	// URL سایت (برای QR بالای تاریخ)
	siteURL := strings.TrimSpace(vm.ShopInfo.WebsiteUrl)
	if siteURL == "" {
		siteURL = siteBaseURL
	}
	siteQR := buildQRDataURI(siteURL, 96)

	// لوگو (از /uploads/... به URL کامل)

	// Social QR (اختیاری)
	socials := []struct {
		label string
		url   string
	}{
		{"Instagram", strings.TrimSpace(vm.ShopInfo.InstagramUrl)},
		{"Telegram", strings.TrimSpace(vm.ShopInfo.TelegramUrl)},
		{"WhatsApp", strings.TrimSpace(vm.ShopInfo.WhatsappUrl)},
	}
	var socialsQR strings.Builder
	for _, s := range socials {
		if s.url == "" {
			continue
		}
		qr := buildQRDataURI(s.url, 110)
		if qr == "" {
			continue
		}
		socialsQR.WriteString(fmt.Sprintf(`
			<div class="qr-card">
				<img src="%s" alt="%s QR"/>
				<div class="qr-label">%s</div>
			</div>
		`, htmlEsc(qr), htmlEsc(s.label), htmlEsc(s.label)))
	}

	// ردیف‌های جدول
	var rows strings.Builder
	for i, it := range vm.Products {
		title := joinNonEmpty(it.ProductCategory, it.ProductBrand, it.ModelName)
		if strings.TrimSpace(title) == "" {
			title = " "
		}
		updated := jalaliDateLong(ptime.New(it.UpdatedAt.Time))
		price := moneyIRR_LTR(it.FinalPrice)
		rows.WriteString(fmt.Sprintf(`
			<tr>
				<td class="c">%d</td>
				<td class="r">%s</td>
				<td class="c">%s</td>
				<td class="c">%s</td>
			</tr>`,
			i+1, htmlEsc(title), htmlEsc(price), htmlEsc(updated),
		))
	}

	fontCSS := buildLocalVazirmatnCSS()

	// لوگو HTML (اگر نبود، جای‌گیر ظریف)
	var logoHTML string
	if u := shopLogoURL(vm.ShopInfo.ImageUrl); u != "" {
		logoHTML = fmt.Sprintf(`<img class="shop-logo" src="%s" alt="shop logo"/>`, htmlEsc(u))
	} else {
		logoHTML = `<div class="shop-logo placeholder"></div>`
	}
	// QR سایت (اگر نبود، فاصله‌ی هم‌تراز)
	siteQRHTML := `<div class="site-qr placeholder"></div>`
	if siteQR != "" {
		siteQRHTML = fmt.Sprintf(`
			<div class="site-qr">
				<img src="%s" alt="site QR"/>
				<div class="small">%s</div>
			</div>`, htmlEsc(siteQR), htmlEsc(siteURL))
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>%s</title>
<style>
%s

* { box-sizing: border-box; }
body {
  font-family: "Vazirmatn Local", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  direction: rtl; unicode-bidi: embed;
  margin: 24px; color: #111;
}

/* ===== Header (هم‌تراز و حرفه‌ای) ===== */
.header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  align-items: center;  /* ← تمام آیتم‌ها عموداً وسط */
  gap: 16px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
}

.header .right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.shop-logo {
  width: 74px; height: 74px;
  border-radius: 50%%; object-fit: cover; object-position: center;
  border: 1px solid #e9e9e9; background: #fff;
}
.shop-logo.placeholder { background: #f3f3f3; }

.shop-title {
  display: flex; flex-direction: column; gap: 2px;
}
.shop-title .name {
  font-size: 26px; font-weight: 800; line-height: 1.1;
}
.shop-title .sub {
  font-size: 12px; color: #666;
}

/* ستون وسط: QR سایت */
.header .center {
  display: flex; justify-content: center;
}
.site-qr { text-align: center; }
.site-qr img { width: 86px; height: 86px; display: block; margin: 0 auto 6px; }
.site-qr .small { font-size: 11px; color: #666; direction: ltr; }
.site-qr.placeholder { width: 86px; height: 86px; border-radius: 8px; background: #f3f3f3; }

/* ستون چپ: تاریخ */
.header .left {
  display: flex; justify-content: flex-start; /* چون RTL است، چپِ بصری */
  align-items: center; gap: 8px;
}
.date {
  font-size: 14px; color: #333; font-weight: 700;
  white-space: nowrap;
}

/* متا: آدرس/تلفن‌ها */
.meta {
  display: grid; grid-template-columns: 1fr; gap: 6px;
  font-size: 13px; margin: 10px 0 16px;
}
.meta .row { display: flex; align-items: baseline; gap: 8px; }
.meta .label { font-weight: 800; color: #222; min-width: 64px; }
.meta .value { color: #111; }

/* Divider */
.hr { height: 1px; background: #e5e5e5; margin: 10px 0 16px; }

/* جدول اقلام */
table { width: 100%%; border-collapse: collapse; }
th, td { border: 1px solid #cfcfcf; padding: 8px 10px; font-size: 13px; }
th { background: #f5f5f5; font-weight: 700; }
td.r { text-align: right; }
td.c { text-align: center; }

/* فوتر QR شبکه‌های اجتماعی (اختیاری) */
.footer { margin-top: 16px; }
.qr-list { display: flex; flex-wrap: wrap; gap: 12px; }
.qr-card { width: 110px; text-align: center; }
.qr-card img {
  width: 110px; height: 110px; display: block;
  border: 1px solid #eee; background: #fff; border-radius: 8px;
}
.qr-label { margin-top: 6px; font-size: 12px; color: #444; font-weight: 600; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <!-- Right: Logo + Name (هم‌ردیف و وسط‌چین عمودی) -->
  <div class="right">
    %s
    <div class="shop-title">
      <div class="name">%s</div>
      <div class="sub">لیست قیمت فروشگاه</div>
    </div>
  </div>

  <!-- Center: Site QR -->
  <div class="center">
    %s
  </div>

  <!-- Left: Date -->
  <div class="left">
    <!-- اگر خواستی یک آیکون تقویم SVG کوچک اینجا اضافه کن -->
    <div class="date">%s</div>
  </div>
</div>

<!-- Address & Phones -->
<div class="meta">
  <div class="row"><div class="label">آدرس:</div><div class="value">%s</div></div>
  <div class="row"><div class="label">تلفن‌ها:</div><div class="value">%s</div></div>
</div>

<div class="hr"></div>

<!-- Table -->
<table>
  <thead>
    <tr>
      <th class="c" style="width:12%%">ردیف</th>
      <th class="r" style="width:48%%">نام محصول</th>
      <th class="c" style="width:20%%">قیمت</th>
      <th class="c" style="width:20%%">آخرین بروزرسانی</th>
    </tr>
  </thead>
  <tbody>
    %s
  </tbody>
</table>

<!-- Footer (Social QR, only if URLs exist) -->
<div class="footer">
  <div class="qr-list">%s</div>
</div>

</body>
</html>`,
		// <title>
		htmlEsc(shopName),
		fontCSS,

		// header.right → logo + title
		logoHTML,
		htmlEsc(shopName),

		// header.center → site QR
		siteQRHTML,

		// header.left → date
		htmlEsc(jalaliDateLong(now.(ptime.Time))),

		// meta
		htmlEsc(addr),
		htmlEsc(phones),

		// rows
		rows.String(),

		// socials
		socialsQR.String(),
	)
}

// ===================== هندلر اصلی: HTML → PDF با chromedp =====================

func (uph *UserProductHandler) FetchPriceListPDF(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	raw, err := uph.service.GetPriceList(ctx, currentUserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	now := ptime.Now()
	htmlStr := buildPriceListHTML(*raw, now)

	// اجرای Headless Chrome داخل کانتینر
	// توجه: در Dockerfile متغیرهای CHROMEDP_EXEC_PATH/CHROME_PATH ست شده‌اند.
	allocOpts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.ExecPath(os.Getenv("CHROMEDP_EXEC_PATH")), // همون /usr/bin/chromium-browser طبق compose/Dockerfile
		chromedp.Flag("headless", true),                    // هدلس
		chromedp.Flag("no-sandbox", true),                  // حل خطای namespace
		chromedp.Flag("disable-setuid-sandbox", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("disable-dev-shm-usage", true), // برای /dev/shm
		// در بعضی محیط‌ها لازم می‌شود
		chromedp.UserDataDir("/tmp/chromedp-profile"), // پروفایل قابل‌نوشتن
	)

	allocCtx, allocCancel := chromedp.NewExecAllocator(context.Background(), allocOpts...)
	defer allocCancel()

	chromeCtx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	if err := chromedp.Run(chromeCtx); err != nil {
		HandleError(c, fmt.Errorf("chrome boot error: %w", err), uph.AppConfig.Lang)
		return
	}

	if err := chromedp.Run(chromeCtx); err != nil {
		HandleError(c, fmt.Errorf("chrome boot error: %w", err), uph.AppConfig.Lang)
		return
	}

	// ⬅️ تایم‌اوت رو کمی بالا ببر (مثلاً 120s)
	timeoutCtx, timeoutCancel := context.WithTimeout(chromeCtx, 120*time.Second)
	defer timeoutCancel()

	var pdfBuf []byte
	err = chromedp.Run(
		timeoutCtx,
		// 1) صفحه خالی
		chromedp.Navigate("about:blank"),

		// 2) تزریق مستقیم HTML داخل فریم فعلی
		chromedp.ActionFunc(func(ctx context.Context) error {
			ft, err := page.GetFrameTree().Do(ctx)
			if err != nil {
				return err
			}
			return page.SetDocumentContent(ft.Frame.ID, htmlStr).Do(ctx)
		}),

		// 3) اطمینان از حاضر بودن DOM
		chromedp.WaitReady("body", chromedp.ByQuery),

		// 4) تنظیم media=screen (نسخه‌های جدید)
		chromedp.ActionFunc(func(ctx context.Context) error {
			return emulation.SetEmulatedMedia().WithMedia("screen").Do(ctx)
			// اگر ماژولت قدیمی‌تر بود:
			// return emulation.SetEmulatedMedia("screen").Do(ctx)
		}),

		// 5) پرینت PDF (سه خروجی: data, stream, err → دومی رو نادیده بگیر)
		chromedp.ActionFunc(func(ctx context.Context) error {
			data, _, err := page.PrintToPDF().
				WithPrintBackground(true).
				WithPaperWidth(8.27).   // A4
				WithPaperHeight(11.69). // A4
				WithMarginTop(0.39).
				WithMarginBottom(0.39).
				WithMarginLeft(0.39).
				WithMarginRight(0.39).
				Do(ctx)
			if err != nil {
				return err
			}
			pdfBuf = data
			return nil
		}),
	)
	if err != nil {
		HandleError(c, fmt.Errorf("pdf render error: %w", err), uph.AppConfig.Lang)
		return
	}

	shopName := strings.TrimSpace(raw.ShopInfo.ShopName)
	if shopName == "" {
		shopName = "shop"
	}
	fileName := fmt.Sprintf(
		"price-list-%s-%04d%02d%02d.pdf",
		strings.ReplaceAll(shopName, " ", "-"),
		now.Year(), int(now.Month()), now.Day(),
	)

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, fileName))
	c.Data(200, "application/pdf", pdfBuf)
}

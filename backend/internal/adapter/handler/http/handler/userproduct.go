package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
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
	ctx := c.Request.Context()

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

	vm, err := psh.service.FetchShopProductsFiltered(ctx, currentUserID, shopID, userID, q)
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

// get pdf file
type priceListVM struct {
	Shop  shopInfo       `json:"shop"`
	Items []priceListRow `json:"items"`
}
type shopInfo struct {
	Name    string   `json:"name"`
	Phones  []string `json:"phones"`
	Address string   `json:"address"`
}
type priceListRow struct {
	SubCategory string    `json:"subCategory"`
	Brand       string    `json:"brand"`
	ModelName   string    `json:"modelName"`
	Price       int64     `json:"price"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// ---------- کمکی‌ها ----------
func moneyIRR(n int64) string {
	s := fmt.Sprintf("%d", n)
	neg := ""
	if n < 0 {
		neg = "-"
		s = s[1:]
	}
	// گروه‌بندی هزارگان
	var out []byte
	c := 0
	for i := len(s) - 1; i >= 0; i-- {
		out = append(out, s[i])
		c++
		if c%3 == 0 && i != 0 {
			out = append(out, ',')
		}
	}
	// برعکس کردن
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	return neg + string(out)
}

var jalaliMonths = [...]string{
	"", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
	"مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
}

func jalaliDateLong(t ptime.Time) string {
	// مثال: ۱۴ شهریور ۱۴۰۴
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
	return strings.Join(out, " / ")
}

// از هر خروجی سرویس (هر نوع Go) با JSON به DTO خودمان می‌رسیم
func toPriceListVM(raw any) (priceListVM, error) {
	var vm priceListVM
	b, err := json.Marshal(raw)
	if err != nil {
		return vm, err
	}
	if err := json.Unmarshal(b, &vm); err != nil {
		return vm, err
	}
	return vm, nil
}

// ---------- هندلر خروجی PDF ----------
func (uph *UserProductHandler) FetchPriceListPDF(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	raw, err := uph.service.GetPriceList(ctx, currentUserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	// ✅ بدون type assertion (پس خطای "not an interface" دیگر رخ نمی‌دهد)
	vm, err := toPriceListVM(raw)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	// مرتب‌سازی بر اساس نام محصول
	sort.Slice(vm.Items, func(i, j int) bool {
		pi := joinNonEmpty(vm.Items[i].SubCategory, vm.Items[i].Brand, vm.Items[i].ModelName)
		pj := joinNonEmpty(vm.Items[j].SubCategory, vm.Items[j].Brand, vm.Items[j].ModelName)
		return strings.Compare(pi, pj) < 0
	})

	// ساخت PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(12, 18, 12)
	pdf.AddPage()

	// فونت (طبق Dockerfile: COPY ... /assets/fonts → مسیر ثابت)
	fontPath := filepath.Join("/assets/fonts", "Vazir.ttf") // نام فونت را طبق فایل واقعی‌ات بگذار
	pdf.AddUTF8Font("Vazirmatn", "", fontPath)
	pdf.SetFont("Vazirmatn", "", 12)

	// ── هدر ───────────────────────────────────────────────────────────────
	now := ptime.Now()

	// تاریخ شمسی در گوشه چپ بالا (نمایش بلند)
	pdf.SetXY(12, 10)
	pdf.CellFormat(0, 6, jalaliDateLong(now), "", 0, "L", false, 0, "")

	// نام فروشگاه وسط بالا
	pdf.SetFont("Vazirmatn", "", 18)
	pdf.SetXY(12, 10)
	pdf.CellFormat(186, 10, vm.Shop.Name, "", 0, "C", false, 0, "")
	pdf.Ln(10)

	// تلفن‌ها راست‌چین
	pdf.SetFont("Vazirmatn", "", 11)
	phones := strings.Join(vm.Shop.Phones, " , ")
	pdf.CellFormat(186, 6, phones, "", 0, "R", false, 0, "")
	pdf.Ln(6)

	// آدرس راست‌چین (چندخطی)
	addr := strings.TrimSpace(vm.Shop.Address)
	pdf.MultiCell(186, 6, addr, "", "R", false)
	pdf.Ln(4)

	// خط جداکننده
	pdf.SetDrawColor(200, 200, 200)
	pdf.Line(12, pdf.GetY(), 198, pdf.GetY())
	pdf.Ln(4)

	// ── جدول ─────────────────────────────────────────────────────────────
	// ستون‌ها: ردیف | نام محصول (زیرشاخه/برند/مدل) | قیمت | آخرین بروزرسانی
	colW := []float64{15, 100, 35, 36} // ≈ 186mm
	header := []string{"ردیف", "نام محصول (زیرشاخه / برند / مدل)", "قیمت", "آخرین بروزرسانی"}
	aligns := []string{"C", "R", "C", "C"}

	// هدر جدول
	pdf.SetFont("Vazirmatn", "", 12)
	pdf.SetFillColor(245, 245, 245)
	for i, h := range header {
		pdf.CellFormat(colW[i], 9, h, "1", 0, aligns[i], true, 0, "")
	}
	pdf.Ln(-1)

	// ردیف‌ها
	pdf.SetFont("Vazirmatn", "", 11)
	rowH := 8.0
	for idx, it := range vm.Items {
		title := joinNonEmpty(it.SubCategory, it.Brand, it.ModelName)

		// تاریخ آخرین آپدیت (شمسی، yyyy/mm/dd)
		jt := ptime.New(it.UpdatedAt)
		updatedStr := fmt.Sprintf("%d/%s/%s", jt.Year(), pad2(int(jt.Month())), pad2(jt.Day()))

		cells := []string{
			fmt.Sprintf("%d", idx+1),
			title,
			moneyIRR(it.Price),
			updatedStr,
		}
		for i, txt := range cells {
			pdf.CellFormat(colW[i], rowH, txt, "1", 0, aligns[i], false, 0, "")
		}
		pdf.Ln(-1)
	}

	// خروجی
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	// نام فایل
	fileName := fmt.Sprintf(
		"price-list-%s-%04d%02d%02d.pdf",
		strings.ReplaceAll(strings.TrimSpace(vm.Shop.Name), " ", "-"),
		now.Year(), int(now.Month()), now.Day(),
	)

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, fileName))
	c.Data(http.StatusOK, "application/pdf", buf.Bytes())
}

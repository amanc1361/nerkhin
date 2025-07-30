package port

import (
	"context"
	"mime/multipart"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/pkg/pagination"
)

type ProductRepository interface {
	CreateProduct(ctx context.Context, dbSession interface{}, product *domain.Product) (
		id int64, err error)
	UpdateProduct(ctx context.Context, dbSession interface{}, product *domain.Product) (
		err error)
	GetProductByID(ctx context.Context, dbSession interface{}, id int64) (
		product *domain.ProductViewModel, err error)
	GetProductsByIDs(ctx context.Context, dbSession interface{}, ids []int64) (
		products []*domain.Product, err error)
	DeleteProduct(ctx context.Context, dbSession interface{}, id int64) (err error)
	SaveImages(ctx context.Context, dbSession interface{},
		imagePayload *domain.ProductImagePayload) (err error)
	GetProductsImages(ctx context.Context, dbSession interface{}, productID int64) (
		imagesMap map[int64][]*domain.ProductImage, err error)
	GetImagesByIDs(ctx context.Context, dbSession interface{}, imageIDs []int64) (
		images []*domain.ProductImage, err error)
	GetProductsByFilter(ctx context.Context, dbSession interface{},
		filterQuery *domain.ProductFilterQuery, limit int, offset int) (products []*domain.ProductViewModel, totalCount int64, err error)
	SaveTags(ctx context.Context, dbSession interface{}, tagPayload *domain.ProductTagPayload) (
		err error)
	GetProductsTags(ctx context.Context, dbSession interface{}, productIDs []int64) (
		tagsMap map[int64][]*domain.ProductTag, err error)
	GetTagsByIDs(ctx context.Context, dbSession interface{}, tagIDs []int64) (
		tags []*domain.ProductTag, err error)

	DeleteProductTags(ctx context.Context, dbSession interface{}, productID int64) error
	DeleteProductFilterRelations(ctx context.Context, dbSession interface{}, productID int64) error

	UpdateProductInfo(ctx context.Context, dbSession interface{}, product *domain.Product) error

	ListByModel(ctx context.Context, dbSession interface{},
		modelID int64, p pagination.Pagination) (products []*domain.Product, total int64, err error)
	GetProductsByBrandIDPaginated(
		ctx context.Context,
		dbSession interface{},
		brandID int64,
		pag pagination.Pagination,
	) (pagination.PaginatedResult[*domain.ProductViewModel], error)
	ListProductsByCategoryWithSearch(
		ctx context.Context,
		dbSession interface{},
		categoryID int64,
		search string,
		pag pagination.Pagination,
	) (pagination.PaginatedResult[*domain.ProductViewModel], error)
}

type ProductService interface {
	CreateProduct(ctx context.Context, product *domain.Product,

		imageFiles []*multipart.FileHeader,
		defaultImageIndex int,
		baseImagePath string,
		filterPayload *domain.ProductFilterPayload,
		tagPayload *domain.ProductTagPayload,
	) (id int64, err error)
	UpdateProduct(ctx context.Context,
		product *domain.Product,
		imageFiles []*multipart.FileHeader,
		defaultImageIndex int,
		baseImagePath string,
		filterPayload *domain.ProductFilterPayload,
		tagPayload *domain.ProductTagPayload,
	) error
	GetProductByID(ctx context.Context, id int64) (product *domain.ProductViewModel, err error)
	DeleteProduct(ctx context.Context, id int64) (err error)
	GetProductsByFilter(ctx context.Context, filterQuery *domain.ProductFilterQuery, page int, limit int) (*domain.PaginatedProductsViewModel, error)
	ListByModel(ctx context.Context,
		modelID int64, p pagination.Pagination) (pagination.PaginatedResult[*domain.Product], error)
	GetProductsByBrandIDPaginated(
		ctx context.Context,
		brandID int64,
		pag pagination.Pagination,
	) (pagination.PaginatedResult[*domain.ProductViewModel], error)
	ListProductsByCategoryWithSearch(
		ctx context.Context,
		categoryID int64,
		search string,
		pag pagination.Pagination,
	) (pagination.PaginatedResult[*domain.ProductViewModel], error)
}

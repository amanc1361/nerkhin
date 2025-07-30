package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type ProductRequestRepository interface {
	CreateProductRequest(ctx context.Context, db interface{}, productRequest *domain.ProductRequest) (
		id int64, err error)
	UpdateProductRequest(ctx context.Context, db interface{}, productRequest *domain.ProductRequest) (
		err error)
	GetProductRequestByID(ctx context.Context, db interface{}, id int64) (
		productRequest *domain.ProductRequestViewModel, err error)
	DeleteProductRequest(ctx context.Context, db interface{}, ids []int64) (err error)
	GetAllProductRequests(ctx context.Context, db interface{}) (
		productRequests []*domain.ProductRequest, err error)
		

}

type ProductRequestService interface {
	CreateProductRequest(ctx context.Context, productRequest *domain.ProductRequest) (
		id int64, err error)
	GetProductRequestByID(ctx context.Context, id int64, userId int64) (
		productRequest *domain.ProductRequestViewModel, err error)
	DeleteProductRequest(ctx context.Context, ids []int64) (err error)
	GetAllProductRequests(ctx context.Context) (productRequests []*domain.ProductRequest, err error)
	MarkProductRequestAsChecked(ctx context.Context, productRequestID int64) (err error)
}


package http // یا نام پکیج شما

import (
	"log/slog"
	"os"
	"strings" // برای کار با رشته AllowedOrigins

	// "time"    // اگر از MaxAge در CORS استفاده می‌کنید

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/adapter/handler/http/handler"

	// مسیرهای صحیح به پکیج‌های AddRoutes شما
	"github.com/nerkhin/internal/adapter/handler/http/routes/auth"
	"github.com/nerkhin/internal/adapter/handler/http/routes/city"
	"github.com/nerkhin/internal/adapter/handler/http/routes/favoriteaccount"
	"github.com/nerkhin/internal/adapter/handler/http/routes/favoriteproduct"
	"github.com/nerkhin/internal/adapter/handler/http/routes/landing"
	"github.com/nerkhin/internal/adapter/handler/http/routes/product"
	"github.com/nerkhin/internal/adapter/handler/http/routes/productbrand"
	"github.com/nerkhin/internal/adapter/handler/http/routes/productcategory"
	"github.com/nerkhin/internal/adapter/handler/http/routes/productfilter"
	"github.com/nerkhin/internal/adapter/handler/http/routes/productmodel"
	"github.com/nerkhin/internal/adapter/handler/http/routes/productrequest"
	"github.com/nerkhin/internal/adapter/handler/http/routes/report"
	"github.com/nerkhin/internal/adapter/handler/http/routes/subscription"
	"github.com/nerkhin/internal/adapter/handler/http/routes/user"
	"github.com/nerkhin/internal/adapter/handler/http/routes/userproduct"
	"github.com/nerkhin/internal/adapter/handler/http/routes/usersubscription"

	sloggin "github.com/samber/slog-gin"
)

type Router struct {
	*gin.Engine
}

func NewRouter(
	httpConfig config.HTTPConfig,
	cityHandler *handler.CityHandler,
	productModelHandler *handler.ProductModelHandler,
	productBrandHandler *handler.ProductBrandHandler,
	productFilterHandler *handler.ProductFilterHandler,
	productCategoryHandler *handler.ProductCategoryHandler,
	productHandler *handler.ProductHandler,
	productRequestHandler *handler.ProductRequestHandler,
	userHandler *handler.UserHandler,
	authHandler *handler.AuthHandler,
	userProduct *handler.UserProductHandler,
	reportHandler *handler.ReportHandler,
	subscriptionHandler *handler.SubscriptionHandler,
	userSubscriptionHandler *handler.UserSubscriptionHandler,
	favoriteProductHandler *handler.FavoriteProductHandler,
	favoriteAccountHandler *handler.FavoriteAccountHandler,
	landingHandler *handler.LandingHandler,
) (*Router, error) {
	if httpConfig.Env == "production" || httpConfig.Env == "staging" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(sloggin.New(slog.Default()), gin.Recovery())
	router.Use(gin.RecoveryWithWriter(os.Stderr))
	router.MaxMultipartMemory = 8 << 20

	corsConfig := cors.DefaultConfig()

	if httpConfig.AllowedOrigins != "" {
		corsConfig.AllowOrigins = strings.Split(httpConfig.AllowedOrigins, ",")
	} else {
		slog.Warn("CORS AllowedOrigins not set in config, defaulting to localhost:3000 for development.")
		corsConfig.AllowOrigins = []string{"http://localhost:3000", "https://nerrkhin.com"}
	}

	corsConfig.AllowCredentials = true

	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With", "Accept"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}

	router.Use(cors.New(corsConfig))
	v1 := router.Group("/v1")
	product.AddRoutes(v1, productHandler)
	productmodel.AddRoutes(v1, productModelHandler)
	productcategory.AddRoutes(v1, productCategoryHandler)
	productbrand.AddRoutes(v1, productBrandHandler)
	city.AddRoutes(v1, cityHandler)
	productrequest.AddRoutes(v1, productRequestHandler)
	userproduct.AddRoutes(v1, userProduct)
	subscription.AddRoutes(v1, subscriptionHandler)
	report.AddRoutes(v1, reportHandler)
	user.AddRoutes(v1, userHandler)
	auth.AddRoutes(v1, authHandler, userHandler)
	productfilter.AddRoutes(v1, productFilterHandler)
	favoriteproduct.AddRoutes(v1, favoriteProductHandler)
	favoriteaccount.AddRoutes(v1, favoriteAccountHandler)
	usersubscription.AddRoutes(v1, userSubscriptionHandler)
	landing.AddRoutes(v1, landingHandler)

	return &Router{
		Engine: router, // برگرداندن Router که gin.Engine را در خود دارد
	}, nil
}

// Serve starts the HTTP server
func (r *Router) Serve(listenAddr string) error {
	// r.Engine به نمونه gin.Engine اشاره دارد
	return r.Engine.Run(listenAddr) // استفاده از متد Run خود Gin
}

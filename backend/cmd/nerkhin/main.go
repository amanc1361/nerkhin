package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/nerkhin/internal/adapter/auth/paseto"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/adapter/handler/http"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/logger"
	"github.com/nerkhin/internal/adapter/storage/dbms"
	"github.com/nerkhin/internal/adapter/storage/dbms/repository"
	"github.com/nerkhin/internal/core/service"
	"github.com/robfig/cron/v3"
)

func main() {
	// load configs

	godotenv.Load()

	appConfig := config.LoadAppConfig()
	dbConfig := config.LoadDBConfig()
	httpConfig := config.LoadHTTPConfig()
	tokenConfig := config.LoadTokenConfig()

	// Set logger
	logger.Set(appConfig)

	slog.Info("Starting the application", "app", appConfig.Name, "env", appConfig.Env)

	ctx := context.Background()

	// Init database
	postgresDMBS := &dbms.PostgresDBMS{}
	err := postgresDMBS.InitDB(ctx, dbConfig)
	if err != nil {
		slog.Error("Error initializing database connection", "error", err)
		os.Exit(1)
	}

	slog.Info("Successfully connected to the database", "db", dbConfig.DBName)

	err = postgresDMBS.MigrateUp(ctx, dbConfig)
	if err != nil {
		slog.Error("Error in migrating the database up", "error", err)
		os.Exit(1)
	}

	slog.Info("Successfully migrated up the database", "db", dbConfig.DBName)

	// Dependency injection
	tokenService, err := paseto.RegisterTokenService(tokenConfig)
	if err != nil {
		slog.Error("Error in registering token service", "error", err)
		os.Exit(1)
	}

	// init repositories
	cityRepo := &repository.CityRepository{}
	productModelRepo := &repository.ProductModelRepository{}
	productBrandRepo := &repository.ProductBrandRepository{}
	productFilterRepo := &repository.ProductFilterRepository{}
	productCategoryRepo := &repository.ProductCategoryRepository{}
	productRepo := &repository.ProductRepository{}
	productRequestRepo := &repository.ProductRequestRepository{}
	verificationCodeRepo := &repository.VerificationCodeRepository{}
	userRepo := &repository.UserRepository{}
	userProductRepo := &repository.UserProductRepository{}
	reportRepo := &repository.ReportRepository{}
	subscriptionRepo := &repository.SubscriptionRepository{}
	userSubscriptionRepo := &repository.UserSubscriptionRepository{}
	favoriteProductRepo := &repository.FavoriteProductRepository{}
	favoriteAccountRepo := &repository.FavoriteAccountRepository{}
	landingRepo := &repository.LandingRepository{}

	// init services
	cityService := service.RegisterCityService(postgresDMBS, cityRepo)
	productCategoryService := service.RegisterProductCategoryService(
		postgresDMBS,
		productCategoryRepo,
		productBrandRepo,
		appConfig,
	)
	productFilterImportService := service.RegisterProductFilterImportService(postgresDMBS, productFilterRepo)

	productBrandService := service.RegisterProductBrandService(postgresDMBS, productBrandRepo, productCategoryRepo, productModelRepo)
	productFilterService := service.RegisterProductFilterService(postgresDMBS, productFilterRepo,
		productCategoryRepo)

	productService := service.RegisterProductService(postgresDMBS, productRepo, productCategoryRepo, productFilterRepo, productBrandRepo, productModelRepo, appConfig)
	productRequestService := service.RegisterProductRequestService(postgresDMBS, productRequestRepo, userRepo, cityRepo)
	verificationCodeService := service.RegisterVerificationCodeService(postgresDMBS,
		verificationCodeRepo, userRepo, appConfig)
	userService := service.RegisterUserService(postgresDMBS, userRepo, verificationCodeService,
		verificationCodeRepo, appConfig, tokenService)
	authService := service.RegisterAuthService(postgresDMBS, userRepo, verificationCodeService,
		verificationCodeRepo)
	userProductService := service.RegisterUserProductService(postgresDMBS, userProductRepo, userRepo,
		productRepo, productFilterRepo, productBrandRepo, productModelRepo,
		favoriteProductRepo, favoriteAccountRepo, userSubscriptionRepo)
	reportService := service.RegisterReportService(postgresDMBS, reportRepo, userRepo)
	subscriptionService := service.RegisterSubscriptionService(postgresDMBS, subscriptionRepo)
	userSubscriptionService := service.RegisterUserSubscriptionService(postgresDMBS,
		userSubscriptionRepo, cityRepo, subscriptionRepo, userRepo, appConfig)
	favoriteProductService := service.RegisterFavoriteProductService(postgresDMBS,
		favoriteProductRepo, productRepo, userProductRepo)
	favoriteAccountService := service.RegisterFavoriteAccountService(postgresDMBS,
		favoriteAccountRepo)
	landingService := service.RegisterLandingService(postgresDMBS,
		landingRepo)
	productModelService := service.RegisterProductModelService(postgresDMBS, productModelRepo, productBrandRepo, productRepo, productCategoryRepo)

	// init handlers
	productFilterImportHandler := handler.RegisterProductFilterImportHandler(productFilterImportService, tokenService, appConfig)

	cityHandler := handler.RegisterCityHandler(cityService, tokenService, appConfig)
	productModelHandler := handler.RegisterProductModelHandler(productModelService, tokenService, appConfig)

	productBrandHandler := handler.RegisterProductBrandHandler(productBrandService, tokenService,
		appConfig)
	productFilterHandler := handler.RegisterProductFilterHandler(productFilterService, tokenService,
		appConfig)
	productCategoryHandler := handler.RegisterProductCategoryHandler(productCategoryService,
		tokenService, appConfig)
	productHandler := handler.RegisterProductHandler(productService, tokenService, appConfig)
	productRequestHandler := handler.RegisterProductRequestHandler(productRequestService,
		tokenService, appConfig)
	userHandler := handler.RegisterUserHandler(userService, tokenService, appConfig)
	authHandler := handler.RegisterAuthHandler(authService, tokenService,
		verificationCodeService, userSubscriptionService, appConfig)
	userProductHandler := handler.RegisterUserProductHandler(userProductService, tokenService,
		appConfig)
	reportHandler := handler.RegisterReportHandler(reportService, tokenService, appConfig)
	subscriptionHandler := handler.RegisterSubscriptionHandler(subscriptionService, tokenService,
		appConfig)
	userSubscriptionHandler := handler.RegisterUserSubscriptionHandler(userSubscriptionService,
		tokenService, appConfig)
	favoriteProductHandler := handler.RegisterFavoriteProductHandler(favoriteProductService,
		tokenService, appConfig)
	favoriteAccountHandler := handler.RegisterFavoriteAccountHandler(favoriteAccountService,
		tokenService, appConfig)
	landingHandler := handler.RegisterLandingHandler(landingService,
		tokenService, appConfig)
	dollarRepo := &repository.DollarLogRepository{}
	dollarService := service.RegisterDollarService(postgresDMBS, dollarRepo, userRepo, productRepo)

	c := cron.New(
		cron.WithLocation(time.Local),
		cron.WithSeconds(),
	)
	_, err = c.AddFunc("0 */2 * * * *", func() {
		ctx := context.Background()

		slog.Info("Cron Job: fetching latest dollar price...")

		if err := dollarService.FetchAndUpdateDollar(ctx); err != nil {
			slog.Error("Cron Job failed to update dollar", "error", err)
		} else {
			slog.Info("Cron Job: dollar updated successfully ✅")
		}
	})
	if err != nil {
		slog.Error("Failed to register cron job", "error", err)
	}

	c.Start()
	defer c.Stop()

	// init router
	router, err := http.NewRouter(
		httpConfig,
		cityHandler,
		productModelHandler,
		productBrandHandler,
		productFilterHandler,
		productCategoryHandler,
		productHandler,
		productRequestHandler,
		userHandler,
		authHandler,
		userProductHandler,
		reportHandler,
		subscriptionHandler,
		userSubscriptionHandler,
		favoriteProductHandler,
		favoriteAccountHandler,
		productFilterImportHandler,

		landingHandler,
	)
	if err != nil {
		slog.Error("Error initializing router", "error", err)
		os.Exit(1)
	}

	// Start server
	listenAddr := fmt.Sprintf("%s:%s", httpConfig.URL, httpConfig.Port)
	slog.Info("Starting the HTTP server", "listen_address", listenAddr)
	err = router.Serve(listenAddr)
	if err != nil {
		slog.Error("Error starting the HTTP server", "error", err)
		os.Exit(1)
	}
}

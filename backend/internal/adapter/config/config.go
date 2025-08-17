package config

import (
	"os"
	"strconv" // برای تبدیل رشته به bool
	// برای time.ParseDuration (هرچند اینجا مستقیماً استفاده نمی‌شود اما در سرویس توکن لازم است)
)

// App - ساختار اصلی کانفیگ برنامه
type App struct {
	Name               string
	Env                string
	Lang               string
	ImageBasePath      string
	SmsApiKey          string
	ZarinPalMerchantID string
	Token              TokenConfig  // <--- اضافه شد
	Cookie             CookieConfig // <--- اضافه شد
	DB                 DBConfig     // <--- اضافه شد (اگر لازم است در سطح App باشد)
	HTTP               HTTPConfig   // <--- اضافه شد (اگر لازم است در سطح App باشد)
}

// CookieConfig - برای تنظیمات کوکی Refresh Token
type CookieConfig struct {
	Name         string `yaml:"name" env:"REFRESH_TOKEN_COOKIE_NAME"`
	Path         string `yaml:"path" env:"COOKIE_PATH" envDefault:"/"` // envDefault از کتابخانه caarlos0/env
	Domain       string `yaml:"domain,omitempty" env:"COOKIE_DOMAIN"`
	Secure       bool   `yaml:"secure" env:"COOKIE_SECURE" envDefault:"false"`
	HTTPOnly     bool   `yaml:"http_only" env:"COOKIE_HTTP_ONLY" envDefault:"true"`
	SameSiteMode string `yaml:"same_site_mode" env:"COOKIE_SAMESITE_MODE" envDefault:"Lax"` // "Lax", "Strict", "None"
}

// TokenConfig - برای تنظیمات توکن (قبلاً Token نام داشت، برای وضوح بیشتر تغییر نام دادم)
type TokenConfig struct {
	Duration             string `yaml:"duration" env:"ACCESS_TOKEN_DURATION"`
	RefreshTokenDuration string `yaml:"refresh_token_duration" env:"REFRESH_TOKEN_DURATION"`
	SymmetricKeyHex      string `yaml:"symmetric_key_hex" env:"PASETO_SYMMETRIC_KEY_HEX"`
}

// DBConfig - برای تنظیمات دیتابیس (قبلاً DB نام داشت)
type DBConfig struct {
	Host           string `env:"DB_HOST"`
	Port           string `env:"DB_PORT"`
	User           string `env:"DB_USER"`
	Password       string `env:"DB_PASSWORD"`
	DBName         string `env:"DB_NAME"`
	MigrationsPath string `env:"DB_MIGRATIONS_PATH"`
}

// HTTPConfig - برای تنظیمات HTTP سرور (قبلاً HTTP نام داشت)
type HTTPConfig struct {
	Env            string `env:"APP_ENV"`  // می‌تواند از App.Env هم خوانده شود
	Lang           string `env:"APP_LANG"` // می‌تواند از App.Lang هم خوانده شود
	URL            string `env:"HTTP_URL"`
	Port           string `env:"HTTP_PORT"`
	AllowedOrigins string `env:"HTTP_ALLOWED_ORIGINS"`
}

// تابع کمکی برای خواندن متغیر محیطی با مقدار پیش‌فرض (برای bool)
func getEnvAsBool(name string, defaultVal bool) bool {
	valStr := os.Getenv(name)
	if valStr == "" {
		return defaultVal
	}
	valBool, err := strconv.ParseBool(valStr)
	if err != nil {
		return defaultVal
	}
	return valBool
}

// تابع کمکی برای خواندن متغیر محیطی با مقدار پیش‌فرض (برای string)
func getEnv(name string, defaultVal string) string {
	val := os.Getenv(name)
	if val == "" {
		return defaultVal
	}
	return val
}

// LoadAppConfig - تابع اصلی برای بارگذاری تمام تنظیمات برنامه
func LoadAppConfig() App {
	return App{
		Name:               getEnv("APP_NAME", "NerkhinApp"),
		Env:                getEnv("APP_ENV", "development"),
		Lang:               getEnv("APP_LANG", "fa"),
		ImageBasePath:      os.Getenv("APP_IMAGE_BASE_PATH"),
		SmsApiKey:          os.Getenv("APP_SMS_API_KEY"),
		ZarinPalMerchantID: os.Getenv("APP_ZARINPAL_MERCHANT_ID"),
		Token:              LoadTokenConfig(),  // <--- فراخوانی تابع بارگذاری تنظیمات توکن
		Cookie:             LoadCookieConfig(), // <--- فراخوانی تابع بارگذاری تنظیمات کوکی
		DB:                 LoadDBConfig(),     // <--- فراخوانی تابع بارگذاری تنظیمات دیتابیس
		HTTP:               LoadHTTPConfig(),   // <--- فراخوانی تابع بارگذاری تنظیمات HTTP
	}
}

// LoadTokenConfig - بارگذاری تنظیمات مربوط به توکن
func LoadTokenConfig() TokenConfig {
	return TokenConfig{
		Duration:             getEnv("ACCESS_TOKEN_DURATION", "504h"),
		RefreshTokenDuration: getEnv("REFRESH_TOKEN_DURATION", "720h"), // مثال: 30 روز
		SymmetricKeyHex:      os.Getenv("PASETO_SYMMETRIC_KEY_HEX"),    // این باید حتماً تنظیم شود
	}
}

// LoadCookieConfig - بارگذاری تنظیمات مربوط به کوکی
func LoadCookieConfig() CookieConfig {
	return CookieConfig{
		Name:         getEnv("REFRESH_TOKEN_COOKIE_NAME", "nerkhin_refresh_token"), // یک نام پیش‌فرض مثال
		Path:         getEnv("COOKIE_PATH", "/"),
		Domain:       os.Getenv("COOKIE_DOMAIN"),           // اگر خالی باشد، مرورگر دامنه فعلی را در نظر می‌گیرد
		Secure:       getEnvAsBool("COOKIE_SECURE", false), // در پروداکشن باید true باشد
		HTTPOnly:     getEnvAsBool("COOKIE_HTTP_ONLY", true),
		SameSiteMode: getEnv("COOKIE_SAMESITE_MODE", "Lax"),
	}
}

// LoadDBConfig - بارگذاری تنظیمات دیتابیس (تغییر نام از LoadDbConfig برای هماهنگی)
func LoadDBConfig() DBConfig {
	return DBConfig{
		Host:           os.Getenv("DB_HOST"),
		Port:           os.Getenv("DB_PORT"),
		User:           os.Getenv("DB_USER"),
		Password:       os.Getenv("DB_PASSWORD"),
		DBName:         os.Getenv("DB_NAME"),
		MigrationsPath: os.Getenv("DB_MIGRATIONS_PATH"),
	}
}

// LoadHTTPConfig - بارگذاری تنظیمات HTTP (تغییر نام از LoadHttpConfig برای هماهنگی)
func LoadHTTPConfig() HTTPConfig {
	return HTTPConfig{
		Env:            getEnv("APP_ENV", "development"), // می‌تواند از App.Env اصلی هم خوانده شود
		Lang:           getEnv("APP_LANG", "fa"),         // می‌تواند از App.Lang اصلی هم خوانده شود
		URL:            os.Getenv("HTTP_URL"),
		Port:           getEnv("HTTP_PORT", "8080"),
		AllowedOrigins: os.Getenv("HTTP_ALLOWED_ORIGINS"),
	}
}

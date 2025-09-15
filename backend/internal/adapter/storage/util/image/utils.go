package image

import (
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	"mime/multipart"
	"os"
	"path/filepath"
	"sync"

	"github.com/chai2010/webp"
	"github.com/nerkhin/internal/core/domain"
)

func SaveProductImagesWithPayload(productID int64, files []*multipart.FileHeader, defaultIndex int, basePath string) (*domain.ProductImagePayload, string, error) {
	dir := filepath.Join(basePath, fmt.Sprintf("%d", productID))

	// ⛔️ حذف کامل عکس‌های قبلی (در صورت وجود)
	if err := os.RemoveAll(dir); err != nil {
		return nil, "", fmt.Errorf("خطا در حذف پوشه قبلی تصاویر: %w", err)
	}

	// 🟢 ایجاد پوشه جدید
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return nil, "", fmt.Errorf("خطا در ساخت پوشه تصاویر: %w", err)
	}

	payload := &domain.ProductImagePayload{NewImages: []*domain.ProductImage{}}
	var defaultUrl string

	var wg sync.WaitGroup
	var mu sync.Mutex
	errs := make(chan error, len(files))
	results := make([]string, len(files))

	for i, fileHeader := range files {
		i := i
		fileHeader := fileHeader
		wg.Add(1)
		go func() {
			defer wg.Done()

			src, err := fileHeader.Open()
			if err != nil {
				errs <- fmt.Errorf("خطا در باز کردن فایل: %w", err)
				return
			}
			defer src.Close()

			img, _, err := image.Decode(src)
			if err != nil {
				errs <- fmt.Errorf("خطا در decode تصویر: %w", err)
				return
			}

			fileName := fmt.Sprintf("%d.webp", i+1)
			fullPath := filepath.Join(dir, fileName)
			out, err := os.Create(fullPath)
			if err != nil {
				errs <- fmt.Errorf("خطا در ساخت فایل خروجی: %w", err)
				return
			}
			defer out.Close()

			if err := webp.Encode(out, img, &webp.Options{Lossless: false, Quality: 85}); err != nil {
				errs <- fmt.Errorf("خطا در تبدیل به WebP: %w", err)
				return
			}

			url := fmt.Sprintf("uploads/%d/%s", productID, fileName)

			mu.Lock()
			results[i] = url
			mu.Unlock()
		}()
	}

	wg.Wait()
	close(errs)
	if err := <-errs; err != nil {
		return nil, "", err
	}

	for i, url := range results {
		isDefault := i == defaultIndex
		payload.NewImages = append(payload.NewImages, &domain.ProductImage{
			Url:       url,
			IsDefault: isDefault,
		})
		if isDefault {
			defaultUrl = url
		}
	}

	if defaultUrl == "" && len(payload.NewImages) > 0 {
		defaultUrl = payload.NewImages[0].Url
		payload.NewImages[0].IsDefault = true
	}

	return payload, defaultUrl, nil
}

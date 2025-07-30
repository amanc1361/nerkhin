package gormutil

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/nerkhin/internal/core/domain"
	"gorm.io/gorm"
)

func CastToGORM(ctx context.Context, dbSession interface{}) (*gorm.DB, error) {
	db, ok := dbSession.(*gorm.DB)
	if !ok {
		return nil, errors.New("gorm: casting failed because db session is null")
	}

	return db, nil
}
func SaveProductImages(productID int64, files []*multipart.FileHeader, defaultIndex int, basePath string) ([]*domain.ProductImage, error) {
	imageDir := filepath.Join(basePath, fmt.Sprintf("%d", productID))

	if err := os.RemoveAll(imageDir); err != nil {
		return nil, err
	}
	if err := os.MkdirAll(imageDir, os.ModePerm); err != nil {
		return nil, err
	}

	var productImages []*domain.ProductImage

	for i, fileHeader := range files {
		fileName := fmt.Sprintf("%d.jpg", i+1)
		filePath := filepath.Join(imageDir, fileName)

		src, err := fileHeader.Open()
		if err != nil {
			return nil, err
		}
		defer src.Close()

		dst, err := os.Create(filePath)
		if err != nil {
			return nil, err
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			return nil, err
		}

		isDefault := i == defaultIndex
		productImages = append(productImages, &domain.ProductImage{
			Url:       fmt.Sprintf("images/%d/%s", productID, fileName),
			IsDefault: isDefault,
		})
	}

	return productImages, nil
}

func FindDefaultImageURL(images []*domain.ProductImage) string {
	for _, img := range images {
		if img.IsDefault {
			return img.Url
		}
	}
	if len(images) > 0 {
		return images[0].Url
	}
	return ""
}

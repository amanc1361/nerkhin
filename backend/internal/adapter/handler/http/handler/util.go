package handler

import (
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/domain/translate"
)

const MaxFileSize = 500 * 1024 // 500 KB

var errorStatusMap = map[string]int{
	msg.ErrInternal:                              http.StatusInternalServerError,
	msg.ErrRecordNotFound:                        http.StatusNotFound,
	msg.ErrConflictingData:                       http.StatusConflict,
	msg.ErrUnauthorized:                          http.StatusUnauthorized,
	msg.ErrInvalidAuthorizationType:              http.StatusUnauthorized,
	msg.ErrForbidden:                             http.StatusForbidden,
	msg.ErrInvalidCredentials:                    http.StatusUnauthorized,
	msg.ErrEmptyAuthorizationHeader:              http.StatusUnauthorized,
	msg.ErrInvalidAuthorizationHeader:            http.StatusUnauthorized,
	msg.ErrInvalidToken:                          http.StatusUnauthorized,
	msg.ErrExpiredToken:                          http.StatusUnauthorized,
	msg.ErrOperationNotAllowedForThisUser:        http.StatusForbidden,
	msg.ErrOperationNotAllowedForNonApprovedUser: http.StatusForbidden,
}

func validationError(c *gin.Context, err error, lang string) {
	errMsg, isTranslated := parseError(err, lang)
	errRsp := newErrorResponse(errMsg, isTranslated)
	c.JSON(http.StatusBadRequest, errRsp)
}

func HandleError(c *gin.Context, err error, lang string) {
	statusCode, ok := errorStatusMap[err.Error()]
	if !ok {
		statusCode = http.StatusInternalServerError
	}

	errMsg, isTranslated := parseError(err, lang)
	if isTranslated {
		statusCode = http.StatusBadRequest
	}

	errRsp := newErrorResponse(errMsg, isTranslated)
	c.JSON(statusCode, errRsp)
}

func HandleAbort(c *gin.Context, err error, lang string) {
	statusCode, ok := errorStatusMap[err.Error()]
	if !ok {
		statusCode = http.StatusInternalServerError
	}

	errMsg, isTranslated := parseError(err, lang)
	if isTranslated {
		statusCode = http.StatusBadRequest
	}

	errRsp := newErrorResponse(errMsg, isTranslated)
	c.AbortWithStatusJSON(statusCode, errRsp)
}

func parseError(err error, lang string) (errMessage string, isTranslated bool) {
	errMessage, isTranslated = translate.Translate(lang, err.Error())
	return errMessage, isTranslated
}

type errorResponse struct {
	Message      string `json:"message"`
	IsTranslated bool   `json:"isTranslated"`
}

func newErrorResponse(errMessage string, isTranslated bool) errorResponse {
	return errorResponse{
		Message:      errMessage,
		IsTranslated: isTranslated,
	}
}

func handleSuccess(c *gin.Context, data any) {
	c.JSON(http.StatusOK, data)
}

func saveAndGetImageFileNames(c *gin.Context, imagesKey, imageBasePath string, limit int) (
	imageUrls []string, err error) {
	form, err := c.MultipartForm()
	if err != nil {
		return
	}

	imageFiles := []*multipart.FileHeader{}
	if limit != -1 {
		imageFiles = form.File[imagesKey]
		if len(imageFiles) > limit {
			return nil, errors.New(msg.ErrProductImagesExceededLimit)
		}
	}

	for _, file := range imageFiles {
		if file.Size > MaxFileSize {
			return nil, errors.New(msg.ErrProductImageSizeExceededLimit)
		}
	}

	imageUrls = []string{}
	for _, img := range imageFiles {
		fileName := uuid.NewString()
		newFilePath := imageBasePath + "/" + fileName
		fmt.Println(newFilePath)
		err = c.SaveUploadedFile(img, newFilePath)
		if err != nil {
			return
		}

		imageUrls = append(imageUrls, fileName)
	}

	return imageUrls, nil
}

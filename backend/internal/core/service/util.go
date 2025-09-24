package service

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"os"
)

func deleteImage(basePath, fileName string) (err error) {
	filePath := basePath + "/" + fileName

	err = os.Remove(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			err = nil
			return
		} else if os.IsPermission(err) {
			err = nil
			return
		} else {
			return
		}
	}

	return
}
func GenerateRandomCode(CODE_LENGTH int) string {
	code := ""
	for i := 0; i < CODE_LENGTH; i++ {
		// عدد تصادفی بین 0 تا 9
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			// اگر خطا شد، مقدار fallback برگردونیم
			return "000000"
		}
		code += fmt.Sprintf("%d", n.Int64())
	}
	return code
}
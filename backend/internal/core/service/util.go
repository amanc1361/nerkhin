package service

import "os"

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

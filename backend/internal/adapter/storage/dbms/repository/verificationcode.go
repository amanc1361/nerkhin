package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type VerificationCodeRepository struct{}

func (*VerificationCodeRepository) SaveVerificationCode(ctx context.Context,
	dbSession interface{}, userId int64, code string) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	var vcToBeSaved *domain.VerificationCode
	err = db.Model(&domain.VerificationCode{}).
		Where(&domain.VerificationCode{UserID: userId}).
		Scan(&vcToBeSaved).Error
	if err != nil {
		return
	}

	if vcToBeSaved != nil {
		vcToBeSaved.Code = code
	} else {
		vcToBeSaved = &domain.VerificationCode{
			UserID: userId,
			Code:   code,
		}
	}

	err = db.Save(vcToBeSaved).Error
	if err != nil {
		return
	}

	return nil
}

func (*VerificationCodeRepository) GetVerificationCode(ctx context.Context, dbSession interface{},
	userId int64) (code string, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.VerificationCode{}).
		Where(&domain.VerificationCode{UserID: userId}).
		Select("code").
		Scan(&code).Error
	if err != nil {
		return
	}

	return code, nil
}

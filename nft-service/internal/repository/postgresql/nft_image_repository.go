package postgresql

import (
	"context"
	"main/internal/models"
	"main/tools/pkg/database"
)

type NftImageRepository struct {
	db *database.Postgres
}

func NewNftImageRepository(db *database.Postgres) *NftImageRepository {
	return &NftImageRepository{
		db: db,
	}
}

func (r *NftImageRepository) Create(ctx context.Context, image *models.NftImage) error {
	query := `INSERT INTO nft_image (nft_token_id, image_data, content_type) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(ctx, query, image.NftTokenID, image.ImageData, image.ContentType)
	return err
}

func (r *NftImageRepository) GetByTokenID(ctx context.Context, tokenID int64) (*models.NftImage, error) {
	query := `SELECT id, nft_token_id, image_data, content_type, created_at FROM nft_image WHERE nft_token_id = $1`
	row := r.db.QueryRow(ctx, query, tokenID)
	var image models.NftImage
	err := row.Scan(&image.ID, &image.NftTokenID, &image.ImageData, &image.ContentType, &image.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &image, nil
}

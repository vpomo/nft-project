package models

import "time"

type NftImage struct {
	ID          int64     `json:"id"`
	NftTokenID  int64     `json:"nft_token_id"`
	ImageData   []byte    `json:"image_data"`
	ContentType string    `json:"content_type"`
	CreatedAt   time.Time `json:"created_at"`
}

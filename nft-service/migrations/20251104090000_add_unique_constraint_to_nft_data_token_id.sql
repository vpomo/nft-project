-- +goose Up
-- +goose StatementBegin
ALTER TABLE nft_data
ADD CONSTRAINT nft_data_token_id_unique UNIQUE (token_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE nft_data
DROP CONSTRAINT nft_data_token_id_unique;
-- +goose StatementEnd

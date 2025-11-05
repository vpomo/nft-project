-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS nft_image
(
    id            bigserial
        constraint nft_image_pk primary key,
    nft_token_id  bigint not null
        constraint nft_image_nft_data_token_id_fk
            references nft_data (token_id),
    image_data    bytea not null,
    content_type  varchar(255) not null,
    created_at    timestamp default now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS nft_image;
-- +goose StatementEnd

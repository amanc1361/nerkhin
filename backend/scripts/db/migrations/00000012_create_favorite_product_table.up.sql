CREATE TABLE IF NOT EXISTS favorite_product (
  id                BIGSERIAL   NOT NULL PRIMARY KEY,
  user_id           BIGINT      NOT NULL REFERENCES user_t (id),
  product_id        BIGINT      NOT NULL REFERENCES product (id),
  UNIQUE (user_id, product_id)
);
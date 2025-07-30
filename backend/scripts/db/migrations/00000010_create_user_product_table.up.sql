CREATE TABLE IF NOT EXISTS user_product (
  id              BIGSERIAL         NOT NULL PRIMARY KEY,
  user_id         BIGINT            NOT NULL REFERENCES user_t (id),
  product_id      BIGINT            NOT NULL REFERENCES product (id),
  is_dollar       BOOLEAN           NOT NULL,
  dollar_price    DECIMAL(28, 6),
  other_costs     DECIMAL(28, 6),
  final_price     DECIMAL(28, 6)    NOT NULL,
  order_c         BIGINT            NOT NULL,
  is_hidden       BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP         NOT NULL,
  updated_at      TIMESTAMP         NULL,
  UNIQUE (user_id, product_id)
);
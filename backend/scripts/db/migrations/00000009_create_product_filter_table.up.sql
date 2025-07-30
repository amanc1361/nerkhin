CREATE TABLE IF NOT EXISTS product_filter (
  id                BIGSERIAL     NOT NULL PRIMARY KEY,
  category_id       BIGINT        NOT NULL REFERENCES product_category (id),
  name              VARCHAR(50)   NOT NULL,
  display_name      VARCHAR(50)   NOT NULL
);

CREATE TABLE IF NOT EXISTS product_filter_option (
  id                BIGSERIAL     NOT NULL PRIMARY KEY,
  filter_id         BIGINT        NOT NULL REFERENCES product_filter (id) ON DELETE CASCADE,
  name              VARCHAR(50)   NOT NULL
);

CREATE TABLE IF NOT EXISTS product_filter_relation (
  id                BIGSERIAL     NOT NULL PRIMARY KEY,
  product_id        BIGINT        NOT NULL REFERENCES product (id) ON DELETE CASCADE,
  filter_id         BIGINT        NOT NULL REFERENCES product_filter (id),
  filter_option_id  BIGINT        NOT NULL REFERENCES product_filter_option (id),
  is_default        BOOLEAN       NOT NULL,
  UNIQUE (product_id, filter_id)
);
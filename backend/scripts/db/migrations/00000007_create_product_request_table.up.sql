CREATE TABLE IF NOT EXISTS product_request (
  id                BIGSERIAL       NOT NULL PRIMARY KEY,
  user_id           BIGINT          NOT NULL REFERENCES user_t (id),
  description       VARCHAR(500)    NOT NULL,
  state_c           SMALLINT        NOT NULL
);
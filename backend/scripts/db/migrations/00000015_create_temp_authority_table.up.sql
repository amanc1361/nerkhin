CREATE TABLE IF NOT EXISTS temp_authority (
  id              BIGSERIAL       NOT NULL PRIMARY KEY,
  authority       VARCHAR(36)     NOT NULL UNIQUE,
  user_id         BIGINT          NOT NULL REFERENCES user_t (id),
  city_id         BIGINT          NOT NULL REFERENCES city (id),
  subscription_id BIGINT          NOT NULL REFERENCES subscription (id),
  created_at      TIMESTAMP       NOT NULL,
  updated_at      TIMESTAMP       NOT NULL
);
CREATE TABLE IF NOT EXISTS user_subscription (
  id                      BIGSERIAL         NOT NULL PRIMARY KEY,
  user_id                 BIGINT            NOT NULL REFERENCES user_t (id),
  city_id                 BIGINT            NOT NULL REFERENCES city (id),
  subscription_id         BIGINT            NOT NULL REFERENCES subscription (id),
  expires_at              TIMESTAMP         NOT NULL,
  created_at              TIMESTAMP         NOT NULL,
  updated_at              TIMESTAMP         NOT NULL,
  UNIQUE (user_id, city_id)
);
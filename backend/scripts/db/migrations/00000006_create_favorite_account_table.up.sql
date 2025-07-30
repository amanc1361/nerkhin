CREATE TABLE IF NOT EXISTS favorite_account (
  id                BIGSERIAL NOT NULL PRIMARY KEY,
  user_id           BIGINT    NOT NULL REFERENCES user_t (id),
  target_user_id    BIGINT    NOT NULL REFERENCES user_t (id),
  UNIQUE (user_id, target_user_id)
);
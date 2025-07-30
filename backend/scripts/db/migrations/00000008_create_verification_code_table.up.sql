CREATE TABLE IF NOT EXISTS verification_code (
  id                BIGSERIAL     NOT NULL PRIMARY KEY,
  user_id           BIGINT        NOT NULL REFERENCES user_t (id) ON DELETE CASCADE,
  code              VARCHAR(6)    NOT NULL,
  UNIQUE(user_id)
);
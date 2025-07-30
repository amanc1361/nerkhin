CREATE TABLE IF NOT EXISTS report (
  id                BIGSERIAL       NOT NULL PRIMARY KEY,
  user_id           BIGINT          NOT NULL REFERENCES user_t (id),
  target_user_id    BIGINT          NOT NULL REFERENCES user_t (id),
  title             VARCHAR(100)    NOT NULL, 
  description       VARCHAR(1000)   NOT NULL,
  state_c           SMALLINT        NOT NULL,
  created_at        TIMESTAMP       NOT NULL,
  updated_at        TIMESTAMP       NOT NULL
);
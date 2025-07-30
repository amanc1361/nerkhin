CREATE TABLE IF NOT EXISTS user_payment_transaction_history (
  id              BIGSERIAL       NOT NULL PRIMARY KEY,
  user_id         BIGINT          NOT NULL REFERENCES user_t (id),
  city_id         BIGINT          NOT NULL REFERENCES city (id),
  ref_id          VARCHAR         NOT NULL,
  authority       VARCHAR(36)     NOT NULL,
  cost_c          DECIMAL(28, 6)  NOT NULL,
  number_of_days  SMALLINT        NOT NULL,
  created_at      TIMESTAMP       NOT NULL,
  updated_at      TIMESTAMP       NOT NULL
);
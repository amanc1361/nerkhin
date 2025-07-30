CREATE TABLE IF NOT EXISTS subscription (
  id              BIGSERIAL       NOT NULL PRIMARY KEY,
  number_of_days  SMALLINT        NOT NULL UNIQUE,
  price           DECIMAL(28, 6)  NOT NULL,
  created_at      TIMESTAMP       NOT NULL,
  updated_at      TIMESTAMP       NOT NULL
);
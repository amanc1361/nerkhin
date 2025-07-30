CREATE TABLE IF NOT EXISTS admin_access (
  id                      BIGSERIAL    NOT NULL PRIMARY KEY,
  user_id                 BIGINT       NOT NULL REFERENCES user_t (id) ON DELETE CASCADE,
  save_product            BOOLEAN      NOT NULL,
  change_user_state       BOOLEAN      NOT NULL,
  change_shop_state       BOOLEAN      NOT NULL,
  change_account_state    BOOLEAN      NOT NULL,
  UNIQUE (user_id)
);

WITH super_admin AS (
  SELECT id from user_t
  WHERE role = 1 AND state_c = 5
)

INSERT INTO admin_access (
  user_id,
  save_product,
  change_user_state,
  change_shop_state,
  change_account_state
) SELECT 
    id, 
    TRUE, 
    TRUE, 
    TRUE, 
    TRUE
FROM super_admin;
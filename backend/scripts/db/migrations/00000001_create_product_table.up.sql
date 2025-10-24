CREATE TABLE IF NOT EXISTS product_category (
	id 			BIGSERIAL			NOT NULL 	PRIMARY KEY, 
	parent_id   BIGINT 				NULL 		REFERENCES product_category (id),
	title 		VARCHAR(200) 		NOT NULL,
	image_url 	VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS product_brand (
	id 				BIGSERIAL 		NOT NULL PRIMARY KEY, 
	category_id 	BIGINT 			NOT NULL REFERENCES product_category (id),
	title 			VARCHAR(200) 	NOT NULL 
);


CREATE TABLE IF NOT EXISTS product (
  id                BIGSERIAL      PRIMARY KEY,
  model_name        VARCHAR(200)   NOT NULL,
  brand_id          BIGINT         NOT NULL REFERENCES product_brand (id),
  default_image_url VARCHAR(200),
  description       VARCHAR(500)   NOT NULL,
  images_count      INT            DEFAULT 0,
  state_c           SMALLINT       NOT NULL,
  likes_count       INT            NOT NULL,
  shops_count       INT            NOT NULL,
  created_at        TIMESTAMP      NOT NULL,
  updated_at        TIMESTAMP      NOT NULL,
  CONSTRAINT uq_product_model_brand UNIQUE (model_name, brand_id)
);
CREATE INDEX IF NOT EXISTS idx_product_brand_id ON product(brand_id);
CREATE TABLE IF NOT EXISTS product_image (
	id 				BIGSERIAL 		NOT NULL PRIMARY KEY, 
	product_id 		BIGINT 			NOT NULL REFERENCES product (id) ON DELETE CASCADE,
	url 			VARCHAR(200) 	NOT NULL,
	is_default    	BOOLEAN 		NOT NULL 
);
CREATE TABLE IF NOT EXISTS  dollar_log (
    id BIGSERIAL PRIMARY KEY,
    price NUMERIC(18,4) NOT NULL,
    source TEXT DEFAULT 'tgnsrv.ir',
    created_at TIMESTAMP DEFAULT NOW()
);
.SILENT:

ENV_FILE=.env
include $(ENV_FILE)

DB_SCRIPTS_PATH="scripts/db"
DB_CREATE_FILE="$(DB_SCRIPTS_PATH)/create_db.sql"
DB_COMPOSE_FILE="$(DB_SCRIPTS_PATH)/db-compose.yml"
DB_MIGRATIONS_PATH="$(DB_SCRIPTS_PATH)/migrations"

PG_CONN_STR="postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)"
DB_CONN_STR="postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable"

REMOTE_IMAGE_TAG=$(DOCKER_HUB_USERNAME)/$(IMAGE_TAG):0.0.22

.DEFAULT_GOAL := help
.PHONY: help

# Default target
help: ## help(default)  
	@echo "--------------------------------"
	@echo "Usage: make [OPTIONS] TARGET"
	@echo "--------------------------------"
	@echo "Options:"
	@echo " pg-up: create and start postgres & pgadmin containers"
	@echo " pg-down: stop and remove postgres & pgadmin containers"
	@echo " pg-downv: stop and remove postgres & pgadmin containers & volumes"
	@echo "--------------------------------"
	@echo "Targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sed -n 's/^\(.*\): \(.*\)##\(.*\)/\1\3/p' \
		| column -t -s ' '
	@echo "--------------------------------"

pg-up:
	@docker compose -f $(DB_COMPOSE_FILE) --env-file $(ENV_FILE) up -d postgres pgadmin

pg-down:
	@docker compose -f $(DB_COMPOSE_FILE) --env-file $(ENV_FILE) down

pg-downv:
	@docker compose -f $(DB_COMPOSE_FILE) --env-file $(ENV_FILE) down -v

db-init:
	@psql $(PG_CONN_STR) -f $(DB_CREATE_FILE)

mig-create:
	@migrate create -ext sql -dir $(DB_MIGRATIONS_PATH) -seq -digits 8 $f

mig-up:
	@migrate -path $(DB_MIGRATIONS_PATH) -database $(DB_CONN_STR) up $c

mig-down:
	@migrate -path $(DB_MIGRATIONS_PATH) -database $(DB_CONN_STR) down $c $a

mig-force:
	@migrate -path $(DB_MIGRATIONS_PATH) -database $(DB_CONN_STR) force $v

login:
	docker login -u $(DOCKER_HUB_USERNAME)

logout:
	docker logout

build-local:
	@docker build -t $(IMAGE_TAG) .

build-remote:
	@docker build -t $(REMOTE_IMAGE_TAG) .

push-remote:
	@docker push $(REMOTE_IMAGE_TAG)

pull-remote:
	@docker pull $(REMOTE_IMAGE_TAG)

compose-up:
	@docker compose --env-file $(ENV_FILE) up postgres server

compose-down:
	@docker compose --env-file $(ENV_FILE) down

compose-down-v:
	@docker compose --env-file $(ENV_FILE) down --volumes

status:
	@docker ps -a

login-remote: set-password ## login-to-docker-hub/params:username,password
	cat pass | docker login -u $(username) --password-stdin
	rm -f pass

set-password: ## set-password
	touch pass
	echo $(password) > pass

drop-db:
	@psql $(PG_CONN_STR) -c "DROP DATABASE IF EXISTS $(DB_NAME) WITH (FORCE);"

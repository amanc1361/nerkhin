#!/bin/bash

set -e

DEPLOY_TAG=$1
echo "🔖 Deploying version: $DEPLOY_TAG"

# مسیر فایل‌ها را مشخص کن
BACKEND_IMAGE="backend-${DEPLOY_TAG}.tar"
FRONTEND_IMAGE="frontend-${DEPLOY_TAG}.tar"
BACKEND_ENV="backend.env"
FRONTEND_ENV="frontend.env"

cd ~/nerkhin/deploy_package

echo "📦 Loading Docker images..."
docker load -i "$BACKEND_IMAGE"
docker load -i "$FRONTEND_IMAGE"

# کپی فایل‌های env به ریشه پروژه
cp "$BACKEND_ENV" ../.env.backend
cp "$FRONTEND_ENV" ../.env.frontend

cd ..

echo "🚀 Running Docker Compose..."
DEPLOY_TAG="$DEPLOY_TAG" docker compose -f deploy_package/docker-compose.template.yml up -d --remove-orphans --build

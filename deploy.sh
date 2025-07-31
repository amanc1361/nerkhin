#!/bin/bash

set -e

DEPLOY_TAG=$1
echo "🔖 Deploying version: $DEPLOY_TAG"

# مشخص‌کردن نام فایل‌ها
BACKEND_IMAGE="backend-${DEPLOY_TAG}.tar"
FRONTEND_IMAGE="frontend-${DEPLOY_TAG}.tar"
BACKEND_ENV="backend.env"
FRONTEND_ENV="frontend.env"

# رفتن به دایرکتوری پکیج
cd ~/nerkhin/deploy_package

echo "📦 Loading Docker images..."
docker load -i $BACKEND_IMAGE
docker load -i $FRONTEND_IMAGE

# کپی envها برای استفاده توسط docker-compose
cp $BACKEND_ENV ../.env.backend
cp $FRONTEND_ENV ../.env.frontend

# رفتن به ریشه پروژه
cd ..

echo "🚀 Running Docker Compose..."
DEPLOY_TAG=$DEPLOY_TAG docker compose -f deploy_package/docker-compose.template.yml up -d --remove-orphans

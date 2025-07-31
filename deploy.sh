#!/bin/bash

set -e

SHA_TAG=$1
echo "🔖 Deploying version: $SHA_TAG"

# مسیر فایل‌ها را مشخص کن
BACKEND_IMAGE="backend-${SHA_TAG}.tar"
FRONTEND_IMAGE="frontend-${SHA_TAG}.tar"
BACKEND_ENV="backend.env"
FRONTEND_ENV="frontend.env"

# آماده‌سازی دایرکتوری اجرا
cd ~/nerkhin/deploy_package

echo "📦 Loading Docker images..."
docker load -i $BACKEND_IMAGE
docker load -i $FRONTEND_IMAGE

# کپی فایل‌های env به یک مسیر بالاتر برای docker-compose
cp $BACKEND_ENV ../.env.backend
cp $FRONTEND_ENV ../.env.frontend

# رفتن به پوشه اصلی پروژه
cd ..

# 🔧 تعریف متغیر محیطی برای docker-compose
export SHA_TAG=$SHA_TAG

# اجرای compose
echo "🚀 Running Docker Compose..."
docker compose -f deploy_package/docker-compose.template.yml up -d --remove-orphans --build

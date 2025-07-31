#!/bin/bash
set -e

SHA_TAG=$1
echo "🔖 Deploying version: $SHA_TAG"

cd ~/nerkhin/deploy_package

# تعیین نام فایل‌ها
BACKEND_IMAGE="backend-${SHA_TAG}.tar"
FRONTEND_IMAGE="frontend-${SHA_TAG}.tar"
BACKEND_ENV="backend.env"
FRONTEND_ENV="frontend.env"

echo "📦 Loading Docker images..."
docker load -i $BACKEND_IMAGE
docker load -i $FRONTEND_IMAGE

echo "📝 Copy env files..."
cp $BACKEND_ENV ../.env.backend
cp $FRONTEND_ENV ../.env.frontend

echo "🚀 Running Docker Compose..."
cd ..
SHA_TAG=$SHA_TAG docker compose -f deploy_package/docker-compose.template.yml up -d --remove-orphans --build

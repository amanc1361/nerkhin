#!/bin/bash
set -e

IMAGE_TAG=$1

if [ -z "$IMAGE_TAG" ]; then
  echo "❌ IMAGE_TAG is missing!"
  exit 1
fi

echo "📦 Loading Docker images..."
docker load -i backend-${IMAGE_TAG}.tar
docker load -i frontend-${IMAGE_TAG}.tar

echo "🧹 Cleaning previous containers..."
docker compose down --remove-orphans || true

echo "📁 Placing environment files..."
mkdir -p backend frontend
mv backend.env backend/.env
mv frontend.env frontend/.env 2>/dev/null || true

echo "⚙️ Generating docker-compose.yml..."
export IMAGE_TAG=$IMAGE_TAG
envsubst < docker-compose.template.yml > docker-compose.yml

echo "🚀 Starting containers..."
docker compose up -d

echo "✅ Deployment complete"

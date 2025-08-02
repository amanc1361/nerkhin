#!/bin/bash
set -e

DEPLOY_TAG=$1

if [ -z "$DEPLOY_TAG" ]; then
  echo "❌ DEPLOY_TAG is required as the first argument."
  exit 1
fi

echo "🔖 Deploying version: $DEPLOY_TAG"

BACKEND_IMAGE="backend-${DEPLOY_TAG}.tar"
FRONTEND_IMAGE="frontend-${DEPLOY_TAG}.tar"
BACKEND_ENV="backend.env"
FRONTEND_ENV="frontend.env"

cd "$(dirname "$0")"

# Load Docker images
echo "📦 Loading Docker images..."
docker load -i "$BACKEND_IMAGE"
docker load -i "$FRONTEND_IMAGE"

# Copy environment files
cp "$BACKEND_ENV" .env
cp "$FRONTEND_ENV" .env.frontend

# Export deploy tag to be used in docker-compose
export DEPLOY_TAG=$DEPLOY_TAG

# Generate docker-compose.yml from template
echo "📝 Generating docker-compose.yml from template..."
sed "s/\${DEPLOY_TAG}/$DEPLOY_TAG/g" docker-compose.template.yml > docker-compose.yml

# Remove existing containers to prevent name conflict
echo "🧹 Removing old containers..."
docker-compose down --remove-orphans || true

# Run Docker Compose
echo "🚀 Running Docker Compose..."
docker-compose up -d --build

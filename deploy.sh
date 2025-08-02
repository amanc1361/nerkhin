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

# -----------------------------
# 🧹 Cleanup: Remove unused images
# -----------------------------
echo "🧹 Cleaning up old Docker images..."

docker image prune -f

docker images | grep -E '^(frontend|backend)\s+deploy-' | awk '{print $1":"$2}' | while read image; do
  if ! docker ps -a --format '{{.Image}}' | grep -q "$image"; then
    echo "🗑 Removing unused image: $image"
    docker rmi "$image" || true
  fi
done

# -----------------------------
# 📦 Load Docker images
# -----------------------------
echo "📦 Loading Docker images..."
docker load -i "$BACKEND_IMAGE"
docker load -i "$FRONTEND_IMAGE"

# -----------------------------
# 🔐 Copy environment files
# -----------------------------
cp "$BACKEND_ENV" .env
cp "$FRONTEND_ENV" .env.frontend

# -----------------------------
# 🔄 Replace tag in template
# -----------------------------
export DEPLOY_TAG=$DEPLOY_TAG
echo "📝 Generating docker-compose.yml from template..."
sed "s/\${DEPLOY_TAG}/$DEPLOY_TAG/g" docker-compose.template.yml > docker-compose.yml

# -----------------------------
# 🧹 Remove old containers
# -----------------------------
echo "🧹 Removing old containers..."
docker-compose down --remove-orphans || true

# -----------------------------
# 🚀 Start new containers
# -----------------------------
echo "🚀 Running Docker Compose..."
docker-compose up -d --build

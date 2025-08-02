set -e
DEPLOY_TAG=$1
echo "🔖 Deploying version: $DEPLOY_TAG"
BACKEND_IMAGE="backend-${DEPLOY_TAG}.tar"
FRONTEND_IMAGE="frontend-${DEPLOY_TAG}.tar"
BACKEND_ENV="backend.env"
FRONTEND_ENV="frontend.env"
cd "$(dirname "$0")"
echo "📦 Loading Docker images..."
docker load -i "$BACKEND_IMAGE"
docker load -i "$FRONTEND_IMAGE"
cp "$BACKEND_ENV" .env
cp "$FRONTEND_ENV" .env.frontend
echo "🚀 Running Docker Compose..."
DEPLOY_TAG=$DEPLOY_TAG docker-compose -f docker-compose.template.yml up -d --remove-orphans --build

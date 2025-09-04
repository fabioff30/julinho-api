#!/bin/sh
set -e

echo "🐳 Starting Julinho Analytics API..."
echo "📅 $(date)"
echo "🌍 Environment: ${NODE_ENV:-development}"
echo "📡 Port: ${PORT:-4000}"

# Function to wait for a service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo "⏳ Waiting for $service_name at $host:$port..."
    
    while ! nc -z "$host" "$port" 2>/dev/null; do
        echo "   $service_name is not ready yet, waiting 2 seconds..."
        sleep 2
    done
    
    echo "✅ $service_name is ready at $host:$port"
}

# Wait for PostgreSQL if configured
if [ -n "${DB_HOST}" ] && [ -n "${DB_PORT}" ]; then
    wait_for_service "${DB_HOST}" "${DB_PORT}" "PostgreSQL Database"
fi

# Wait for Redis if configured (optional - app should work without Redis)
if [ -n "${REDIS_HOST}" ] && [ -n "${REDIS_PORT}" ]; then
    echo "⏳ Checking Redis at ${REDIS_HOST}:${REDIS_PORT}..."
    if nc -z "${REDIS_HOST}" "${REDIS_PORT}" 2>/dev/null; then
        echo "✅ Redis is available"
    else
        echo "⚠️  Redis is not available, continuing without Redis (it's optional)"
    fi
fi

# Ensure logs directory exists and has proper permissions
mkdir -p logs
chmod 755 logs

# Display configuration summary (without sensitive data)
echo ""
echo "🔧 Configuration Summary:"
echo "   NODE_ENV: ${NODE_ENV:-development}"
echo "   PORT: ${PORT:-4000}"
echo "   DB_HOST: ${DB_HOST:-not configured}"
echo "   REDIS_HOST: ${REDIS_HOST:-not configured}"
echo "   LOG_LEVEL: ${LOG_LEVEL:-info}"
echo ""

# Handle graceful shutdown
trap 'echo "🛑 Received shutdown signal, stopping..."; exit 0' TERM INT

# Start the application
echo "🚀 Starting Julinho Analytics API on port ${PORT:-4000}..."
echo "📊 Health check available at http://localhost:${PORT:-4000}/health"
echo "📈 API documentation at http://localhost:${PORT:-4000}/"
echo ""

# Execute the main command
exec "$@"
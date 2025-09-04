# Multi-stage build for combined frontend and backend
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM node:20-alpine as backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Final stage - combine both
FROM node:20-alpine

# Install nginx and debugging tools
RUN apk add --no-cache nginx procps net-tools

# Create app directory
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./

# Copy frontend build to nginx directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories
RUN mkdir -p /app/data /app/uploads /var/log/nginx /var/lib/nginx/tmp

# Create startup script with extensive debugging
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
set -e

echo "=== WILLS NOTES STARTUP DEBUG ==="
echo "Starting at: $(date)"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Environment variables:"
env | grep -E "(JWT_SECRET|PORT|NODE_ENV|DB_SOURCE)" || echo "No relevant env vars found"

echo "=== CHECKING FILE SYSTEM ==="
echo "Contents of /app:"
ls -la /app/ || echo "Failed to list /app"
echo "Contents of /usr/share/nginx/html:"
ls -la /usr/share/nginx/html/ || echo "Failed to list nginx html dir"
echo "Nginx config test:"
nginx -t 2>&1 || echo "Nginx config test failed"

echo "=== STARTING NGINX ==="
echo "Starting nginx in background..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "Nginx PID: $NGINX_PID"

echo "Waiting 3 seconds for nginx to start..."
sleep 3

echo "Checking if nginx process is running:"
ps aux | grep nginx || echo "No nginx processes found"

echo "Checking if nginx is listening on port 80:"
netstat -tulpn | grep :80 || echo "Nothing listening on port 80"

if kill -0 $NGINX_PID 2>/dev/null; then
    echo "✓ Nginx is running successfully (PID: $NGINX_PID)"
else
    echo "✗ ERROR: Nginx process died!"
    echo "Nginx error log:"
    cat /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
    exit 1
fi

echo "=== STARTING BACKEND ==="
echo "Checking Node.js version:"
node --version

echo "Checking if server.js exists:"
if [ -f "/app/server.js" ]; then
    echo "✓ server.js found"
    echo "First 10 lines of server.js:"
    head -10 /app/server.js
else
    echo "✗ ERROR: server.js not found!"
    exit 1
fi

echo "Starting Node.js backend..."
echo "Final process list before exec:"
ps aux

echo "Executing: exec node server.js"
exec node server.js
EOF

RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 80

# Start both services
CMD ["/app/start.sh"]
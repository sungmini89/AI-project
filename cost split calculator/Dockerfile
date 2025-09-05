# Multi-stage Docker build for Smart Split Calculator

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 3: Production image
FROM nginx:alpine AS production

# Install nodejs for any server-side requirements
RUN apk add --no-cache nodejs npm

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production dependencies for any server features
COPY --from=dependencies /app/node_modules ./node_modules

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for logs and temp files
RUN mkdir -p /var/log/nginx /var/cache/nginx /tmp /var/tmp && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
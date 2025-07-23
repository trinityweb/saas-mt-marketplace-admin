# ==============================================
# Marketplace Admin - Optimized Multi-stage Dockerfile
# ==============================================

# ==============================================
# Stage 1: Dependencies stage
# ==============================================
FROM node:18-alpine AS deps

# Install system dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# ==============================================
# Stage 2: Build stage
# ==============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Install all dependencies for build (including dev)
RUN npm ci

# Build the application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ==============================================
# Stage 3: Development stage
# ==============================================
FROM node:18-alpine AS development

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tzdata \
    && cp /usr/share/zoneinfo/UTC /etc/localtime \
    && echo "UTC" > /etc/timezone \
    && apk del tzdata

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3002/api/health || exit 1

EXPOSE 3002

CMD ["node", "server.js"]

# ==============================================
# Stage 4: Production stage
# ==============================================
FROM gcr.io/distroless/nodejs18-debian12:nonroot AS production

# Metadata
LABEL org.opencontainers.image.title="Marketplace Admin" \
      org.opencontainers.image.description="Multi-tenant Marketplace Administration" \
      org.opencontainers.image.source="https://github.com/saas-mt/marketplace-admin" \
      org.opencontainers.image.vendor="SaaS MT Team" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

USER nonroot

EXPOSE 3002

ENTRYPOINT ["node", "server.js"]

# ==============================================
# Default stage: Development
# ==============================================
FROM development
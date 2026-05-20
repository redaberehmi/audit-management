# ============================================================
# STAGE 1 — Dépendances
# ============================================================
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && cp -r node_modules node_modules_prod
RUN npm ci

# ============================================================
# STAGE 2 — Build
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ============================================================
# STAGE 3 — Production (image finale légère)
# ============================================================
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache dumb-init openssl curl
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=deps    --chown=nestjs:nodejs /app/node_modules_prod ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist             ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma           ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json     ./package.json

RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

ENV NODE_ENV=production
# Railway injecte PORT automatiquement — ne pas fixer en dur
ENV PORT=3001

EXPOSE $PORT

# Health check adaptatif (utilise $PORT)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/api/health/ping || exit 1

USER nestjs

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

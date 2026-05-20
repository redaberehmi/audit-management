# ============================================================
# STAGE 1 — Dépendances
# ============================================================
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci

# ============================================================
# STAGE 2 — Build Next.js
# NEXT_PUBLIC_API_URL est injecté au build (baked dans les bundles JS)
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Exclure les routes mock (dev only) en production
RUN rm -rf src/app/api/

RUN npm run build

# ============================================================
# STAGE 3 — Runner production (standalone output)
# ============================================================
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

USER nextjs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

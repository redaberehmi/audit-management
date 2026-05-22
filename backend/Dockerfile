FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl dumb-init curl

# Dépendances
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Génération Prisma
RUN npx prisma generate

# Code source + build
COPY . .
RUN npm run build

# Vérification que dist/main.js existe
RUN ls -la dist/ && test -f dist/main.js && echo "BUILD OK: dist/main.js found"

# Uploads
RUN mkdir -p /app/uploads

ENV NODE_ENV=production

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/health/ping || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

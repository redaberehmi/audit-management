#!/bin/bash
# ============================================================
# Script de déploiement complet — VPS (Linux)
# Usage: ./deploy/scripts/deploy-vps.sh
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log()    { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success(){ echo -e "${GREEN}✅ $1${NC}"; }
warning(){ echo -e "${YELLOW}⚠️  $1${NC}"; }
error()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

log "════════════════════════════════════════════"
log "  Audit Management — Déploiement Production"
log "════════════════════════════════════════════"

# ── Vérifications prérequis ─────────────────────────────────
command -v docker        >/dev/null 2>&1 || error "Docker n'est pas installé"
command -v docker-compose>/dev/null 2>&1 || error "Docker Compose n'est pas installé"
[ -f ".env" ]                             || error "Fichier .env manquant. Copier .env.prod.example → .env"

# ── Pull du code ────────────────────────────────────────────
log "📥 Récupération du code..."
git pull origin main
success "Code à jour"

# ── Build des images ─────────────────────────────────────────
log "🔨 Build des images Docker..."
docker-compose -f deploy/docker-compose.prod.yml build --no-cache
success "Images construites"

# ── Démarrage infra (postgres en premier) ────────────────────
log "🐘 Démarrage PostgreSQL..."
docker-compose -f deploy/docker-compose.prod.yml up -d postgres
log "Attente santé PostgreSQL (30s)..."
sleep 30

# ── Migration base de données ────────────────────────────────
log "🔄 Migration Prisma..."
docker-compose -f deploy/docker-compose.prod.yml run --rm backend \
  sh -c "npx prisma migrate deploy"
success "Migrations appliquées"

# ── Démarrage complet ────────────────────────────────────────
log "🚀 Démarrage de l'application..."
docker-compose -f deploy/docker-compose.prod.yml up -d
success "Application démarrée"

# ── Health checks ────────────────────────────────────────────
log "🔍 Vérification des services..."
sleep 15
BACKEND_HEALTH=$(curl -sf http://localhost:3001/api/health/ping 2>/dev/null | grep -c "ok" || echo "0")
if [ "$BACKEND_HEALTH" -gt 0 ]; then
  success "Backend: OK"
else
  warning "Backend: health check échoué — vérifiez: docker-compose logs backend"
fi

FRONTEND_HEALTH=$(curl -sf http://localhost:3000 >/dev/null 2>&1 && echo "1" || echo "0")
if [ "$FRONTEND_HEALTH" -eq 1 ]; then
  success "Frontend: OK"
else
  warning "Frontend: health check échoué — vérifiez: docker-compose logs frontend"
fi

# ── Résumé ───────────────────────────────────────────────────
log "════════════════════════════════════════════"
success "Déploiement terminé !"
log "  Frontend:  http://localhost:3000"
log "  Backend:   http://localhost:3001/api"
log "  Swagger:   http://localhost:3001/api/docs"
log ""
log "Commandes utiles:"
log "  Logs:    docker-compose -f deploy/docker-compose.prod.yml logs -f"
log "  Status:  docker-compose -f deploy/docker-compose.prod.yml ps"
log "  Stop:    docker-compose -f deploy/docker-compose.prod.yml down"
log "════════════════════════════════════════════"

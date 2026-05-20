#!/bin/sh
# ============================================================
# Script de migration Prisma — Production
# Usage: ./deploy/scripts/migrate.sh
# ============================================================
set -e

echo "═══════════════════════════════════════════"
echo "  Audit Management — Migration Production"
echo "═══════════════════════════════════════════"

# Vérification que DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erreur: DATABASE_URL n'est pas défini"
  exit 1
fi

cd "$(dirname "$0")/../../backend"

echo "📦 Génération du client Prisma..."
npx prisma generate

echo "🔄 Application des migrations..."
npx prisma migrate deploy

echo "✅ Migrations appliquées avec succès"

# Seed uniquement si demandé explicitement
if [ "$1" = "--seed" ]; then
  echo "🌱 Exécution du seed..."
  npm run prisma:seed
  echo "✅ Seed terminé"
fi

echo "═══════════════════════════════════════════"
echo "  Migration terminée ✅"
echo "═══════════════════════════════════════════"

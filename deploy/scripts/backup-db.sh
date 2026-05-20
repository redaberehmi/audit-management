#!/bin/sh
# ============================================================
# Backup automatique PostgreSQL — Production
# S'exécute via cron : 0 2 * * * (2h du matin chaque jour)
# Conserve les 7 derniers backups
# ============================================================
set -e

BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="audit_backup_${DATE}.sql.gz"
RETENTION_DAYS=7

echo "[$(date)] Démarrage backup..."

# Connexion et dump
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$POSTGRES_HOST" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "[$(date)] ✅ Backup créé: ${FILENAME} (${SIZE})"

# Nettoyage des anciens backups
find "$BACKUP_DIR" -name "audit_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] 🧹 Anciens backups supprimés (> ${RETENTION_DAYS} jours)"

# Liste des backups conservés
echo "[$(date)] 📦 Backups disponibles:"
ls -lh "$BACKUP_DIR"/audit_backup_*.sql.gz 2>/dev/null || echo "  Aucun backup trouvé"

echo "[$(date)] Backup terminé ✅"

# Guide de déploiement Production — Audit Management

## Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────────┐
│                    UTILISATEURS (Internet)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
         ┌─────────────────┴──────────────────┐
         │                                    │
         ▼                                    ▼
┌─────────────────┐              ┌────────────────────┐
│  VERCEL         │              │  RENDER            │
│  Frontend       │◄────REST────►│  Backend NestJS    │
│  Next.js        │   HTTPS API  │  :3001/api         │
│  (CDN mondial)  │              └──────────┬─────────┘
└─────────────────┘                         │ Prisma
                                            ▼
                               ┌────────────────────┐
                               │  SUPABASE / RENDER │
                               │  PostgreSQL 16     │
                               │  (cloud managé)    │
                               └────────────────────┘
                                            │
                               ┌────────────┴───────┐
                               │  CLOUDFLARE R2     │
                               │  Stockage fichiers │
                               │  (gratuit 10GB)    │
                               └────────────────────┘
```

## Plateformes choisies (solution simple, ~14$/mois)

| Composant  | Plateforme       | Plan        | Coût/mois |
|------------|------------------|-------------|-----------|
| Frontend   | Vercel           | Hobby       | Gratuit   |
| Backend    | Render           | Starter     | $7        |
| PostgreSQL | Render           | Starter     | $7        |
| Fichiers   | Cloudflare R2    | Free        | Gratuit   |
| Domaine    | Cloudflare       | -           | ~$10/an   |

---

## OPTION A — Déploiement Cloud Simple (Recommandé)

### Prérequis
- Compte GitHub avec le code poussé
- Compte Render (render.com)
- Compte Vercel (vercel.com)
- Compte Supabase ou Render PostgreSQL

---

### ÉTAPE 1 — Base de données PostgreSQL

#### Option 1a : Supabase (gratuit 500MB)
```
1. Aller sur https://supabase.com → New project
2. Nom: audit-management | Région: EU West
3. Récupérer la Connection string :
   Settings → Database → URI
   → postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
4. Copier cette URL → DATABASE_URL
```

#### Option 1b : Render PostgreSQL ($7/mois, recommandé prod)
```
1. render.com → New → PostgreSQL
2. Name: audit-postgres | Region: Frankfurt | Plan: Starter
3. Copier "External Database URL" → DATABASE_URL
```

---

### ÉTAPE 2 — Backend sur Render

#### Méthode A : Via render.yaml (1 clic)
```bash
# 1. Pousser le code sur GitHub
git init
git add .
git commit -m "feat: initial production setup"
git remote add origin https://github.com/VOTRE_USER/audit-management.git
git push -u origin main

# 2. Sur render.com → New → Blueprint
#    Connecter le repo → Render lit render.yaml automatiquement
```

#### Méthode B : Manuelle
```
1. render.com → New → Web Service
2. Connecter votre repo GitHub
3. Configuration :
   - Name:            audit-backend
   - Root Directory:  backend
   - Runtime:         Docker
   - Region:          Frankfurt (EU)
   - Plan:            Starter ($7/mois)

4. Variables d'environnement (onglet Environment) :
   NODE_ENV              = production
   PORT                  = 3001
   DATABASE_URL          = [votre URL PostgreSQL]
   JWT_SECRET            = [générer: openssl rand -hex 64]
   JWT_REFRESH_SECRET    = [générer: openssl rand -hex 64]
   JWT_EXPIRES_IN        = 15m
   JWT_REFRESH_EXPIRES_IN= 7d
   FRONTEND_URL          = https://audit.vercel.app  (màj après étape 3)
   SMTP_HOST             = smtp.gmail.com
   SMTP_PORT             = 587
   SMTP_USER             = votre@email.com
   SMTP_PASS             = votre_app_password
   THROTTLE_TTL          = 60
   THROTTLE_LIMIT        = 100

5. Health Check Path: /api/health/ping
6. Deploy → Copier l'URL du service: https://audit-backend.onrender.com
```

#### Migration de la base de données
```bash
# Render exécute automatiquement: npx prisma migrate deploy
# dans le CMD du Dockerfile.
# Pour seeder manuellement depuis votre machine :
cd backend
DATABASE_URL="votre_url_production" npx prisma migrate deploy
DATABASE_URL="votre_url_production" npm run prisma:seed
```

---

### ÉTAPE 3 — Frontend sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer depuis le dossier frontend
cd frontend
vercel

# Répondre aux questions :
# - Set up and deploy: Y
# - Which scope: votre compte
# - Link to existing project: N
# - Project name: audit-management
# - Directory: ./  (on est déjà dans frontend/)
# - Override settings: N

# Pour la production :
vercel --prod
```

#### Variables d'environnement sur Vercel
```
Dashboard Vercel → Project → Settings → Environment Variables

NEXT_PUBLIC_API_URL = https://audit-backend.onrender.com/api
```

> **Important** : Après avoir ajouté `NEXT_PUBLIC_API_URL`, refaire un deploy :
> ```bash
> vercel --prod
> ```

---

### ÉTAPE 4 — Mettre à jour CORS backend

Sur Render, mettre à jour la variable :
```
FRONTEND_URL = https://audit-management.vercel.app
```
(URL donnée par Vercel à l'étape 3)

Render redéploie automatiquement.

---

### ÉTAPE 5 — Domaine personnalisé (optionnel)

#### Sur Vercel
```
Project → Settings → Domains → Add Domain
Ajouter : audit.votre-domaine.com

Vercel donne les entrées DNS à configurer chez votre registrar.
```

#### Sur Render
```
Service → Settings → Custom Domains → Add Domain
Ajouter : api.votre-domaine.com

Render donne les entrées DNS à configurer.
```

#### Configurer les DNS (Cloudflare recommandé)
```
Type   Name    Content                          Proxy
CNAME  audit   cname.vercel-dns.com             ✅ Proxied
CNAME  api     audit-backend.onrender.com       ✅ Proxied
```

Le SSL/HTTPS est géré automatiquement par Vercel et Render (Let's Encrypt).

---

## OPTION B — VPS Self-Hosted (Docker Compose)

Pour un serveur Ubuntu 22.04 (ex: Hetzner CX21 = €4/mois, OVH, etc.)

### Installation du serveur

```bash
# 1. Connexion SSH
ssh root@VOTRE_IP

# 2. Installation Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin git

# 3. Certbot pour SSL
apt install -y certbot
certbot certonly --standalone -d audit.votre-domaine.com

# 4. Cloner le repo
git clone https://github.com/VOTRE_USER/audit-management.git /opt/audit
cd /opt/audit

# 5. Configurer les variables
cp .env.prod.example .env
nano .env   # Remplir toutes les valeurs

# 6. Adapter nginx.prod.conf avec votre domaine
sed -i 's/audit.votre-domaine.com/VOTRE_VRAI_DOMAINE/g' deploy/nginx/nginx.prod.conf

# 7. Déployer
chmod +x deploy/scripts/deploy-vps.sh
./deploy/scripts/deploy-vps.sh

# 8. Renouvellement SSL automatique
echo "0 0 1 * * certbot renew --quiet && docker restart audit_nginx_prod" | crontab -
```

---

## Génération des secrets JWT

```bash
# Windows PowerShell
$secret1 = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
$secret2 = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
Write-Host "JWT_SECRET=$secret1"
Write-Host "JWT_REFRESH_SECRET=$secret2"

# Linux/Mac
openssl rand -hex 64   # Pour JWT_SECRET
openssl rand -hex 64   # Pour JWT_REFRESH_SECRET
```

---

## Configuration Gmail SMTP

```
1. Compte Google → Sécurité → Validation en 2 étapes (activer)
2. Sécurité → Mots de passe des applications
3. Sélectionner "Mail" → Générer
4. Copier le mot de passe 16 caractères → SMTP_PASS
```

---

## Checklist finale avant mise en production

### Sécurité
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` générés aléatoirement (≥64 chars)
- [ ] `POSTGRES_PASSWORD` robuste (≥32 chars)
- [ ] Port 5432 PostgreSQL NON exposé publiquement
- [ ] HTTPS activé sur frontend ET backend
- [ ] CORS configuré avec l'URL exacte du frontend
- [ ] Rate limiting actif (100 req/min)
- [ ] `.env` dans `.gitignore` ✅

### Base de données
- [ ] Migrations Prisma appliquées (`prisma migrate deploy`)
- [ ] Seed exécuté avec les comptes initiaux
- [ ] Backup automatique configuré

### Application
- [ ] Health check répond : `GET /api/health/ping` → `{"status":"ok"}`
- [ ] Login fonctionne avec les comptes du seed
- [ ] Dashboard DG affiche les KPIs
- [ ] Upload de fichiers fonctionne
- [ ] Emails automatiques configurés

### Monitoring
- [ ] Render Alerts configurées (CPU/RAM)
- [ ] Uptime Robot configuré sur `/api/health/ping`
- [ ] Logs consultables dans le dashboard Render

---

## Commandes utiles après déploiement

```bash
# Voir les logs backend (Render CLI)
render logs --service audit-backend --tail

# Lancer une migration manuellement (depuis votre machine)
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Accéder à Prisma Studio sur la base de prod (ATTENTION)
DATABASE_URL="postgresql://..." npx prisma studio

# Vérifier la santé de l'API
curl https://api.votre-domaine.com/api/health

# VPS — Voir les logs
docker-compose -f deploy/docker-compose.prod.yml logs -f backend
docker-compose -f deploy/docker-compose.prod.yml logs -f nginx

# VPS — Redémarrer un service
docker-compose -f deploy/docker-compose.prod.yml restart backend
```

---

## Variables GitHub Actions Secrets

Ajouter dans **GitHub → Repository → Settings → Secrets → Actions** :

| Secret                     | Valeur                                      |
|----------------------------|---------------------------------------------|
| `RENDER_API_KEY`           | Depuis render.com → Account → API Keys      |
| `RENDER_BACKEND_SERVICE_ID`| ID du service dans l'URL Render             |
| `BACKEND_URL`              | `https://audit-backend.onrender.com`        |
| `VERCEL_TOKEN`             | Depuis vercel.com → Settings → Tokens       |
| `NEXT_PUBLIC_API_URL`      | `https://audit-backend.onrender.com/api`    |

---

## Coûts récapitulatifs

| Solution          | Coût/mois | Pour qui                              |
|-------------------|-----------|---------------------------------------|
| **Simple Cloud**  | ~$14      | Démarrage, petite équipe (<50 users)  |
| **VPS Hetzner**   | ~$10      | Contrôle total, données en Europe     |
| **Railway**       | ~$20      | Tout-en-un, le plus simple            |
| **AWS ECS+RDS**   | ~$80+     | Enterprise, haute disponibilité       |

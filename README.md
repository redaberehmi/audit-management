# Audit Management Platform

Plateforme professionnelle de gestion des audits, recommandations et plans d'actions.

## Stack Technique

| Couche      | Technologie                               |
|-------------|-------------------------------------------|
| Frontend    | Next.js 14, React 18, TypeScript          |
| UI          | TailwindCSS, Shadcn/UI, Recharts          |
| State       | Zustand, React Query                      |
| Backend     | NestJS, Node.js, TypeScript               |
| Base de données | PostgreSQL, Prisma ORM               |
| Auth        | JWT, Refresh Tokens, RBAC                 |
| Emails      | Nodemailer, SMTP configurable             |
| Exports     | ExcelJS, PDFKit                           |
| Infra       | Docker, Docker Compose                    |

## Modules

- **Auth** — JWT + Refresh tokens + RBAC (5 rôles)
- **Missions d'audit** — CRUD complet, archivage, documents
- **Recommandations** — Workflow 10 statuts, filtres, export Excel
- **Plans d'actions** — Suivi, commentaires, reports
- **Dashboard DG** — KPIs, graphiques Recharts, évolution mensuelle
- **Dashboard Audit** — Suivi missions, validations, retards
- **Notifications** — Email automatique, relances CRON, journal
- **Rapports** — PDF + Excel par période et direction
- **Documents** — Upload, téléchargement, versionning
- **Journal d'audit** — Traçabilité complète
- **Référentiels** — Directions, départements

## Installation rapide

### Prérequis

- Docker & Docker Compose
- Node.js 20+ (développement local)
- Git

### Démarrage avec Docker (recommandé)

```bash
# 1. Cloner et configurer
git clone <repo>
cd audit-management
cp .env.example .env

# 2. Éditer les secrets dans .env (JWT_SECRET, SMTP, etc.)

# 3. Lancer
docker-compose up -d

# 4. Initialiser la base de données
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed

# 5. Accéder à l'application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:3001
# Swagger:   http://localhost:3001/api/docs
```

### Développement local

```bash
# --- Backend ---
cd backend
cp .env.example .env
# Configurer DATABASE_URL dans .env

npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev

# --- Frontend (autre terminal) ---
cd frontend
cp .env.example .env

npm install
npm run dev
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@audit.com | Admin@1234 |
| Directeur Général | dg@audit.com | Admin@1234 |
| Responsable Audit | manager.audit@audit.com | Admin@1234 |
| Auditeur | auditeur@audit.com | Admin@1234 |
| Responsable Action | responsable.action@audit.com | Admin@1234 |

## Structure du projet

```
audit-management/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── auth/               # JWT, refresh tokens, strategies
│   │   ├── users/              # CRUD + RBAC
│   │   ├── missions/           # Missions d'audit
│   │   ├── recommendations/    # Recommandations + workflow
│   │   ├── action-plans/       # Plans d'actions
│   │   ├── dashboard/          # KPIs et analytics
│   │   ├── reports/            # Exports PDF + Excel
│   │   ├── documents/          # Gestion fichiers
│   │   ├── notifications/      # Emails + CRON
│   │   ├── audit-logs/         # Journal traçabilité
│   │   ├── referentials/       # Directions + départements
│   │   ├── common/             # Guards, decorators, filters
│   │   └── prisma/             # Service Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # Schéma BDD complet
│   │   └── seed.ts             # Données initiales
│   └── Dockerfile
│
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/                # Routes Next.js App Router
│   │   │   ├── (auth)/         # Pages publiques (login)
│   │   │   └── (dashboard)/    # Pages protégées
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Topbar
│   │   │   ├── dashboard/      # DG Dashboard, Audit Dashboard
│   │   │   └── ui/             # Composants UI réutilisables
│   │   ├── services/           # Appels API
│   │   ├── stores/             # State Zustand
│   │   ├── hooks/              # Hooks custom
│   │   ├── types/              # Types TypeScript
│   │   └── lib/                # Utils, Axios
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## Workflow Recommandations

```
DRAFT → OPEN → PLAN_TO_DEFINE → PLAN_TO_VALIDATE
                                       ↓
                               IN_PROGRESS / OVERDUE
                                       ↓
                                  COMPLETED
                                       ↓
                             PENDING_VALIDATION
                                       ↓
                               CLOSED / DEFERRED
```

## API Documentation

Swagger disponible en mode développement : `http://localhost:3001/api/docs`

Endpoints principaux :
- `POST /api/auth/login` — Connexion
- `POST /api/auth/refresh` — Rafraîchir token
- `GET /api/dashboard/dg` — Dashboard DG
- `GET /api/recommendations` — Lister avec filtres
- `POST /api/recommendations` — Créer
- `PATCH /api/recommendations/:id/status` — Changer statut
- `GET /api/recommendations/export/excel` — Export Excel
- `GET /api/reports/monthly/pdf` — Rapport PDF
- `GET /api/reports/monthly/excel` — Rapport Excel

## Variables d'environnement critiques

```env
JWT_SECRET=           # Secret JWT (min 32 chars, obligatoire)
JWT_REFRESH_SECRET=   # Secret refresh token
DATABASE_URL=         # URL PostgreSQL
SMTP_HOST=            # Serveur SMTP pour les emails
SMTP_USER=            # Compte SMTP
SMTP_PASS=            # Mot de passe SMTP
```

## Sécurité

- Authentification JWT avec refresh tokens rotatifs
- RBAC avec 5 niveaux de permissions
- Validation inputs (class-validator)
- Rate limiting (100 req/min par défaut)
- CORS configuré
- Logs structurés et journal d'audit
- Mots de passe hashés bcrypt (12 rounds)
- Tokens expiration courte (15min access, 7j refresh)

## Roadmap

- [ ] SSO / OAuth2
- [ ] Multi-tenant
- [ ] Stockage S3 / Azure Blob
- [ ] Notifications temps réel (WebSocket)
- [ ] Application mobile
- [ ] BI connector

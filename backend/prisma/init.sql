-- Initialisation PostgreSQL
-- Ce fichier s'exécute automatiquement au démarrage du conteneur

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Index de performance additionnels (Prisma gère les index de base)
-- Ajouté après migration Prisma si nécessaire

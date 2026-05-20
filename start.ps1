#!/usr/bin/env pwsh
# Script de démarrage Audit Management Platform (Windows PowerShell)

Write-Host "🚀 Audit Management Platform - Démarrage" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Vérification des prérequis
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé. Installez Docker Desktop depuis https://docker.com" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Copier le fichier .env si pas existant
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Fichier .env créé depuis .env.example" -ForegroundColor Yellow
    Write-Host "   Éditez .env avec vos secrets avant de continuer!" -ForegroundColor Yellow
    Write-Host "   Notamment: JWT_SECRET, SMTP_* pour les emails" -ForegroundColor Yellow
    pause
}

# Build et démarrage
Write-Host "`n📦 Construction des images Docker..." -ForegroundColor Blue
docker-compose build

Write-Host "`n🐘 Démarrage de PostgreSQL..." -ForegroundColor Blue
docker-compose up -d postgres

Write-Host "`n⏳ Attente de PostgreSQL (15s)..." -ForegroundColor Blue
Start-Sleep -Seconds 15

Write-Host "`n🔧 Démarrage du backend..." -ForegroundColor Blue
docker-compose up -d backend

Write-Host "`n⏳ Initialisation de la base de données..." -ForegroundColor Blue
Start-Sleep -Seconds 10
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed

Write-Host "`n🌐 Démarrage du frontend..." -ForegroundColor Blue
docker-compose up -d frontend

Write-Host "`n✅ Application démarrée avec succès!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "  Swagger:   http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
Write-Host "`n👤 Comptes disponibles:" -ForegroundColor Cyan
Write-Host "  Admin:    admin@audit.com / Admin@1234" -ForegroundColor White
Write-Host "  DG:       dg@audit.com / Admin@1234" -ForegroundColor White
Write-Host "  Manager:  manager.audit@audit.com / Admin@1234" -ForegroundColor White

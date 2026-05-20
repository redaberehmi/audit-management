#!/usr/bin/env pwsh
# Script de développement local (sans Docker)

Write-Host "🛠️  Mode Développement Local" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Démarrer PostgreSQL via Docker uniquement
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Créé backend\.env - Configurer DATABASE_URL" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "✅ Créé frontend\.env" -ForegroundColor Green
}

# PostgreSQL seulement
Write-Host "`n🐘 Démarrage PostgreSQL..." -ForegroundColor Blue
docker-compose up -d postgres

Start-Sleep -Seconds 8

# Backend
Write-Host "`n📦 Installation dépendances backend..." -ForegroundColor Blue
Set-Location backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

Write-Host "`n🚀 Démarrage backend (port 3001)..." -ForegroundColor Blue
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run start:dev
}

Set-Location ..

# Frontend
Write-Host "`n📦 Installation dépendances frontend..." -ForegroundColor Blue
Set-Location frontend
npm install

Write-Host "`n🌐 Démarrage frontend (port 3000)..." -ForegroundColor Blue
npm run dev

Set-Location ..

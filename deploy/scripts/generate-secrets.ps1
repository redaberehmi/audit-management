#!/usr/bin/env pwsh
# ============================================================
# Générateur de secrets production — Audit Management
# Usage: .\deploy\scripts\generate-secrets.ps1
# ============================================================

Write-Host "`n🔐 Génération des secrets de production..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

function New-SecureRandom([int]$bytes = 64) {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $buf = New-Object byte[] $bytes
    $rng.GetBytes($buf)
    return [System.Convert]::ToHexString($buf).ToLower()
}

$jwtSecret     = New-SecureRandom 64
$refreshSecret = New-SecureRandom 64
$dbPassword    = New-SecureRandom 24

Write-Host "`n📋 Copiez ces valeurs dans votre .env :" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Green
Write-Host "JWT_REFRESH_SECRET=$refreshSecret" -ForegroundColor Green
Write-Host "POSTGRES_PASSWORD=$dbPassword" -ForegroundColor Green

# Créer le fichier .env depuis le template
$envProdPath = Join-Path $PSScriptRoot "..\..\\.env.prod.example"
$envPath     = Join-Path $PSScriptRoot "..\..\.env"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envProdPath) {
        $content = Get-Content $envProdPath -Raw
        $content = $content -replace "GENERATE_64_CHAR_HEX_HERE",         $jwtSecret
        $content = $content -replace "GENERATE_ANOTHER_64_CHAR_HEX_HERE", $refreshSecret
        $content = $content -replace "CHANGE_ME_STRONG_PASSWORD_32CHARS",  $dbPassword
        Set-Content $envPath $content -Encoding utf8
        Write-Host "`n✅ Fichier .env créé avec les secrets générés" -ForegroundColor Green
        Write-Host "   → Éditez maintenant .env pour compléter DATABASE_URL, SMTP, etc." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  .env existe déjà. Copiez les valeurs ci-dessus manuellement." -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "⚠️  Ne commitez JAMAIS ces secrets dans Git !" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

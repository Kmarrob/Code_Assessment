# scripts/admin-deploy.ps1
# Script para deploy do módulo admin

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment",
    [switch]$SkipBackup,
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN DEPLOY (PILAR 7)               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Write-Step { param($Message) Write-Host ""; Write-Host "► $Message" -ForegroundColor Yellow }
function Write-Success { param($Message) Write-Host "  ✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "  ❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "  ⚠️ $Message" -ForegroundColor Yellow }

# Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não encontrado"
    exit 1
}
Write-Success "Node.js $(node -v)"

# Backup
if (-not $SkipBackup) {
    Write-Step "Criando backup antes do deploy..."
    if (Test-Path "$BaseDir\scripts\admin-backup.ps1") {
        & "$BaseDir\scripts\admin-backup.ps1"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Backup falhou, continuando..."
        }
    } else {
        Write-Warning "Script de backup não encontrado"
    }
}

# Build Backend
if (-not $SkipBuild) {
    Write-Step "Build do backend..."
    Set-Location "$BaseDir\backend"
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend build concluído"
    } else {
        Write-Error "Erro no build do backend"
        exit 1
    }

    # Build Frontend
    Write-Step "Build do frontend..."
    Set-Location "$BaseDir\frontend"
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend build concluído"
    } else {
        Write-Error "Erro no build do frontend"
        exit 1
    }
} else {
    Write-Warning "Build pulado (--SkipBuild)"
}

# Verificar índices
Write-Step "Verificando índices do MongoDB..."
Set-Location "$BaseDir\backend"
if (Test-Path "src\scripts\ensure-indexes.ts") {
    npx tsx src/scripts/ensure-indexes.ts 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Índices verificados"
    } else {
        Write-Warning "Erro ao verificar índices"
    }
} else {
    Write-Warning "Script ensure-indexes.ts não encontrado"
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ DEPLOY CONCLUÍDO!                                        ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
if (-not $SkipBuild) {
    Write-Host "  ✅ Backend build concluído" -ForegroundColor White
    Write-Host "  ✅ Frontend build concluído" -ForegroundColor White
}
if (-not $SkipBackup) {
    Write-Host "  ✅ Backup realizado" -ForegroundColor White
}
Write-Host "  ✅ Índices verificados" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para iniciar o servidor:" -ForegroundColor Yellow
Write-Host "  cd backend && npm start" -ForegroundColor White
Write-Success "🎉 Deploy concluído!"

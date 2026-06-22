# scripts/build.ps1
# Script para build do projeto

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message, $Color = 'Yellow')
    Write-Host ""
    Write-Host "► $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Host "  ✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Error {
    param($Message)
    Write-Host "  ❌ $Message" -ForegroundColor $Colors.Error
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
Write-Host "║     CODE_ASSESSMENT - BUILD (PILAR 7)                      ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/3 - DEPLOYMENT E GERENCIAMENTO                ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

$BuildDir = Join-Path $BaseDir "dist"

# ============================================
# PASSO 1: LIMPAR BUILD ANTERIOR
# ============================================
Write-Step "Limpando build anterior..." "Cyan"

if (Test-Path $BuildDir) {
    Remove-Item -Path $BuildDir -Recurse -Force
    Write-Success "Build anterior removido"
} else {
    Write-Success "Nenhum build anterior encontrado"
}

# ============================================
# PASSO 2: BUILD BACKEND
# ============================================
Write-Step "Build do backend..." "Cyan"

Set-Location "$BaseDir\backend"

try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend build concluído"
    } else {
        Write-Error "Erro no build do backend"
        exit 1
    }
} catch {
    Write-Error "Erro no build do backend: $_"
    exit 1
}

# ============================================
# PASSO 3: BUILD FRONTEND
# ============================================
Write-Step "Build do frontend..." "Cyan"

Set-Location "$BaseDir\frontend"

try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend build concluído"
    } else {
        Write-Error "Erro no build do frontend"
        exit 1
    }
} catch {
    Write-Error "Erro no build do frontend: $_"
    exit 1
}

# ============================================
# PASSO 4: COPIAR ARQUIVOS PARA DIST
# ============================================
Write-Step "Preparando arquivos para distribuição..." "Cyan"

if (-not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null
}

$backendDist = Join-Path $BaseDir "backend\dist"
if (Test-Path $backendDist) {
    Copy-Item -Path "$backendDist\*" -Destination "$BuildDir\backend\" -Recurse -Force
    Write-Success "Backend copiado para dist"
}

$frontendDist = Join-Path $BaseDir "frontend\dist"
if (Test-Path $frontendDist) {
    Copy-Item -Path "$frontendDist\*" -Destination "$BuildDir\frontend\" -Recurse -Force
    Write-Success "Frontend copiado para dist"
}

Copy-Item -Path "$BaseDir\backend\package.json" -Destination "$BuildDir\package.json" -Force
Write-Success "package.json copiado"

# ============================================
# RESULTADO FINAL
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ BUILD CONCLUÍDO!                                         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Build localizado em: $BuildDir" -ForegroundColor Yellow
Write-Host "  📁 backend/ - Código do backend" -ForegroundColor White
Write-Host "  📁 frontend/ - Código do frontend" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para iniciar em produção:" -ForegroundColor Yellow
Write-Host "  cd $BuildDir\backend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Success "🎉 Build concluído com sucesso!"

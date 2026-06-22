# scripts/setup-idempotent.ps1
# Script de setup idempotente - pode ser executado múltiplas vezes sem causar problemas

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

function Write-Warning {
    param($Message)
    Write-Host "  ⚠️ $Message" -ForegroundColor $Colors.Warning
}

function Write-Error {
    param($Message)
    Write-Host "  ❌ $Message" -ForegroundColor $Colors.Error
}

function Ensure-Directory {
    param($Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Success "Diretório criado: $Path"
        return $true
    } else {
        Write-Warning "Diretório já existe: $Path"
        return $false
    }
}

function Ensure-File {
    param($Path, $Content)
    if (-not (Test-Path $Path)) {
        $Content | Out-File -FilePath $Path -Encoding UTF8
        Write-Success "Arquivo criado: $Path"
        return $true
    } else {
        Write-Warning "Arquivo já existe: $Path"
        return $false
    }
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
Write-Host "║     CODE_ASSESSMENT - SETUP IDEMPOTENTE (PILAR 7)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 1/3 - SCRIPTS DE SETUP                           ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PASSO 1: VERIFICAR NODE.JS
# ============================================
Write-Step "Verificando Node.js..." "Cyan"

try {
    $nodeVersion = node -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js encontrado: $nodeVersion"
    } else {
        throw "Node.js não encontrado. Por favor, instale o Node.js."
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}

# ============================================
# PASSO 2: CRIAR ESTRUTURA DE DIRETÓRIOS
# ============================================
Write-Step "Criando estrutura de diretórios..." "Cyan"

$dirs = @(
    "backend/src/config",
    "backend/src/models",
    "backend/src/controllers",
    "backend/src/routes",
    "backend/src/middleware",
    "backend/src/services",
    "backend/src/utils",
    "backend/src/types",
    "backend/src/scripts",
    "backend/tests",
    "backend/logs",
    "frontend/src/pages",
    "frontend/src/components/ui",
    "frontend/src/components/admin",
    "frontend/src/hooks",
    "frontend/src/services",
    "frontend/src/utils",
    "frontend/src/types",
    "frontend/src/styles",
    "frontend/src/contexts",
    "frontend/public",
    "docs/audits",
    "scripts"
)

$newDirs = 0
foreach ($dir in $dirs) {
    $fullPath = Join-Path $BaseDir $dir
    if (Ensure-Directory -Path $fullPath) {
        $newDirs++
    }
}

if ($newDirs -eq 0) {
    Write-Warning "Nenhum novo diretório criado (todos já existem)"
} else {
    Write-Success "$newDirs novos diretórios criados"
}

# ============================================
# PASSO 3: VERIFICAR DEPENDÊNCIAS
# ============================================
Write-Step "Verificando dependências..." "Cyan"

$backendPackage = Join-Path $BaseDir "backend\package.json"
if (Test-Path $backendPackage) {
    Write-Success "Backend package.json encontrado"
} else {
    Write-Warning "Backend package.json não encontrado. Execute npm init primeiro."
}

$frontendPackage = Join-Path $BaseDir "frontend\package.json"
if (Test-Path $frontendPackage) {
    Write-Success "Frontend package.json encontrado"
} else {
    Write-Warning "Frontend package.json não encontrado. Execute npm init primeiro."
}

# ============================================
# PASSO 4: CONFIGURAR .ENV
# ============================================
Write-Step "Configurando variáveis de ambiente..." "Cyan"

$envExample = Join-Path $BaseDir "backend\.env.example"
$envFile = Join-Path $BaseDir "backend\.env"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Success ".env criado a partir de .env.example"
    } else {
        $defaultEnv = @"
# Ambiente
NODE_ENV=development
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=code_assessment

# JWT
JWT_SECRET=code_assessment_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=code_assessment_super_secret_refresh_key_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
"@
        $defaultEnv | Out-File -FilePath $envFile -Encoding UTF8
        Write-Success ".env padrão criado"
    }
} else {
    Write-Warning ".env já existe"
}

# ============================================
# PASSO 5: CRIAR SCRIPTS DE INÍCIO
# ============================================
Write-Step "Criando scripts de início..." "Cyan"

$startBackend = Join-Path $BaseDir "start-backend.ps1"
if (-not (Test-Path $startBackend)) {
    @"
# start-backend.ps1
Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
Set-Location "$BaseDir\backend"
npm run dev
"@ | Out-File -FilePath $startBackend -Encoding UTF8
    Write-Success "start-backend.ps1 criado"
} else {
    Write-Warning "start-backend.ps1 já existe"
}

$startFrontend = Join-Path $BaseDir "start-frontend.ps1"
if (-not (Test-Path $startFrontend)) {
    @"
# start-frontend.ps1
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Green
Set-Location "$BaseDir\frontend"
npm run dev
"@ | Out-File -FilePath $startFrontend -Encoding UTF8
    Write-Success "start-frontend.ps1 criado"
} else {
    Write-Warning "start-frontend.ps1 já existe"
}

# ============================================
# PASSO 6: CRIAR VERIFY-SETUP
# ============================================
Write-Step "Criando script de verificação..." "Cyan"

$verifySetup = Join-Path $BaseDir "scripts\verify-setup.ps1"
if (-not (Test-Path $verifySetup)) {
    @'
# scripts/verify-setup.ps1
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - VERIFICAÇÃO DE SETUP                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
$errors = 0
$warnings = 0
$success = 0

function Check-File {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "  ✅ $Description" -ForegroundColor Green
        $script:success++
    } else {
        Write-Host "  ❌ $Description (não encontrado)" -ForegroundColor Red
        $script:errors++
    }
}

function Check-Directory {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "  ✅ $Description" -ForegroundColor Green
        $script:success++
    } else {
        Write-Host "  ❌ $Description (não encontrado)" -ForegroundColor Red
        $script:errors++
    }
}

function Check-Command {
    param($Command, $Description)
    try {
        $result = Get-Command $Command -ErrorAction Stop
        Write-Host "  ✅ $Description" -ForegroundColor Green
        $script:success++
    } catch {
        Write-Host "  ⚠️ $Description (não encontrado)" -ForegroundColor Yellow
        $script:warnings++
    }
}

Write-Host "📋 Verificando estrutura do projeto..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 Verificando dependências globais:" -ForegroundColor Cyan
Check-Command -Command "node" -Description "Node.js"
Check-Command -Command "npm" -Description "npm"
Write-Host ""

Write-Host "📁 Verificando estrutura de diretórios:" -ForegroundColor Cyan
Check-Directory -Path "$BaseDir\backend" -Description "Pasta backend"
Check-Directory -Path "$BaseDir\frontend" -Description "Pasta frontend"
Check-Directory -Path "$BaseDir\scripts" -Description "scripts"
Write-Host ""

Write-Host "📄 Verificando arquivos importantes:" -ForegroundColor Cyan
Check-File -Path "$BaseDir\backend\package.json" -Description "backend/package.json"
Check-File -Path "$BaseDir\backend\.env" -Description "backend/.env"
Check-File -Path "$BaseDir\frontend\package.json" -Description "frontend/package.json"
Check-File -Path "$BaseDir\start-backend.ps1" -Description "start-backend.ps1"
Check-File -Path "$BaseDir\start-frontend.ps1" -Description "start-frontend.ps1"
Write-Host ""

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ RESULTADO DA VERIFICAÇÃO                                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Sucessos: $success" -ForegroundColor Green
Write-Host "  ⚠️ Avisos: $warnings" -ForegroundColor Yellow
Write-Host "  ❌ Erros: $errors" -ForegroundColor Red
Write-Host ""

if ($errors -eq 0) {
    Write-Host "✅ Setup verificado com sucesso!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Setup incompleto!" -ForegroundColor Red
    Write-Host "   Execute .\scripts\setup-idempotent.ps1 para corrigir." -ForegroundColor Yellow
    exit 1
}
'@ | Out-File -FilePath $verifySetup -Encoding UTF8
    Write-Success "verify-setup.ps1 criado"
} else {
    Write-Warning "verify-setup.ps1 já existe"
}

# ============================================
# RESULTADO FINAL
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ SETUP IDEMPOTENTE CONCLUÍDO!                             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Node.js verificado" -ForegroundColor White
Write-Host "  ✅ Estrutura de diretórios garantida" -ForegroundColor White
Write-Host "  ✅ Dependências verificadas" -ForegroundColor White
Write-Host "  ✅ .env configurado" -ForegroundColor White
Write-Host "  ✅ Scripts de início criados" -ForegroundColor White
Write-Host "  ✅ Script de verificação criado" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para verificar o setup:" -ForegroundColor Yellow
Write-Host "  .\scripts\verify-setup.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para iniciar o projeto:" -ForegroundColor Yellow
Write-Host "  Terminal 1: .\start-backend.ps1" -ForegroundColor White
Write-Host "  Terminal 2: .\start-frontend.ps1" -ForegroundColor White
Write-Host ""
Write-Success "🎉 Setup idempotente concluído!"
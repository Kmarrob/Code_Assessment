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

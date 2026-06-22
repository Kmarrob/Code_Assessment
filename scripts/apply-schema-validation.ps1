# scripts/apply-schema-validation.ps1
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     MONGODB SCHEMA VALIDATION - CODE_ASSESSMENT             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"

$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js não encontrado." -ForegroundColor Red
    exit 1
}
Write-Host "ℹ️ Node.js versão: $nodeVersion" -ForegroundColor Yellow

Set-Location "$BaseDir\backend"

Write-Host "ℹ️ Aplicando validações de schema no MongoDB Atlas..." -ForegroundColor Yellow

npx tsx src/scripts/apply-schema-validation.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Validações de schema aplicadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao aplicar validações de schema." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ SCHEMA VALIDATION COMPLETED!                             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

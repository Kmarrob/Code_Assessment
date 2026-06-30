# ============================================
# SCRIPT: executar-remocao.ps1
# OBJETIVO: Executar o script Node.js para remover "Gestão de terceiros"
# DATA: 25/06/2026
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REMOVENDO 'GESTÃO DE TERCEIROS' DOS CONTROLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Definir caminhos
$ScriptsPath = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\scripts"
$BackendPath = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\backend"

# Verificar se o script Node.js existe
$NodeScript = "$ScriptsPath\remove-gestao-terceiros.js"
if (-not (Test-Path $NodeScript)) {
    Write-Host "❌ ERRO: Script Node.js não encontrado: $NodeScript" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
$NodeVersion = & node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO: Node.js não encontrado!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js encontrado: $NodeVersion" -ForegroundColor Green

# Verificar se o mongoose está instalado
Push-Location $BackendPath

if (-not (Test-Path "node_modules\mongoose")) {
    Write-Host "📦 Instalando mongoose..." -ForegroundColor Yellow
    npm install mongoose dotenv --silent
}

Write-Host ""
Write-Host "🔄 Executando script..." -ForegroundColor Yellow
Write-Host ""

# Executar Node.js
& node $NodeScript

Pop-Location

Write-Host ""
Read-Host "Pressione Enter para sair"
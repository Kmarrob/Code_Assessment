# scripts/apply-all-security-fixes.ps1
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     APLICANDO TODAS AS CORREÇÕES DE SEGURANÇA               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Schema Validation
Write-Host "📌 1/3: Aplicando validações de schema..." -ForegroundColor Yellow
.\scripts\apply-schema-validation.ps1

# 2. Instalar dependências
Write-Host "📌 2/3: Instalando dependências..." -ForegroundColor Yellow
Set-Location "backend"
npm install
Set-Location ".."

# 3. Reiniciar servidores
Write-Host "📌 3/3: Reinicie os servidores para aplicar as mudanças." -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Todas as correções de segurança foram aplicadas!" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Para verificar as melhorias:" -ForegroundColor Cyan
Write-Host "   - Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "   - Logs de segurança: backend/logs/" -ForegroundColor White
Write-Host ""

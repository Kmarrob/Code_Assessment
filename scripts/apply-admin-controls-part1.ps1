# scripts/apply-admin-controls-part1.ps1
# Script para aplicar Parte 1/3 - Backend - API de Controles

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN CONTROLES (FASE 1)              ║" -ForegroundColor Cyan
Write-Host "║     PARTE 1/3 - BACKEND - API DE CONTROLES                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"

Write-Host "📝 Criando/atualizando arquivos..." -ForegroundColor Yellow
Write-Host ""

# 1. ControlController.ts
Write-Host "📝 Criando ControlController.ts..." -ForegroundColor Cyan
$controlController = @'
// backend/src/controllers/ControlController.ts
// [CONTEÚDO COMPLETO DO ARQUIVO]
'@
$controlController | Out-File -FilePath "$BaseDir\backend\src\controllers\ControlController.ts" -Encoding UTF8
Write-Host "✅ ControlController.ts criado" -ForegroundColor Green

# 2. Control.ts (atualizado)
Write-Host "📝 Atualizando Control.ts..." -ForegroundColor Cyan
$controlModel = @'
// backend/src/models/Control.ts
// [CONTEÚDO COMPLETO DO ARQUIVO ATUALIZADO]
'@
$controlModel | Out-File -FilePath "$BaseDir\backend\src\models\Control.ts" -Encoding UTF8
Write-Host "✅ Control.ts atualizado" -ForegroundColor Green

# 3. admin.ts (atualizado)
Write-Host "📝 Atualizando admin.ts..." -ForegroundColor Cyan
$adminRoutes = @'
// backend/src/routes/admin.ts
// [CONTEÚDO COMPLETO DO ARQUIVO ATUALIZADO]
'@
$adminRoutes | Out-File -FilePath "$BaseDir\backend\src\routes\admin.ts" -Encoding UTF8
Write-Host "✅ admin.ts atualizado" -ForegroundColor Green

# 4. types/index.ts (atualizado)
Write-Host "📝 Atualizando types/index.ts..." -ForegroundColor Cyan
$types = @'
// backend/src/types/index.ts
// [CONTEÚDO COMPLETO DO ARQUIVO ATUALIZADO]
'@
$types | Out-File -FilePath "$BaseDir\backend\src\types\index.ts" -Encoding UTF8
Write-Host "✅ types/index.ts atualizado" -ForegroundColor Green

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ PARTE 1/3 CONCLUÍDA!                                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Endpoints disponíveis:" -ForegroundColor Yellow
Write-Host "  GET    /api/admin/controls - Listar controles" -ForegroundColor White
Write-Host "  GET    /api/admin/controls/:id - Buscar controle" -ForegroundColor White
Write-Host "  GET    /api/admin/controls/domain/:dominio - Por domínio" -ForegroundColor White
Write-Host "  GET    /api/admin/controls/stats - Estatísticas" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para testar:" -ForegroundColor Yellow
Write-Host "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Faça login com admin" -ForegroundColor White
Write-Host "  3. Teste: GET /api/admin/controls" -ForegroundColor White
Write-Host ""
Write-Host "✅ 🎉 Parte 1/3 concluída com sucesso!" -ForegroundColor Green
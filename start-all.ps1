# start-all.ps1
Write-Host "🚀 Iniciando Code_Assessment..." -ForegroundColor Green
Write-Host ""
Write-Host "ℹ️ Abrindo terminais separados..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Backend e Frontend iniciados!" -ForegroundColor Green
Write-Host "   Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan

# scripts/mongo-manage.ps1
# Script para gerenciar coleções do MongoDB

Stop = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - MONGODB MANAGEMENT                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\backend\.env = Join-Path C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment "backend\.env"

if (-not (Test-Path C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\backend\.env)) {
    Write-Error ".env não encontrado"
    exit 1
}

# Ambiente NODE_ENV=development PORT=3000  # MongoDB Atlas MONGODB_URI=mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0 MONGODB_DB_NAME=code_assessment  # JWT JWT_SECRET=code_assessment_super_secret_jwt_key_2026_change_in_production JWT_REFRESH_SECRET=code_assessment_super_secret_refresh_key_2026_change_in_production JWT_ACCESS_EXPIRES_IN=15m JWT_REFRESH_EXPIRES_IN=7d  # CORS CORS_ORIGIN=http://localhost:5173  # Rate Limiting RATE_LIMIT_WINDOW_MS=900000 RATE_LIMIT_MAX=100 = Get-Content C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\backend\.env
mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0 = # Ambiente NODE_ENV=development PORT=3000  # MongoDB Atlas MONGODB_URI=mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0 MONGODB_DB_NAME=code_assessment  # JWT JWT_SECRET=code_assessment_super_secret_jwt_key_2026_change_in_production JWT_REFRESH_SECRET=code_assessment_super_secret_refresh_key_2026_change_in_production JWT_ACCESS_EXPIRES_IN=15m JWT_REFRESH_EXPIRES_IN=7d  # CORS CORS_ORIGIN=http://localhost:5173  # Rate Limiting RATE_LIMIT_WINDOW_MS=900000 RATE_LIMIT_MAX=100 | Where-Object {  -match "^MONGODB_URI=" } | ForEach-Object {  -replace "^MONGODB_URI=", "" }

if (-not mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0) {
    Write-Error "MONGODB_URI não encontrada"
    exit 1
}

Write-Host "📋 Opções disponíveis:" -ForegroundColor Yellow
Write-Host "  1. Listar coleções" -ForegroundColor White
Write-Host "  2. Mostrar estatísticas" -ForegroundColor White
Write-Host "  3. Backup de coleção" -ForegroundColor White
Write-Host "  4. Sair" -ForegroundColor White
Write-Host ""

 = Read-Host "Selecione uma opção"

switch () {
    "1" {
        Write-Host "📋 Listando coleções..." -ForegroundColor Yellow
        mongosh "mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0" --eval "db.getCollectionInfos().forEach(c => print(c.name))" --quiet
    }
    "2" {
        Write-Host "📋 Estatísticas das coleções..." -ForegroundColor Yellow
        mongosh "mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0" --eval "
            db.getCollectionInfos().forEach(c => {
                const coll = db.getCollection(c.name);
                const count = coll.countDocuments();
                print(c.name + ': ' + count + ' documentos');
            })
        " --quiet
    }
    "3" {
         = Read-Host "Nome da coleção para backup"
         = Join-Path C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment "backups"
        if (-not (Test-Path )) {
            New-Item -ItemType Directory -Path  -Force | Out-Null
        }
         = Join-Path  "-20260617-201810.json"
        Write-Host "📋 Fazendo backup de  para ..." -ForegroundColor Yellow
        mongosh "mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0" --eval "db..find().toArray()" --quiet | Out-File -FilePath  -Encoding UTF8
        Write-Success "Backup criado: "
    }
    "4" {
        Write-Host "Saindo..." -ForegroundColor Yellow
    }
    default {
        Write-Error "Opção inválida"
    }
}

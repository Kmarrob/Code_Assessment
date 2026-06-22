# Criar admin-backup.ps1
@'
# scripts/admin-backup.ps1
# Script para backup de dados do módulo admin

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment",
    [string]$ApiUrl = "http://localhost:3000/api",
    [string]$Email = "admin@codeassessment.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN BACKUP (PILAR 7)               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BackupDir = Join-Path $BaseDir "backups"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupFile = Join-Path $BackupDir "admin-backup-$Timestamp.json"

function Write-Step { param($Message) Write-Host ""; Write-Host "► $Message" -ForegroundColor Yellow }
function Write-Success { param($Message) Write-Host "  ✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "  ❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "  ℹ️ $Message" -ForegroundColor Blue }

function Login-Admin {
    Write-Step "Fazendo login como admin..."
    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $script:Token = $response.data.tokens.accessToken
        Write-Success "Login realizado"
        return $true
    } catch {
        Write-Error "Erro ao fazer login: $_"
        return $false
    }
}

function Get-AllUsers {
    $headers = @{ "Authorization" = "Bearer $Token" }
    $allUsers = @(); $page = 1; $limit = 50; $totalPages = 1
    do {
        try {
            $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users?page=$page&limit=$limit" -Method Get -Headers $headers
            $allUsers += $response.data.users
            $totalPages = $response.pagination.totalPages
            $page++
        } catch {
Write-Error "Erro ao buscar usuários na página ${page}: $_"
            return $null
        }
    } while ($page -le $totalPages)
    return $allUsers
}

if (-not (Login-Admin)) { exit 1 }

Write-Step "Preparando diretório de backup..."
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Success "Diretório de backup criado: $BackupDir"
} else {
    Write-Success "Diretório de backup encontrado"
}

Write-Step "Exportando dados de usuários..."
$users = Get-AllUsers
if (-not $users) { Write-Error "Não foi possível exportar dados"; exit 1 }
Write-Info "$($users.Count) usuários exportados"

Write-Step "Salvando backup..."
$backupData = @{
    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    totalUsers = $users.Count
    users = $users
    metadata = @{
        version = "1.0.0"
        exportedBy = $Email
        source = "Code_Assessment Admin Module"
    }
}
$backupData | ConvertTo-Json -Depth 10 | Out-File -FilePath $BackupFile -Encoding UTF8
Write-Success "Backup salvo: $BackupFile"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ BACKUP CONCLUÍDO!                                        ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  📁 Backup: $BackupFile" -ForegroundColor White
Write-Host "  👥 Usuários: $($users.Count)" -ForegroundColor White
Write-Host "  📅 Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
Write-Success "🎉 Backup concluído!"
'@ | Out-File -FilePath "scripts\admin-backup.ps1" -Encoding UTF8

Write-Host "✅ admin-backup.ps1 criado" -ForegroundColor Green
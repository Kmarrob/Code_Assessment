# scripts/admin-restore.ps1
# Script para restore de dados do módulo admin

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment",
    [string]$ApiUrl = "http://localhost:3000/api",
    [string]$Email = "admin@codeassessment.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN RESTORE (PILAR 7)              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BackupDir = Join-Path $BaseDir "backups"

function Write-Step { param($Message) Write-Host ""; Write-Host "► $Message" -ForegroundColor Yellow }
function Write-Success { param($Message) Write-Host "  ✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "  ❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "  ⚠️ $Message" -ForegroundColor Yellow }
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

function Create-User {
    param($UserData)
    $headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }
    $body = $UserData | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users" -Method Post -Headers $headers -Body $body
        Write-Success "Usuário restaurado: $($UserData.email)"
        return $true
    } catch {
        Write-Error "Erro ao restaurar usuário $($UserData.email): $_"
        return $false
    }
}

if (-not (Test-Path $BackupDir)) {
    Write-Error "Diretório de backup não encontrado: $BackupDir"
    exit 1
}

Write-Step "Listando backups disponíveis..."
$backupFiles = Get-ChildItem -Path $BackupDir -Filter "admin-backup-*.json" | Sort-Object LastWriteTime -Descending

if ($backupFiles.Count -eq 0) {
    Write-Error "Nenhum backup encontrado"
    exit 1
}

Write-Host "📋 Backups disponíveis:" -ForegroundColor Yellow
for ($i = 0; $i -lt $backupFiles.Count -and $i -lt 10; $i++) {
    $file = $backupFiles[$i]
    $size = [math]::Round($file.Length / 1KB, 2)
    Write-Host "  [$($i+1)] $($file.Name) - $($file.LastWriteTime) - ${size}KB" -ForegroundColor White
}

$choice = Read-Host "`nSelecione o número do backup para restaurar (1-$($backupFiles.Count))"
$index = [int]$choice - 1
if ($index -lt 0 -or $index -ge $backupFiles.Count) {
    Write-Error "Seleção inválida"
    exit 1
}
$selectedFile = $backupFiles[$index]

if (-not (Login-Admin)) { exit 1 }

Write-Step "Restaurando backup: $($selectedFile.Name)"
$backupData = Get-Content $selectedFile.FullName | ConvertFrom-Json
Write-Info "$($backupData.users.Count) usuários encontrados no backup"

$confirm = Read-Host "Deseja restaurar os dados? Isso pode criar usuários duplicados. (s/N)"
if ($confirm -ne "s") { Write-Host "Operação cancelada"; exit 0 }

$restored = 0
$failed = 0

foreach ($user in $backupData.users) {
    $userData = @{
        name = $user.name
        email = $user.email
        password = "Teste@123456"
        role = $user.role
        company = $user.company
        department = $user.department
    }
    if (Create-User -UserData $userData) {
        $restored++
    } else {
        $failed++
    }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ RESTORE CONCLUÍDO!                                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  📁 Backup: $($selectedFile.Name)" -ForegroundColor White
Write-Host "  ✅ Restaurados: $restored" -ForegroundColor Green
Write-Host "  ❌ Falhas: $failed" -ForegroundColor Red
Write-Host ""
Write-Success "🎉 Restore concluído!"

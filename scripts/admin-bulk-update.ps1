# scripts/admin-bulk-update.ps1
# Script para atualização em massa de usuários via API

param(
    [string]$ApiUrl = "http://localhost:3000/api",
    [string]$Email = "admin@codeassessment.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN BULK UPDATE (PILAR 7)          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

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

function Get-Users {
    $headers = @{ "Authorization" = "Bearer $Token" }
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users?limit=100" -Method Get -Headers $headers
        return $response.data.users
    } catch {
        Write-Error "Erro ao listar usuários: $_"
        return $null
    }
}

function Update-User {
    param($UserId, $UpdateData)
    $headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }
    $body = $UpdateData | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users/$UserId" -Method Put -Headers $headers -Body $body
        Write-Success "Usuário atualizado: $UserId"
        return $true
    } catch {
        Write-Error "Erro ao atualizar usuário: $_"
        return $false
    }
}

if (-not (Login-Admin)) { exit 1 }

Write-Step "Listando usuários..."
$users = Get-Users
if (-not $users) { Write-Error "Não foi possível listar usuários"; exit 1 }
Write-Info "$($users.Count) usuários encontrados"

Write-Step "Definindo atualizações..."
$updates = @()
foreach ($user in $users) {
    if ($user.company -eq "Empresa A") {
        $updates += @{ id = $user._id; data = @{ company = "Empresa A - Atualizada" } }
    }
}
Write-Info "$($updates.Count) usuários serão atualizados"

Write-Step "Atualizando usuários..."
$updated = 0; $failed = 0
foreach ($update in $updates) {
    if (Update-User -UserId $update.id -UpdateData $update.data) { $updated++ } else { $failed++ }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ ATUALIZAÇÃO EM MASSA CONCLUÍDA!                          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Atualizados: $updated" -ForegroundColor Green
Write-Host "  ❌ Falhas: $failed" -ForegroundColor Red

# scripts/admin-bulk-deactivate.ps1
# Script para desativação em massa de usuários via API

param(
    [string]$ApiUrl = "http://localhost:3000/api",
    [string]$Email = "admin@codeassessment.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN BULK DEACTIVATE (PILAR 7)      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

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

function Deactivate-User {
    param($UserId)
    $headers = @{ "Authorization" = "Bearer $Token" }
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users/$UserId" -Method Delete -Headers $headers
        Write-Success "Usuário desativado: $UserId"
        return $true
    } catch {
        Write-Error "Erro ao desativar usuário: $_"
        return $false
    }
}

if (-not (Login-Admin)) { exit 1 }

Write-Step "Listando usuários..."
$users = Get-Users
if (-not $users) { Write-Error "Não foi possível listar usuários"; exit 1 }
Write-Info "$($users.Count) usuários encontrados"

Write-Step "Selecionando usuários para desativação..."
$toDeactivate = @()
foreach ($user in $users) {
    if ($user.email -eq "admin@codeassessment.com") {
        Write-Warning "Usuário admin ignorado: $($user.email)"
        continue
    }
    $toDeactivate += $user
}
Write-Info "$($toDeactivate.Count) usuários serão desativados"

$confirm = Read-Host "Confirmar desativação? (s/N)"
if ($confirm -ne "s") { Write-Host "Operação cancelada"; exit 0 }

Write-Step "Desativando usuários..."
$deactivated = 0; $failed = 0
foreach ($user in $toDeactivate) {
    if (Deactivate-User -UserId $user._id) { $deactivated++ } else { $failed++ }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ DESATIVAÇÃO EM MASSA CONCLUÍDA!                          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Desativados: $deactivated" -ForegroundColor Green
Write-Host "  ❌ Falhas: $failed" -ForegroundColor Red

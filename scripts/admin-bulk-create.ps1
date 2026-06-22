# scripts/admin-bulk-create.ps1
# Script para criação em massa de usuários via API

param(
    [string]$ApiUrl = "http://localhost:3000/api",
    [string]$Email = "admin@codeassessment.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN BULK CREATE (PILAR 7)          ║" -ForegroundColor Cyan
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

function Create-User {
    param($UserData)
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    $body = $UserData | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users" -Method Post -Headers $headers -Body $body
        Write-Success "Usuário criado: $($UserData.email)"
        return $true
    } catch {
        Write-Error "Erro ao criar usuário $($UserData.email): $_"
        return $false
    }
}

if (-not (Login-Admin)) { exit 1 }

Write-Step "Definindo usuários a serem criados..."

# Lista de usuários para criar com senhas aleatórias
$users = @(
    @{
        name = "João Silva"
        email = "joao.silva@empresa.com"
        password = "P@ssw0rd#2024!J"
        role = "user"
        company = "Empresa A"
        department = "TI"
    },
    @{
        name = "Maria Santos"
        email = "maria.santos@empresa.com"
        password = "S3cur3#M@ria!2025"
        role = "user"
        company = "Empresa A"
        department = "RH"
    },
    @{
        name = "Pedro Oliveira"
        email = "pedro.oliveira@empresa.com"
        password = "Pr0t3c@o#2024!P"
        role = "rep"
        company = "Empresa A"
        department = "Financeiro"
    },
    @{
        name = "Ana Costa"
        email = "ana.costa@empresa.com"
        password = "C0st@#S3cur3!2024"
        role = "consultant"
        company = "Empresa A"
        department = "Consultoria"
    },
    @{
        name = "Carlos Pereira"
        email = "carlos.pereira@empresa.com"
        password = "P3r3ir@#S3cur3!2025"
        role = "user"
        company = "Empresa B"
        department = "Operações"
    }
)
Write-Info "$($users.Count) usuários serão criados"

Write-Step "Criando usuários..."
$created = 0
$failed = 0

foreach ($user in $users) {
    if (Create-User -UserData $user) {
        $created++
    } else {
        $failed++
    }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ CRIAÇÃO EM MASSA CONCLUÍDA!                              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Criados: $created" -ForegroundColor Green
Write-Host "  ❌ Falhas: $failed" -ForegroundColor Red
Write-Host ""
Write-Success "🎉 Criação em massa concluída!"
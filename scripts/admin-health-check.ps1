# scripts/admin-health-check.ps1
# Script para verificar saúde do módulo admin

param(
    [string]$ApiUrl = "http://localhost:3000/api",
    [string]$Email = "admin@codeassessment.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = 'Continue'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - ADMIN HEALTH CHECK (PILAR 7)          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$Issues = @()
$Passed = 0
$Failed = 0
$Token = $null

function Write-Step { param($Message) Write-Host ""; Write-Host "► $Message" -ForegroundColor Yellow }
function Write-Success { param($Message) Write-Host "  ✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "  ❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "  ⚠️ $Message" -ForegroundColor Yellow }

function Login-Admin {
    Write-Step "Fazendo login para autenticação..."
    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $script:Token = $response.data.tokens.accessToken
        Write-Success "Login realizado para health check"
        return $true
    } catch {
        Write-Error "Erro ao fazer login: $_"
        $script:Issues += "Erro ao fazer login"
        return $false
    }
}

function Check-ApiHealth {
    Write-Step "Verificando API..."
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/../health" -Method Get -TimeoutSec 5
        Write-Success "API Online"
        return $true
    } catch {
        Write-Error "API Offline: $_"
        $script:Issues += "API Offline"
        return $false
    }
}

function Check-Database {
    Write-Step "Verificando banco de dados..."
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/../health" -Method Get -TimeoutSec 5
        if ($response.database -eq "connected") {
            Write-Success "Banco de dados conectado"
            return $true
        } else {
            Write-Error "Banco de dados desconectado"
            $script:Issues += "Banco de dados desconectado"
            return $false
        }
    } catch {
        Write-Error "Erro ao verificar banco de dados: $_"
        $script:Issues += "Erro ao verificar banco de dados"
        return $false
    }
}

function Check-AdminEndpoints {
    Write-Step "Verificando endpoints admin..."
    if (-not $Token) {
        if (-not (Login-Admin)) {
            $script:Issues += "Não foi possível autenticar para verificar endpoints"
            return $false
        }
    }
    
    try {
        $headers = @{ "Authorization" = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$ApiUrl/admin/users?limit=1" -Method Get -Headers $headers -TimeoutSec 5
        Write-Success "Endpoint /admin/users OK"
        return $true
    } catch {
        Write-Error "Endpoint /admin/users falhou: $_"
        $script:Issues += "Endpoint /admin/users falhou"
        return $false
    }
}

function Check-Memory {
    Write-Step "Verificando uso de memória..."
    try {
        $memory = Get-WmiObject -Class Win32_OperatingSystem -ErrorAction SilentlyContinue
        if ($memory) {
            $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
            $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
            $usedMemory = $totalMemory - $freeMemory
            $percentage = [math]::Round(($usedMemory / $totalMemory) * 100, 2)
            
            if ($percentage -lt 80) {
                Write-Success "Memória OK ($usedMemory GB / $totalMemory GB - $percentage%)"
            } else {
                Write-Warning "Alto uso de memória ($usedMemory GB / $totalMemory GB - $percentage%)"
                $script:Issues += "Alto uso de memória"
            }
        } else {
            Write-Warning "Não foi possível verificar memória"
        }
        return $true
    } catch {
        Write-Warning "Não foi possível verificar memória"
        return $true
    }
}

function Check-DiskSpace {
    Write-Step "Verificando espaço em disco..."
    try {
        $drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'" -ErrorAction SilentlyContinue
        if ($drive) {
            $freeSpace = [math]::Round($drive.FreeSpace / 1GB, 2)
            $totalSpace = [math]::Round($drive.Size / 1GB, 2)
            $usedSpace = $totalSpace - $freeSpace
            $percentage = [math]::Round(($usedSpace / $totalSpace) * 100, 2)
            
            if ($percentage -lt 80) {
                Write-Success "Espaço em disco OK ($freeSpace GB livre de $totalSpace GB)"
            } else {
                Write-Warning "Pouco espaço em disco ($freeSpace GB livre de $totalSpace GB - $percentage%)"
                $script:Issues += "Pouco espaço em disco"
            }
        } else {
            Write-Warning "Não foi possível verificar espaço em disco"
        }
        return $true
    } catch {
        Write-Warning "Não foi possível verificar espaço em disco"
        return $true
    }
}

Write-Host "📋 Executando verificações..." -ForegroundColor Yellow

$checks = @(
    @{ Name = "API Health"; Function = { Check-ApiHealth } },
    @{ Name = "Database"; Function = { Check-Database } },
    @{ Name = "Admin Endpoints"; Function = { Check-AdminEndpoints } },
    @{ Name = "Memory Usage"; Function = { Check-Memory } },
    @{ Name = "Disk Space"; Function = { Check-DiskSpace } }
)

foreach ($check in $checks) {
    if (& $check.Function) { $Passed++ } else { $Failed++ }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ HEALTH CHECK CONCLUÍDO!                                  ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Passou: $Passed" -ForegroundColor Green
Write-Host "  ❌ Falhas: $Failed" -ForegroundColor Red

if ($Issues.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Problemas encontrados:" -ForegroundColor Yellow
    foreach ($issue in $Issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✅ Todos os checks passaram! Sistema saudável." -ForegroundColor Green
}
Write-Success "🎉 Health Check concluído!"

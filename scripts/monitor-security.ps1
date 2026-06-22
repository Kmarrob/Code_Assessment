# scripts/monitor-security.ps1
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - MONITOR DE SEGURANÇA E PERFORMANCE    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
$logFile = "$BaseDir\backend\logs\combined.log"

if (-not (Test-Path $logFile)) {
    Write-Host "⚠️ Arquivo de log não encontrado. Execute o backend primeiro." -ForegroundColor Yellow
    exit 0
}

function CountEvents($pattern) {
    return (Select-String -Path $logFile -Pattern $pattern -AllMatches).Matches.Count
}

function GetRecentEvents($pattern, $count = 20) {
    return Select-String -Path $logFile -Pattern $pattern | Select-Object -Last $count
}

Write-Host "📊 ESTATÍSTICAS DE SEGURANÇA E PERFORMANCE" -ForegroundColor Yellow
Write-Host ""

$loginSuccess = CountEvents "LOGIN_SUCCESS"
$loginFailed = CountEvents "LOGIN_FAILED"
$accessDenied = CountEvents "ACCESS_DENIED"
$tokenRefresh = CountEvents "TOKEN_REFRESH"
$suspicious = CountEvents "SUSPICIOUS_ACTIVITY|BRUTE_FORCE_DETECTED"

Write-Host "🔐 Segurança:" -ForegroundColor Cyan
Write-Host "  ✅ Logins bem-sucedidos: $loginSuccess" -ForegroundColor Green
Write-Host "  ❌ Logins falhos: $loginFailed" -ForegroundColor Red
Write-Host "  🚫 Acessos negados: $accessDenied" -ForegroundColor Yellow
Write-Host "  🔄 Refresh tokens: $tokenRefresh" -ForegroundColor Cyan
Write-Host "  ⚠️ Atividades suspeitas: $suspicious" -ForegroundColor Magenta

$error400 = CountEvents "statusCode\":400"
$error401 = CountEvents "statusCode\":401"
$error403 = CountEvents "statusCode\":403"
$error404 = CountEvents "statusCode\":404"
$error500 = CountEvents "statusCode\":500"
$error503 = CountEvents "statusCode\":503"

Write-Host ""
Write-Host "📡 Erros por Status:" -ForegroundColor Cyan
Write-Host "  400 (Bad Request): $error400" -ForegroundColor Yellow
Write-Host "  401 (Unauthorized): $error401" -ForegroundColor Yellow
Write-Host "  403 (Forbidden): $error403" -ForegroundColor Yellow
Write-Host "  404 (Not Found): $error404" -ForegroundColor Yellow
Write-Host "  500 (Server Error): $error500" -ForegroundColor Red
Write-Host "  503 (Service Unavailable): $error503" -ForegroundColor Red

$slowRequests = Select-String -Path $logFile -Pattern "PERFORMANCE.*[0-9]{4,}ms" | Select-Object -Last 10

Write-Host ""
Write-Host "🐢 Últimas requisições lentas (>1000ms):" -ForegroundColor Cyan
if ($slowRequests) {
    $slowRequests | ForEach-Object {
        $line = $_.Line
        if ($line -match "(\d+)ms") {
            $duration = [int]$matches[1]
            $color = if ($duration -gt 5000) { "Red" } elseif ($duration -gt 3000) { "Yellow" } else { "Gray" }
            Write-Host "  $line" -ForegroundColor $color
        }
    }
} else {
    Write-Host "  Nenhuma requisição lenta encontrada." -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔔 Últimos eventos de segurança:" -ForegroundColor Cyan
$securityEvents = GetRecentEvents "SECURITY" 10
if ($securityEvents) {
    $securityEvents | ForEach-Object {
        $line = $_.Line
        if ($line -match "FAILED") {
            Write-Host "  ❌ $line" -ForegroundColor Red
        } elseif ($line -match "SUSPICIOUS|BRUTE_FORCE") {
            Write-Host "  ⚠️ $line" -ForegroundColor Magenta
        } else {
            Write-Host "  ✅ $line" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  Nenhum evento de segurança recente." -ForegroundColor Gray
}

Write-Host ""
Write-Host "ℹ️ Para monitorar em tempo real:" -ForegroundColor Cyan
Write-Host "   Get-Content -Path '$logFile' -Wait | Select-String 'SECURITY|PERFORMANCE|ERROR'" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Acesse:" -ForegroundColor Cyan
Write-Host "   Health check: http://localhost:3000/health/detailed" -ForegroundColor White
Write-Host "   Performance: http://localhost:3000/performance" -ForegroundColor White
Write-Host "   Memory: http://localhost:3000/memory" -ForegroundColor White

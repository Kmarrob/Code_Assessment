# ============================================
# SCRIPT: remove-gestao-terceiros.ps1
# OBJETIVO: Remover "Gestão de terceiros" de capacidadesOperacionais via Node.js/Mongoose
# DATA: 24/06/2026
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REMOVENDO 'GESTÃO DE TERCEIROS' DOS CONTROLES" -ForegroundColor Cyan
Write-Host "  (VIA API DO MONGODB ATLAS)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# CARREGAR VARIÁVEIS DE AMBIENTE
# ============================================

$BackendPath = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\backend"

# Carregar variáveis de ambiente do arquivo .env
if (Test-Path "$BackendPath\.env") {
    Write-Host "📄 Carregando variáveis de ambiente..." -ForegroundColor Yellow
    Get-Content "$BackendPath\.env" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value -Force
        }
    }
    Write-Host "✅ Variáveis carregadas" -ForegroundColor Green
    Write-Host ""
}

$MongoUri = $env:MONGODB_URI

if ([string]::IsNullOrEmpty($MongoUri)) {
    Write-Host "❌ ERRO: MONGODB_URI não encontrada!" -ForegroundColor Red
    Write-Host "   Certifique-se de que a variável MONGODB_URI está definida no arquivo .env" -ForegroundColor Yellow
    exit 1
}

# ============================================
# EXTRAIR INFORMAÇÕES DA URI
# ============================================

Write-Host "🔍 Extraindo informações da URI..." -ForegroundColor Yellow

# Extrair cluster, usuário e banco de dados da URI
if ($MongoUri -match 'mongodb\+srv://([^:]+):([^@]+)@([^/]+)/([^?]+)') {
    $User = $matches[1]
    $Cluster = $matches[3]
    $Database = $matches[4]
    
    Write-Host "   ✅ Usuário: $User" -ForegroundColor Green
    Write-Host "   ✅ Cluster: $Cluster" -ForegroundColor Green
    Write-Host "   ✅ Database: $Database" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO: Não foi possível extrair todas as informações estruturadas da URI (mas prosseguindo com a conexão...)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# EXECUÇÃO VIA NODE.JS (SCRIPT TEMPORÁRIO)
# ============================================

Write-Host "🔄 Preparando ambiente Node.js..." -ForegroundColor Yellow

# Criar script Node.js temporário (escapando corretamente os caracteres de template literal do JS no PowerShell)
$NodeScript = @"
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Como o PowerShell mudará o diretório para a pasta do backend, lemos o .env daqui
dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'code_assessment';

async function main() {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('✅ Conectado com sucesso!');
    
    // Esquema flexível para manipulação direta da coleção 'controls'
    const Control = mongoose.model('Control', new mongoose.Schema({}, { strict: false }), 'controls');
    
    // 1. Contar controles que possuem o termo
    const countBefore = await Control.countDocuments({
        capacidadesOperacionais: { \`$in\`: ['Gestão de terceiros'] }
    });
    console.log(\`📊 Controles encontrados com "Gestão de terceiros": \${countBefore}\`);
    
    if (countBefore === 0) {
        console.log('✅ Nenhum documento precisa de alteração.');
        await mongoose.disconnect();
        return;
    }
    
    // 2. Listar controles que serão afetados
    const affected = await Control.find({
        capacidadesOperacionais: { \`$in\`: ['Gestão de terceiros'] }
    }).lean();
    
    console.log('📋 Documentos identificados:');
    affected.forEach(c => {
        const identificador = c.nome || c.descricao || c.control || 'Nome não definido';
        console.log(\`   - ID: \${c._id} | Referência: \${identificador}\`);
    });
    
    // 3. Executar a remoção do item dentro do array utilizando o \$pull
    console.log('⚙️ Removendo o termo "Gestão de terceiros" dos arrays...');
    const result = await Control.updateMany(
        { capacidadesOperacionais: { \`$in\`: ['Gestão de terceiros'] } },
        { \`$pull\`: { capacidadesOperacionais: 'Gestão de terceiros' } }
    );
    
    console.log(\`✅ Total de documentos modificados no Atlas: \${result.modifiedCount}\`);
    
    // 4. Validação final de segurança
    const countAfter = await Control.countDocuments({
        capacidadesOperacionais: { \`$in\`: ['Gestão de terceiros'] }
    });
    
    if (countAfter === 0) {
        console.log('🎉 Sucesso! "Gestão de terceiros" foi completamente limpo da base de dados.');
    } else {
        console.log(\`⚠️ Atenção: Ainda restaram \${countAfter} documentos pendentes.\`);
    }
    
    await mongoose.disconnect();
    console.log('🔌 Conexão encerrada com segurança.');
}

main().catch(err => {
    console.error('❌ Erro crítico na execução do script Node:', err);
    process.exit(1);
});
"@

# Salvar o script temporário no diretório temporário do sistema
$TempNodeScript = "$env:TEMP\remove-gestao-terceiros-temp.js"
$NodeScript | Out-File -FilePath $TempNodeScript -Encoding UTF8

try {
    # Navegar dinamicamente para a pasta do backend onde o node_modules está (ou será instalado)
    Push-Location $BackendPath
    
    # Garantir que as dependências necessárias existam no escopo do projeto backend
    if (-not (Test-Path "node_modules\mongoose") -or -not (Test-Path "node_modules\dotenv")) {
        Write-Host "📦 Dependências faltando. Instalando mongoose e dotenv localmente..." -ForegroundColor Yellow
        npm install mongoose dotenv --silent
    }
    
    Write-Host ""
    Write-Host "🚀 Executando rotina de banco de dados..." -ForegroundColor Cyan
    Write-Host ""
    
    # Invocar o Node de forma síncrona capturando a saída de logs do JS
    $Output = & node $TempNodeScript 2>&1
    Write-Host $Output -ForegroundColor White
    
    Pop-Location
    
} catch {
    Write-Host "❌ Erro inesperado no fluxo do PowerShell:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    # Garante a exclusão do arquivo temporário do sistema após o término
    if (Test-Path $TempNodeScript) {
        Remove-Item $TempNodeScript -Force
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SCRIPT FINALIZADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Read-Host "Pressione Enter para fechar esta janela"
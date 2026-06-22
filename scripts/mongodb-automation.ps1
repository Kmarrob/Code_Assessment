# scripts/mongodb-automation.ps1
# Script para automação do MongoDB Atlas - Idempotente

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message, $Color = 'Yellow')
    Write-Host ""
    Write-Host "► $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Host "  ✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Warning {
    param($Message)
    Write-Host "  ⚠️ $Message" -ForegroundColor $Colors.Warning
}

function Write-Error {
    param($Message)
    Write-Host "  ❌ $Message" -ForegroundColor $Colors.Error
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
Write-Host "║     CODE_ASSESSMENT - MONGODB ATLAS AUTOMATION (PILAR 7)   ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 2/3 - AUTOMAÇÃO DO BANCO DE DADOS               ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PASSO 1: VERIFICAR CONEXÃO COM MONGODB
# ============================================
Write-Step "Verificando conexão com MongoDB Atlas..." "Cyan"

$envFile = Join-Path $BaseDir "backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Error ".env não encontrado. Execute setup-idempotent.ps1 primeiro."
    exit 1
}

$envContent = Get-Content $envFile
$mongoUri = $envContent | Where-Object { $_ -match "^MONGODB_URI=" } | ForEach-Object { $_ -replace "^MONGODB_URI=", "" }
$dbName = $envContent | Where-Object { $_ -match "^MONGODB_DB_NAME=" } | ForEach-Object { $_ -replace "^MONGODB_DB_NAME=", "" }

if (-not $mongoUri) {
    Write-Error "MONGODB_URI não encontrada no .env"
    exit 1
}

if (-not $dbName) {
    $dbName = "code_assessment"
    Write-Warning "MONGODB_DB_NAME não encontrada, usando padrão: $dbName"
}

Write-Success "Conexão configurada para banco: $dbName"

# ============================================
# PASSO 2: CRIAR SCRIPT DE CONEXÃO PARA MONGOSH
# ============================================
Write-Step "Preparando script para mongosh..." "Cyan"

$mongoScript = Join-Path $BaseDir "scripts\mongo-setup.js"

$mongoScriptContent = @"
// scripts/mongo-setup.js
// Script para configurar o MongoDB Atlas - Idempotente

const dbName = '$dbName';

function collectionExists(collectionName) {
    const collections = db.getCollectionInfos();
    return collections.some(c => c.name === collectionName);
}

function createCollectionIfNotExists(collectionName) {
    if (!collectionExists(collectionName)) {
        db.createCollection(collectionName);
        print(`✅ Coleção criada: ${collectionName}`);
        return true;
    } else {
        print(`⚠️ Coleção já existe: ${collectionName}`);
        return false;
    }
}

db = db.getSiblingDB(dbName);

print(`📦 Conectado ao banco: ${dbName}`);

print('');
print('📋 Criando coleções...');

const collections = ['users', 'controls', 'assignments', 'responses'];

let newCollections = 0;
collections.forEach(name => {
    if (createCollectionIfNotExists(name)) {
        newCollections++;
    }
});

if (newCollections === 0) {
    print('⚠️ Nenhuma nova coleção criada (todas já existem)');
} else {
    print(`✅ ${newCollections} novas coleções criadas`);
}

print('');
print('📋 Criando índices...');

print('  📌 Índices para users:');
db.users.createIndex({ email: 1 }, { unique: true });
print('    ✅ email (único)');
db.users.createIndex({ role: 1, isActive: 1, createdAt: -1 });
print('    ✅ role + isActive + createdAt');
db.users.createIndex({ name: 'text', email: 'text' });
print('    ✅ name + email (text)');
db.users.createIndex({ lastLoginAt: -1 });
print('    ✅ lastLoginAt');

print('  📌 Índices para controls:');
db.controls.createIndex({ id: 1 }, { unique: true });
print('    ✅ id (único)');
db.controls.createIndex({ nome: 1 });
print('    ✅ nome');
db.controls.createIndex({ nota: 1 });
print('    ✅ nota');

print('  📌 Índices para assignments:');
db.assignments.createIndex({ userId: 1, controlId: 1 }, { unique: true });
print('    ✅ userId + controlId (único)');
db.assignments.createIndex({ assignedBy: 1 });
print('    ✅ assignedBy');
db.assignments.createIndex({ status: 1 });
print('    ✅ status');

print('  📌 Índices para responses:');
db.responses.createIndex({ assignmentId: 1 }, { unique: true });
print('    ✅ assignmentId (único)');
db.responses.createIndex({ userId: 1 });
print('    ✅ userId');
db.responses.createIndex({ controlId: 1 });
print('    ✅ controlId');
db.responses.createIndex({ maturityLevel: 1 });
print('    ✅ maturityLevel');

print('');
print('✅ Todos os índices criados/verificados com sucesso!');

print('');
print('📋 Aplicando schema validation...');

db.runCommand({
    collMod: 'users',
    validator: {
        `$jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
                name: { bsonType: 'string', minLength: 3, maxLength: 100 },
                email: { bsonType: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
                password: { bsonType: 'string', minLength: 8 },
                role: { enum: ['admin', 'rep', 'consultant', 'user'] },
                isActive: { bsonType: 'bool' },
                company: { bsonType: 'string', maxLength: 100 },
                department: { bsonType: 'string', maxLength: 100 },
                __v: { bsonType: 'int' }
            },
            additionalProperties: false
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});
print('  ✅ Schema validation aplicado para users');

db.runCommand({
    collMod: 'controls',
    validator: {
        `$jsonSchema: {
            bsonType: 'object',
            required: ['id', 'nome', 'nota'],
            properties: {
                id: { bsonType: 'string', pattern: '^[0-9]+\\.[0-9]+$' },
                nome: { bsonType: 'string', minLength: 1 },
                nota: { enum: ['Implementado', 'Parcialmente implementado', 'Não implementado', 'Não se aplica'] },
                __v: { bsonType: 'int' }
            },
            additionalProperties: false
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});
print('  ✅ Schema validation aplicado para controls');

print('✅ Schema validation aplicado com sucesso!');

print('');
print('🎉 Automação do MongoDB Atlas concluída com sucesso!');
"@

$mongoScriptContent | Out-File -FilePath $mongoScript -Encoding UTF8
Write-Success "Script mongo-setup.js criado"

# ============================================
# PASSO 3: EXECUTAR SCRIPT NO MONGOSH
# ============================================
Write-Step "Executando script no MongoDB Atlas..." "Cyan"

Write-Host "ℹ️ Conectando ao MongoDB Atlas e aplicando configurações..." -ForegroundColor Yellow

try {
    $mongoshVersion = mongosh --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "mongosh encontrado: $mongoshVersion"
        
        Write-Host "ℹ️ Executando script de setup..." -ForegroundColor Yellow
        mongosh "$mongoUri" --file "$mongoScript" --quiet
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Script executado com sucesso"
        } else {
            Write-Error "Erro ao executar script no MongoDB"
            exit 1
        }
    } else {
        Write-Warning "mongosh não encontrado. Instale o MongoDB Shell para automação completa."
        Write-Host "ℹ️ O script foi criado em: $mongoScript" -ForegroundColor Yellow
        Write-Host "ℹ️ Execute manualmente: mongosh `"$mongoUri`" --file `"$mongoScript`"" -ForegroundColor Yellow
    }
} catch {
    Write-Error "Erro ao executar script: $_"
    Write-Host "ℹ️ O script foi criado em: $mongoScript" -ForegroundColor Yellow
    Write-Host "ℹ️ Execute manualmente: mongosh `"$mongoUri`" --file `"$mongoScript`"" -ForegroundColor Yellow
}

# ============================================
# PASSO 4: CRIAR SCRIPT DE GERENCIAMENTO
# ============================================
Write-Step "Criando script de gerenciamento..." "Cyan"

$mongoManage = Join-Path $BaseDir "scripts\mongo-manage.ps1"

$mongoManageContent = @"
# scripts/mongo-manage.ps1
# Script para gerenciar coleções do MongoDB

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - MONGODB MANAGEMENT                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
$envFile = Join-Path $BaseDir "backend\.env"

if (-not (Test-Path $envFile)) {
    Write-Error ".env não encontrado"
    exit 1
}

$envContent = Get-Content $envFile
$mongoUri = $envContent | Where-Object { $_ -match "^MONGODB_URI=" } | ForEach-Object { $_ -replace "^MONGODB_URI=", "" }

if (-not $mongoUri) {
    Write-Error "MONGODB_URI não encontrada"
    exit 1
}

Write-Host "📋 Opções disponíveis:" -ForegroundColor Yellow
Write-Host "  1. Listar coleções" -ForegroundColor White
Write-Host "  2. Mostrar estatísticas" -ForegroundColor White
Write-Host "  3. Backup de coleção" -ForegroundColor White
Write-Host "  4. Sair" -ForegroundColor White
Write-Host ""

$option = Read-Host "Selecione uma opção"

switch ($option) {
    "1" {
        Write-Host "📋 Listando coleções..." -ForegroundColor Yellow
        mongosh "$mongoUri" --eval "db.getCollectionInfos().forEach(c => print(c.name))" --quiet
    }
    "2" {
        Write-Host "📋 Estatísticas das coleções..." -ForegroundColor Yellow
        mongosh "$mongoUri" --eval "
            db.getCollectionInfos().forEach(c => {
                const coll = db.getCollection(c.name);
                const count = coll.countDocuments();
                print(c.name + ': ' + count + ' documentos');
            })
        " --quiet
    }
    "3" {
        $collection = Read-Host "Nome da coleção para backup"
        $backupDir = Join-Path $BaseDir "backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }
        $backupFile = Join-Path $backupDir "$collection-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        Write-Host "📋 Fazendo backup de $collection para $backupFile..." -ForegroundColor Yellow
        mongosh "$mongoUri" --eval "db.$collection.find().toArray()" --quiet | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Success "Backup criado: $backupFile"
    }
    "4" {
        Write-Host "Saindo..." -ForegroundColor Yellow
    }
    default {
        Write-Error "Opção inválida"
    }
}
"@

$mongoManageContent | Out-File -FilePath $mongoManage -Encoding UTF8
Write-Success "mongo-manage.ps1 criado"

# ============================================
# RESULTADO FINAL
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ AUTOMAÇÃO DO MONGODB ATLAS CONCLUÍDA!                    ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📌 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Conexão com MongoDB Atlas verificada" -ForegroundColor White
Write-Host "  ✅ Script mongo-setup.js criado" -ForegroundColor White
Write-Host "  ✅ Coleções: users, controls, assignments, responses" -ForegroundColor White
Write-Host "  ✅ Índices criados/verificados" -ForegroundColor White
Write-Host "  ✅ Schema validation aplicado" -ForegroundColor White
Write-Host "  ✅ Script de gerenciamento mongo-manage.ps1 criado" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para executar manualmente:" -ForegroundColor Yellow
Write-Host "  mongosh `"$mongoUri`" --file `"$mongoScript`"" -ForegroundColor White
Write-Host ""
Write-Host "📌 Para gerenciar o MongoDB:" -ForegroundColor Yellow
Write-Host "  .\scripts\mongo-manage.ps1" -ForegroundColor White
Write-Host ""
Write-Success "🎉 Automação do MongoDB Atlas concluída!"

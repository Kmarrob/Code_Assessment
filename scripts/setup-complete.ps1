# scripts/setup-complete.ps1
# Script completo de setup do projeto Code_Assessment

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
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Colors.Warning
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor $Colors.Error
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

function Write-StepDetail {
    param($Message)
    Write-Host "  → $Message" -ForegroundColor $Colors.Step
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - SETUP COMPLETO DO PROJETO              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# VERIFICAR PRÉ-REQUISITOS
# ============================================
Write-Step "VERIFICANDO PRÉ-REQUISITOS"

# Verificar Node.js
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Error "Node.js não encontrado. Por favor, instale o Node.js."
    Write-Info "Download: https://nodejs.org/"
    exit 1
}
Write-Info "Node.js versão: $nodeVersion"

# Verificar npm
$npmVersion = npm -v 2>$null
if (-not $npmVersion) {
    Write-Error "npm não encontrado."
    exit 1
}
Write-Info "npm versão: $npmVersion"

# Verificar PowerShell
$psVersion = $PSVersionTable.PSVersion
Write-Info "PowerShell versão: $psVersion"

# ============================================
# PARTE 1/5: ESTRUTURA DE DIRETÓRIOS
# ============================================
Write-Step "PARTE 1/5: CRIANDO ESTRUTURA DE DIRETÓRIOS"

if (Test-Path $BaseDir) {
    Write-Warning "Diretório já existe. Mantendo estrutura existente..."
} else {
    New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null
    Write-Info "Diretório base criado: $BaseDir"
}

$dirs = @(
    "backend/src/config",
    "backend/src/models",
    "backend/src/controllers",
    "backend/src/routes",
    "backend/src/middleware",
    "backend/src/services",
    "backend/src/utils",
    "backend/src/types",
    "backend/src/scripts",
    "backend/tests",
    "backend/logs",
    "frontend/src/pages",
    "frontend/src/components/ui",
    "frontend/src/hooks",
    "frontend/src/services",
    "frontend/src/utils",
    "frontend/src/types",
    "frontend/src/styles",
    "frontend/src/contexts",
    "docs/audits",
    "scripts"
)

foreach ($dir in $dirs) {
    $fullPath = Join-Path $BaseDir $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-StepDetail "Criado: $fullPath"
    }
}
Write-Success "Estrutura de diretórios verificada/criada"

# ============================================
# PARTE 2/5: BACKEND
# ============================================
Write-Step "PARTE 2/5: CONFIGURANDO BACKEND"

# 2.1 - package.json
Write-Info "Criando backend/package.json..."
@'
{
  "name": "code-assessment-backend",
  "version": "1.0.0",
  "description": "Backend do sistema Code_Assessment - Avaliação de Maturidade ISO 27001",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "seed": "tsx src/scripts/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.16",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.2",
    "tsx": "^4.6.0",
    "@typescript-eslint/eslint-plugin": "^6.13.1",
    "@typescript-eslint/parser": "^6.13.1",
    "eslint": "^8.54.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.10",
    "ts-jest": "^29.1.1"
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\package.json" -Encoding UTF8
Write-Success "backend/package.json criado"

# 2.2 - .env
Write-Info "Criando backend/.env..."
@'
# Ambiente
NODE_ENV=development
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://Code_Assessment:28108610@cluster0.fznrq7c.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=code_assessment

# JWT
JWT_SECRET=code_assessment_super_secret_jwt_key_2026_change_in_production
JWT_REFRESH_SECRET=code_assessment_super_secret_refresh_key_2026_change_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
'@ | Out-File -FilePath "$BaseDir\backend\.env" -Encoding UTF8
Write-Success "backend/.env criado"

# 2.3 - .env.example
Write-Info "Criando backend/.env.example..."
@'
# Ambiente
NODE_ENV=development
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGODB_DB_NAME=code_assessment

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
'@ | Out-File -FilePath "$BaseDir\backend\.env.example" -Encoding UTF8
Write-Success "backend/.env.example criado"

# 2.4 - tsconfig.json
Write-Info "Criando backend/tsconfig.json..."
@'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@models/*": ["src/models/*"],
      "@controllers/*": ["src/controllers/*"],
      "@routes/*": ["src/routes/*"],
      "@middleware/*": ["src/middleware/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
'@ | Out-File -FilePath "$BaseDir\backend\tsconfig.json" -Encoding UTF8
Write-Success "backend/tsconfig.json criado"

# ============================================
# PARTE 3/5: MODELOS DE DADOS
# ============================================
Write-Step "PARTE 3/5: CRIANDO MODELOS DE DADOS"

# 3.1 - Control.ts
Write-Info "Criando backend/src/models/Control.ts..."
@'
// backend/src/models/Control.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IControl } from '../types/index.js';

const controlSchema = new Schema<IControl>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    tiposDeControles: {
      type: [String],
      default: [],
    },
    nota: {
      type: String,
      required: true,
    },
    controles: {
      type: String,
      default: '',
    },
    cenarioIdentificado: {
      type: String,
      default: '',
    },
    tipoDeControle: {
      type: [String],
      default: [],
    },
    propriedadeDeSI: {
      type: [String],
      default: [],
    },
    conceitoDeSegurancaCibernetica: {
      type: [String],
      default: [],
    },
    capacidadesOperacionais: {
      type: [String],
      default: [],
    },
    dominioDeSI: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

controlSchema.index({ id: 1 }, { unique: true });
controlSchema.index({ nome: 1 });
controlSchema.index({ nota: 1 });

export const Control: Model<IControl> = mongoose.model<IControl>('Control', controlSchema);
'@ | Out-File -FilePath "$BaseDir\backend\src\models\Control.ts" -Encoding UTF8
Write-Success "backend/src/models/Control.ts criado"

# 3.2 - Assignment.ts
Write-Info "Criando backend/src/models/Assignment.ts..."
@'
// backend/src/models/Assignment.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IAssignment, ResponseStatus } from '../types/index.js';

const assignmentSchema = new Schema<IAssignment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    controlId: {
      type: Schema.Types.ObjectId,
      ref: 'Control',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ResponseStatus),
      default: ResponseStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ userId: 1, controlId: 1 }, { unique: true });
assignmentSchema.index({ assignedBy: 1 });
assignmentSchema.index({ status: 1 });

export const Assignment: Model<IAssignment> = mongoose.model<IAssignment>('Assignment', assignmentSchema);
'@ | Out-File -FilePath "$BaseDir\backend\src\models\Assignment.ts" -Encoding UTF8
Write-Success "backend/src/models/Assignment.ts criado"

# 3.3 - Response.ts
Write-Info "Criando backend/src/models/Response.ts..."
@'
// backend/src/models/Response.ts
import mongoose, { Schema, Model } from 'mongoose';
import { IResponse, MaturityLevel } from '../types/index.js';

const responseSchema = new Schema<IResponse>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    controlId: {
      type: Schema.Types.ObjectId,
      ref: 'Control',
      required: true,
    },
    maturityLevel: {
      type: String,
      enum: ['N/A', '0', '1', '2'],
      required: true,
    },
    scenarioDescription: {
      type: String,
      default: '',
    },
    evidence: {
      type: String,
      default: '',
    },
    observations: {
      type: String,
      default: '',
    },
    respondedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

responseSchema.index({ assignmentId: 1 }, { unique: true });
responseSchema.index({ userId: 1 });
responseSchema.index({ controlId: 1 });

export const Response: Model<IResponse> = mongoose.model<IResponse>('Response', responseSchema);
'@ | Out-File -FilePath "$BaseDir\backend\src\models\Response.ts" -Encoding UTF8
Write-Success "backend/src/models/Response.ts criado"

# ============================================
# PARTE 4/5: SCRIPT DE SEED
# ============================================
Write-Step "PARTE 4/5: CRIANDO SCRIPT DE POPULAÇÃO"

Write-Info "Criando backend/src/scripts/seed.ts..."
@'
// backend/src/scripts/seed.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { Control } from '../models/Control.js';

const controlsData = [
  // Controles Organizacionais (5.1 a 5.37)
  { id: '5.1', nome: 'Políticas de segurança da informação', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.2', nome: 'Funções e responsabilidades de segurança da informação', tiposDeControles: ['Organizacionais'], nota: 'Não implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.3', nome: 'Segregação de funções', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Governança', 'Gestão de identidade e acesso'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.4', nome: 'Responsabilidades da direção', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.5', nome: 'Contato com autoridades', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger', 'Responder', 'Restaurar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '5.6', nome: 'Contato com grupos de interesses especial', tiposDeControles: ['Organizacionais'], nota: 'Não implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Responder', 'Restaurar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Defesa'] },
  { id: '5.7', nome: 'Inteligência de ameaças', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Detectar', 'Responder'], capacidadesOperacionais: ['Gestão de ameaças e vulnerabilidades'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '5.8', nome: 'Gestão de projetos de segurança da informação', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.9', nome: 'Inventário de ativos de informação e outros ativos associados', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '5.10', nome: 'Classificação da informação', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  // ... continuar com mais controles
  { id: '5.11', nome: 'Etiquetagem de ativos', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '5.12', nome: 'Gestão da capacidade', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de continuidade do negócio'], dominioDeSI: ['Resiliência'] },
  { id: '5.13', nome: 'Registro, inventário e controle de mídias', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '5.14', nome: 'Transferência de mídias', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '5.15', nome: 'Descarte de mídia', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '5.16', nome: 'Funções e responsabilidades para a gestão de incidentes', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Responder', 'Restaurar'], capacidadesOperacionais: ['Gestão de incidentes', 'Governança'], dominioDeSI: ['Resiliência'] },
  { id: '5.17', nome: 'Procedimentos de resposta a incidentes', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Corretivo', 'Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Responder', 'Restaurar', 'Identificar'], capacidadesOperacionais: ['Gestão de incidentes'], dominioDeSI: ['Resiliência'] },
  { id: '5.18', nome: 'Documentação de evidências', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade'], conceitoDeSegurancaCibernetica: ['Responder', 'Restaurar'], capacidadesOperacionais: ['Gestão de incidentes'], dominioDeSI: ['Resiliência'] },
  { id: '5.19', nome: 'Avaliação de eventos de segurança da informação', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Detectar', 'Responder'], capacidadesOperacionais: ['Gestão de incidentes'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '5.20', nome: 'Resposta a incidentes', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Responder', 'Restaurar'], capacidadesOperacionais: ['Gestão de incidentes'], dominioDeSI: ['Resiliência'] },
  { id: '5.21', nome: 'Aprendizado com incidentes', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Responder', 'Restaurar'], capacidadesOperacionais: ['Gestão de incidentes'], dominioDeSI: ['Resiliência'] },
  { id: '5.22', nome: 'Gestão de continuidade de negócios', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Restaurar'], capacidadesOperacionais: ['Gestão de continuidade do negócio'], dominioDeSI: ['Resiliência'] },
  { id: '5.23', nome: 'Segurança da informação para provedores de serviço', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança', 'Gestão de terceiros'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.24', nome: 'Gestão de fornecedores', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de terceiros'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.25', nome: 'Requisitos de segurança da informação em contratos com fornecedores', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de terceiros'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.26', nome: 'Monitoramento de fornecedores', tiposDeControles: ['Organizacionais'], nota: 'Não implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Detectar', 'Responder'], capacidadesOperacionais: ['Gestão de terceiros'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.27', nome: 'Gestão de mudanças', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.28', nome: 'Avaliação de impacto da segurança da informação', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.29', nome: 'Avaliação de riscos', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Gestão de riscos'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.30', nome: 'Tratamento de riscos', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de riscos'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.31', nome: 'Plano de auditoria interna', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Detectar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.32', nome: 'Conformidade com requisitos legais e regulatórios', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.33', nome: 'Análise crítica da segurança da informação', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.34', nome: 'Análise crítica da direção', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.35', nome: 'Comunicação com partes interessadas', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.36', nome: 'Gestão de documentos', tiposDeControles: ['Organizacionais'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '5.37', nome: 'Registros e evidências', tiposDeControles: ['Organizacionais'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  // Controles de Pessoas (6.1 a 6.8)
  { id: '6.1', nome: 'Triagem e seleção de pessoas', tiposDeControles: ['Pessoas'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.2', nome: 'Termos e condições de trabalho', tiposDeControles: ['Pessoas'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.3', nome: 'Conscientização e treinamento', tiposDeControles: ['Pessoas'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.4', nome: 'Disciplina', tiposDeControles: ['Pessoas'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Responder'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.5', nome: 'Responsabilidades pós-emprego', tiposDeControles: ['Pessoas'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.6', nome: 'Acordos de confidencialidade', tiposDeControles: ['Pessoas'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.7', nome: 'Trabalho remoto', tiposDeControles: ['Pessoas'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  { id: '6.8', nome: 'Retorno ao trabalho presencial', tiposDeControles: ['Pessoas'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de pessoas'], dominioDeSI: ['Defesa'] },
  // Controles Físicos (7.1 a 7.14)
  { id: '7.1', nome: 'Perímetro de segurança física', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.2', nome: 'Controles de acesso físico', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.3', nome: 'Salas e escritórios seguros', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.4', nome: 'Segurança de salas de servidores', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.5', nome: 'Proteção contra ameaças ambientais', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Restaurar'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Resiliência'] },
  { id: '7.6', nome: 'Área de recepção', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.7', nome: 'Área de trabalho segura', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.8', nome: 'Limpeza de mesa', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.9', nome: 'Limpeza de tela', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.10', nome: 'Descarte e reutilização segura de equipamentos', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.11', nome: 'Equipamentos de terceiros', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.12', nome: 'Propriedade de ativos', tiposDeControles: ['Físicos'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '7.13', nome: 'Monitoramento de áreas físicas', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Detectar'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Defesa'] },
  { id: '7.14', nome: 'Proteção contra interrupções de energia', tiposDeControles: ['Físicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Restaurar'], capacidadesOperacionais: ['Segurança física'], dominioDeSI: ['Resiliência'] },
  // Controles Tecnológicos (8.1 a 8.34)
  { id: '8.1', nome: 'Política de segurança de rede', tiposDeControles: ['Tecnológicos'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de redes'], dominioDeSI: ['Defesa'] },
  { id: '8.2', nome: 'Controles de acesso à rede', tiposDeControles: ['Tecnológicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Gestão de redes'], dominioDeSI: ['Defesa'] },
  { id: '8.3', nome: 'Segmentação de rede', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de redes'], dominioDeSI: ['Defesa'] },
  { id: '8.4', nome: 'Controle de acesso a sistemas', tiposDeControles: ['Tecnológicos'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.5', nome: 'Registro e monitoramento de acesso', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Detectar'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.6', nome: 'Gerenciamento de identidades', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.7', nome: 'Gerenciamento de senhas', tiposDeControles: ['Tecnológicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.8', nome: 'Autenticação multifator', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.9', nome: 'Controle de acesso a aplicações', tiposDeControles: ['Tecnológicos'], nota: 'Implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.10', nome: 'Controle de acesso a dados', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de identidade e acesso'], dominioDeSI: ['Defesa'] },
  { id: '8.11', nome: 'Backup e recuperação', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Corretivo'], propriedadeDeSI: ['Disponibilidade', 'Integridade'], conceitoDeSegurancaCibernetica: ['Restaurar'], capacidadesOperacionais: ['Gestão de continuidade do negócio'], dominioDeSI: ['Resiliência'] },
  { id: '8.12', nome: 'Criptografia de dados', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de criptografia'], dominioDeSI: ['Defesa'] },
  { id: '8.13', nome: 'Proteção contra malware', tiposDeControles: ['Tecnológicos'], nota: 'Implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Gestão de ameaças e vulnerabilidades'], dominioDeSI: ['Defesa'] },
  { id: '8.14', nome: 'Proteção contra ransomware', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar', 'Restaurar'], capacidadesOperacionais: ['Gestão de ameaças e vulnerabilidades'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '8.15', nome: 'Gestão de vulnerabilidades', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger', 'Detectar'], capacidadesOperacionais: ['Gestão de ameaças e vulnerabilidades'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '8.16', nome: 'Monitoramento de segurança', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Detectar', 'Responder'], capacidadesOperacionais: ['Monitoramento e análise'], dominioDeSI: ['Defesa'] },
  { id: '8.17', nome: 'Análise de logs', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Detectar'], capacidadesOperacionais: ['Monitoramento e análise'], dominioDeSI: ['Defesa'] },
  { id: '8.18', nome: 'Proteção contra ataques de negação de serviço', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo', 'Corretivo'], propriedadeDeSI: ['Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar', 'Responder'], capacidadesOperacionais: ['Gestão de redes'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '8.19', nome: 'Gestão de patches', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Responder'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '8.20', nome: 'Testes de intrusão', tiposDeControles: ['Tecnológicos'], nota: 'Não implementado', tipoDeControle: ['Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Detectar'], capacidadesOperacionais: ['Gestão de ameaças e vulnerabilidades'], dominioDeSI: ['Defesa'] },
  { id: '8.21', nome: 'Gerenciamento de dispositivos móveis', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Gestão de dispositivos'], dominioDeSI: ['Defesa'] },
  { id: '8.22', nome: 'Política de segurança para dispositivos', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Gestão de dispositivos'], dominioDeSI: ['Defesa'] },
  { id: '8.23', nome: 'Gestão de ativos de TI', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Gestão de ativos'], dominioDeSI: ['Defesa'] },
  { id: '8.24', nome: 'Gerenciamento de mudanças em TI', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '8.25', nome: 'Gerenciamento de projetos de TI', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '8.26', nome: 'Conformidade com padrões técnicos', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Identificar', 'Proteger'], capacidadesOperacionais: ['Governança'], dominioDeSI: ['Governança e ecossistema'] },
  { id: '8.27', nome: 'Segurança de aplicações web', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Desenvolvimento seguro'], dominioDeSI: ['Defesa'] },
  { id: '8.28', nome: 'Segurança de APIs', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Desenvolvimento seguro'], dominioDeSI: ['Defesa'] },
  { id: '8.29', nome: 'Segurança em nuvem', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar', 'Restaurar'], capacidadesOperacionais: ['Gestão de redes'], dominioDeSI: ['Defesa', 'Resiliência'] },
  { id: '8.30', nome: 'Segurança de containers', tiposDeControles: ['Tecnológicos'], nota: 'Não implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Desenvolvimento seguro'], dominioDeSI: ['Defesa'] },
  { id: '8.31', nome: 'Análise de código fonte', tiposDeControles: ['Tecnológicos'], nota: 'Não implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Desenvolvimento seguro'], dominioDeSI: ['Defesa'] },
  { id: '8.32', nome: 'Testes de segurança em desenvolvimento', tiposDeControles: ['Tecnológicos'], nota: 'Não implementado', tipoDeControle: ['Preventivo', 'Detectivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Proteger', 'Detectar'], capacidadesOperacionais: ['Desenvolvimento seguro'], dominioDeSI: ['Defesa'] },
  { id: '8.33', nome: 'Resposta a incidentes em TI', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Corretivo'], propriedadeDeSI: ['Confidencialidade', 'Integridade', 'Disponibilidade'], conceitoDeSegurancaCibernetica: ['Responder', 'Restaurar'], capacidadesOperacionais: ['Gestão de incidentes'], dominioDeSI: ['Resiliência'] },
  { id: '8.34', nome: 'Recuperação de desastres em TI', tiposDeControles: ['Tecnológicos'], nota: 'Parcialmente implementado', tipoDeControle: ['Corretivo'], propriedadeDeSI: ['Disponibilidade'], conceitoDeSegurancaCibernetica: ['Restaurar'], capacidadesOperacionais: ['Gestão de continuidade do negócio'], dominioDeSI: ['Resiliência'] }
];

async function seedControls() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });

    logger.info('📦 Conectado ao MongoDB');

    await Control.deleteMany({});
    logger.info('🗑️ Controles existentes removidos');

    const result = await Control.insertMany(controlsData);
    logger.info(`✅ ${result.length} controles inseridos com sucesso`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro ao popular controles:', error);
    process.exit(1);
  }
}

seedControls();
'@ | Out-File -FilePath "$BaseDir\backend\src\scripts\seed.ts" -Encoding UTF8
Write-Success "backend/src/scripts/seed.ts criado"

# ============================================
# PARTE 5/5: SCRIPTS DE INÍCIO
# ============================================
Write-Step "PARTE 5/5: CRIANDO SCRIPTS DE INÍCIO"

# 5.1 - start-backend.ps1
@"
# start-backend.ps1
Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
Set-Location "$BaseDir\backend"
npm run dev
"@ | Out-File -FilePath "$BaseDir\start-backend.ps1" -Encoding UTF8
Write-Success "start-backend.ps1 criado"

# 5.2 - start-frontend.ps1
@"
# start-frontend.ps1
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Green
Set-Location "$BaseDir\frontend"
npm run dev
"@ | Out-File -FilePath "$BaseDir\start-frontend.ps1" -Encoding UTF8
Write-Success "start-frontend.ps1 criado"

# 5.3 - start-all.ps1
@"
# start-all.ps1
Write-Host "🚀 Iniciando Code_Assessment..." -ForegroundColor Green
Write-Host ""
Write-Host "ℹ️ Abrindo terminais separados..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BaseDir\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BaseDir\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Backend e Frontend iniciados!" -ForegroundColor Green
Write-Host "   Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
"@ | Out-File -FilePath "$BaseDir\start-all.ps1" -Encoding UTF8
Write-Success "start-all.ps1 criado"

# 5.4 - seed.ps1
@"
# seed.ps1
Write-Host "🌱 Populando controles..." -ForegroundColor Green
Set-Location "$BaseDir\backend"
npm run seed
"@ | Out-File -FilePath "$BaseDir\seed.ps1" -Encoding UTF8
Write-Success "seed.ps1 criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ SETUP COMPLETO COM SUCESSO!"

Write-Host "✅ Projeto Code_Assessment criado em:" -ForegroundColor Yellow
Write-Host "   $BaseDir" -ForegroundColor White
Write-Host ""

Write-Host "📌 Para iniciar o projeto:" -ForegroundColor Cyan
Write-Host "   1. Abra dois terminais PowerShell" -ForegroundColor White
Write-Host "   2. Terminal 1: .\start-backend.ps1" -ForegroundColor White
Write-Host "   3. Terminal 2: .\start-frontend.ps1" -ForegroundColor White
Write-Host ""
Write-Host "   Ou use o script único: .\start-all.ps1" -ForegroundColor White
Write-Host ""

Write-Host "📌 Para popular os controles no banco:" -ForegroundColor Cyan
Write-Host "   .\seed.ps1" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Acesse:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
Write-Host "   Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host ""

Write-Host "👤 Usuário Admin padrão:" -ForegroundColor Cyan
Write-Host "   Email: admin@codeassessment.com" -ForegroundColor White
Write-Host "   Senha: Admin@123456" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Boa sorte com o desenvolvimento!" -ForegroundColor Green
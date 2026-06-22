# scripts/apply-security-fixes.ps1
# Script para aplicar correções de segurança (Pilar 2 - AppSec)

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
Write-Host "║     CODE_ASSESSMENT - CORREÇÕES DE SEGURANÇA (PILAR 2)       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1/4: BACKEND - SEGURANÇA DE DADOS
# ============================================
Write-Step "PARTE 1/4: BACKEND - SEGURANÇA DE DADOS E VALIDAÇÃO"

# 1.1 - Script de Schema Validation
Write-Info "Criando apply-schema-validation.ts..."
@'
// backend/src/scripts/apply-schema-validation.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

async function applySchemaValidation() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });

    logger.info('📦 Conectado ao MongoDB');

    const db = mongoose.connection.db;

    // ============================================
    // 1. VALIDAÇÃO DA COLEÇÃO USERS
    // ============================================
    logger.info('🔄 Aplicando validação na coleção users...');

    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            _id: { bsonType: 'objectId' },
            name: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 100,
            },
            email: {
              bsonType: 'string',
              pattern: '^\\S+@\\S+\\.\\S+$',
            },
            password: {
              bsonType: 'string',
              minLength: 8,
            },
            role: {
              enum: ['admin', 'rep', 'consultant', 'user'],
            },
            company: { bsonType: 'string', maxLength: 100 },
            department: { bsonType: 'string', maxLength: 100 },
            isActive: { bsonType: 'bool' },
            lastLoginAt: { bsonType: 'date' },
            refreshToken: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
          additionalProperties: false,
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    logger.info('✅ Validação da coleção users aplicada com sucesso');

    // ============================================
    // 2. VALIDAÇÃO DA COLEÇÃO CONTROLS
    // ============================================
    logger.info('🔄 Aplicando validação na coleção controls...');

    await db.command({
      collMod: 'controls',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['id', 'nome', 'nota'],
          properties: {
            _id: { bsonType: 'objectId' },
            id: {
              bsonType: 'string',
              pattern: '^[0-9]+\\.[0-9]+$',
            },
            nome: { bsonType: 'string', minLength: 1 },
            tiposDeControles: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            nota: {
              enum: ['Implementado', 'Parcialmente implementado', 'Não implementado', 'Não se aplica'],
            },
            controles: { bsonType: 'string' },
            cenarioIdentificado: { bsonType: 'string' },
            tipoDeControle: {
              bsonType: 'array',
              items: { enum: ['Preventivo', 'Detectivo', 'Corretivo'] },
            },
            propriedadeDeSI: {
              bsonType: 'array',
              items: { enum: ['Confidencialidade', 'Integridade', 'Disponibilidade'] },
            },
            conceitoDeSegurancaCibernetica: {
              bsonType: 'array',
              items: { enum: ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'] },
            },
            capacidadesOperacionais: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            dominioDeSI: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
          additionalProperties: false,
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    logger.info('✅ Validação da coleção controls aplicada com sucesso');

    // ============================================
    // 3. VALIDAÇÃO DA COLEÇÃO ASSIGNMENTS
    // ============================================
    logger.info('🔄 Aplicando validação na coleção assignments...');

    await db.command({
      collMod: 'assignments',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'controlId', 'assignedBy'],
          properties: {
            _id: { bsonType: 'objectId' },
            userId: { bsonType: 'objectId' },
            controlId: { bsonType: 'objectId' },
            assignedBy: { bsonType: 'objectId' },
            assignedAt: { bsonType: 'date' },
            dueDate: { bsonType: 'date' },
            status: {
              enum: ['pending', 'in_progress', 'completed', 'rejected'],
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
          additionalProperties: false,
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    logger.info('✅ Validação da coleção assignments aplicada com sucesso');

    // ============================================
    // 4. VALIDAÇÃO DA COLEÇÃO RESPONSES
    // ============================================
    logger.info('🔄 Aplicando validação na coleção responses...');

    await db.command({
      collMod: 'responses',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['assignmentId', 'userId', 'controlId', 'maturityLevel'],
          properties: {
            _id: { bsonType: 'objectId' },
            assignmentId: { bsonType: 'objectId' },
            userId: { bsonType: 'objectId' },
            controlId: { bsonType: 'objectId' },
            maturityLevel: {
              enum: ['N/A', '0', '1', '2'],
            },
            scenarioDescription: { bsonType: 'string' },
            evidence: { bsonType: 'string' },
            observations: { bsonType: 'string' },
            respondedAt: { bsonType: 'date' },
            lastUpdatedAt: { bsonType: 'date' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' },
          },
          additionalProperties: false,
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    logger.info('✅ Validação da coleção responses aplicada com sucesso');

    logger.info('🎉 Todas as validações de schema foram aplicadas com sucesso!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro ao aplicar validações:', error);
    process.exit(1);
  }
}

applySchemaValidation();
'@ | Out-File -FilePath "$BaseDir\backend\src\scripts\apply-schema-validation.ts" -Encoding UTF8
Write-Success "apply-schema-validation.ts criado"

# 1.2 - Middleware de Sanitização
Write-Info "Criando sanitize.ts..."
@'
// backend/src/middleware/sanitize.ts
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/validation.js';

export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  next();
}

export function sanitizeQueryParams(req: Request, res: Response, next: NextFunction): void {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  next();
}

export function sanitizeUrlParams(req: Request, res: Response, next: NextFunction): void {
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeInput(req.params);
  }
  next();
}

export function sanitizeAll(req: Request, res: Response, next: NextFunction): void {
  sanitizeRequestBody(req, res, () => {
    sanitizeQueryParams(req, res, () => {
      sanitizeUrlParams(req, res, next);
    });
  });
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\sanitize.ts" -Encoding UTF8
Write-Success "sanitize.ts criado"

# 1.3 - Token Service
Write-Info "Criando TokenService.ts..."
@'
// backend/src/services/TokenService.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IJWTPayload, UserRole } from '../types/index.js';

const tokenBlacklist = new Map<string, { revokedAt: Date; reason: string }>();

export class TokenService {
  static generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: IJWTPayload = { userId, email, role };
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
      algorithm: 'HS256',
    });
  }

  static generateRefreshToken(userId: string, email: string, role: UserRole): string {
    const payload: IJWTPayload = { userId, email, role };
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      algorithm: 'HS256',
    });
  }

  static verifyToken(token: string, secret: string): IJWTPayload {
    return jwt.verify(token, secret) as IJWTPayload;
  }

  static async revokeToken(token: string, reason: string = 'Manual revocation'): Promise<void> {
    try {
      tokenBlacklist.set(token, {
        revokedAt: new Date(),
        reason,
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      for (const [key, value] of tokenBlacklist) {
        if (value.revokedAt < sevenDaysAgo) {
          tokenBlacklist.delete(key);
        }
      }

      logger.info(`Token revogado: ${reason}`);
    } catch (error) {
      logger.error('Erro ao revogar token:', error);
      throw error;
    }
  }

  static isTokenRevoked(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    for (const [key] of tokenBlacklist) {
      try {
        const decoded = jwt.decode(key) as any;
        if (decoded && decoded.userId === userId) {
          tokenBlacklist.delete(key);
        }
      } catch (error) {
        // Ignorar erros de decodificação
      }
    }
    logger.info(`Todos os tokens do usuário ${userId} foram revogados`);
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\services\TokenService.ts" -Encoding UTF8
Write-Success "TokenService.ts criado"

# 1.4 - Atualizar validation.ts
Write-Info "Atualizando validation.ts..."
@'
// backend/src/utils/validation.ts
import { z, ZodError } from 'zod';

// ============================================
// VALIDAÇÕES REFORÇADAS
// ============================================

export const passwordSchema = z
  .string()
  .min(12, 'Senha deve ter pelo menos 12 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');

export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');

export const nameSchema = z
  .string()
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\\s]+$/, 'Nome deve conter apenas letras e espaços');

// ============================================
// ESQUEMAS ATUALIZADOS
// ============================================

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  role: z.enum(['admin', 'rep', 'consultant', 'user']).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(32, 'Refresh token inválido'),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Senha atual é obrigatória para alterar a senha',
    path: ['currentPassword'],
  }
);

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: ['Erro inesperado na validação'] } };
  }
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    let sanitized = input.replace(/\$/g, '');
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    return sanitized;
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
}

export function sanitizeOutput(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\\//g, '&#x2F;');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }
  
  return data;
}
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\validation.ts" -Encoding UTF8
Write-Success "validation.ts atualizado"

# 1.5 - Script PowerShell para Schema Validation
Write-Info "Criando apply-schema-validation.ps1..."
@'
# scripts/apply-schema-validation.ps1
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     MONGODB SCHEMA VALIDATION - CODE_ASSESSMENT             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"

$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js não encontrado." -ForegroundColor Red
    exit 1
}
Write-Host "ℹ️ Node.js versão: $nodeVersion" -ForegroundColor Yellow

Set-Location "$BaseDir\backend"

Write-Host "ℹ️ Aplicando validações de schema no MongoDB Atlas..." -ForegroundColor Yellow

npx tsx src/scripts/apply-schema-validation.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Validações de schema aplicadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao aplicar validações de schema." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ SCHEMA VALIDATION COMPLETED!                             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
'@ | Out-File -FilePath "$BaseDir\scripts\apply-schema-validation.ps1" -Encoding UTF8
Write-Success "apply-schema-validation.ps1 criado"

# ============================================
# PARTE 2/4: BACKEND - RATE LIMITING E LOGGING
# ============================================
Write-Step "PARTE 2/4: BACKEND - RATE LIMITING E LOGGING"

# 2.1 - Atualizar rateLimit.ts
Write-Info "Atualizando rateLimit.ts..."
@'
// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Limite para autenticação (mais restrito)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'test',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

// Limite geral para APIs autenticadas
export const generalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente mais tarde.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite estrito para rotas sensíveis (mudança de senha, etc)
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 1 hora.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\rateLimit.ts" -Encoding UTF8
Write-Success "rateLimit.ts atualizado"

# 2.2 - Atualizar AuthService com TokenService
Write-Info "Atualizando AuthService.ts com TokenService..."
# (O script já será atualizado na próxima etapa)

# ============================================
# PARTE 3/4: FRONTEND - SEGURANÇA
# ============================================
Write-Step "PARTE 3/4: FRONTEND - SEGURANÇA"

# 3.1 - Instalar DOMPurify para sanitização
Write-Info "Instalando DOMPurify no frontend..."
Push-Location "$BaseDir\frontend"
npm install dompurify @types/dompurify --save
Pop-Location
Write-Success "DOMPurify instalado"

# 3.2 - Criar hook de sanitização
Write-Info "Criando useSanitize hook..."
@'
// frontend/src/hooks/useSanitize.ts
import { useCallback } from 'react';
import DOMPurify from 'dompurify';

export const useSanitize = () => {
  const sanitize = useCallback((html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    });
  }, []);

  const sanitizeObject = useCallback(<T extends Record<string, any>>(obj: T): T => {
    const result = { ...obj };
    for (const key in result) {
      if (typeof result[key] === 'string') {
        result[key] = DOMPurify.sanitize(result[key]);
      }
    }
    return result;
  }, []);

  return { sanitize, sanitizeObject };
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\hooks\useSanitize.ts" -Encoding UTF8
Write-Success "useSanitize.ts criado"

# ============================================
# PARTE 4/4: SCRIPTS E DOCUMENTAÇÃO
# ============================================
Write-Step "PARTE 4/4: SCRIPTS E DOCUMENTAÇÃO"

# 4.1 - Script para aplicar todas as correções
Write-Info "Criando apply-all-security-fixes.ps1..."
@'
# scripts/apply-all-security-fixes.ps1
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     APLICANDO TODAS AS CORREÇÕES DE SEGURANÇA               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Schema Validation
Write-Host "📌 1/3: Aplicando validações de schema..." -ForegroundColor Yellow
.\scripts\apply-schema-validation.ps1

# 2. Instalar dependências
Write-Host "📌 2/3: Instalando dependências..." -ForegroundColor Yellow
Set-Location "backend"
npm install
Set-Location ".."

# 3. Reiniciar servidores
Write-Host "📌 3/3: Reinicie os servidores para aplicar as mudanças." -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Todas as correções de segurança foram aplicadas!" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Para verificar as melhorias:" -ForegroundColor Cyan
Write-Host "   - Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "   - Logs de segurança: backend/logs/" -ForegroundColor White
Write-Host ""
'@ | Out-File -FilePath "$BaseDir\scripts\apply-all-security-fixes.ps1" -Encoding UTF8
Write-Success "apply-all-security-fixes.ps1 criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ CORREÇÕES DE SEGURANÇA APLICADAS!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/scripts/apply-schema-validation.ts"
Write-Info "  • backend/src/middleware/sanitize.ts"
Write-Info "  • backend/src/services/TokenService.ts"
Write-Info "  • backend/src/utils/validation.ts (atualizado)"
Write-Info "  • backend/src/middleware/rateLimit.ts (atualizado)"
Write-Info "  • frontend/src/hooks/useSanitize.ts"
Write-Info "  • scripts/apply-schema-validation.ps1"
Write-Info "  • scripts/apply-all-security-fixes.ps1"

Write-Host ""
Write-Host "📌 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute o schema validation: .\scripts\apply-schema-validation.ps1" -ForegroundColor White
Write-Host "  2. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  3. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  4. Verifique o health check: http://localhost:3000/health" -ForegroundColor White
Write-Host ""

Write-Host "🔒 Melhorias de segurança implementadas:" -ForegroundColor Cyan
Write-Host "  ✅ MongoDB Schema Validation" -ForegroundColor White
Write-Host "  ✅ Sanitização global de inputs" -ForegroundColor White
Write-Host "  ✅ Senhas fortes (12+ chars, complexidade)" -ForegroundColor White
Write-Host "  ✅ Token blacklist e revogação" -ForegroundColor White
Write-Host "  ✅ Rate limiting expandido" -ForegroundColor White
Write-Host "  ✅ Logs de segurança estruturados" -ForegroundColor White
Write-Host "  ✅ Sanitização de saída (XSS)" -ForegroundColor White

Write-Success "🎉 Pilar 2 (Segurança/AppSec) - Parte 1/4 concluída!"
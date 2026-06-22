# scripts/apply-resilience-part1.ps1
# Script para implementar Resiliência - Parte 1/4 (Backend - Tratamento de Erros e Retry)

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

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - RESILIÊNCIA (PILAR 3)                 ║" -ForegroundColor Cyan
Write-Host "║     PARTE 1/4 - BACKEND - TRATAMENTO DE ERROS E RETRY      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: ERROR HANDLER APRIMORADO
# ============================================
Write-Step "PARTE 1/4: ERROR HANDLER APRIMORADO"

Write-Info "Atualizando errorHandler.ts..."
@'
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';
import mongoose from 'mongoose';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string[]>;
  public code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super('Erro de validação', 400, true, errors, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Usuário não autenticado') {
    super(message, 401, true, undefined, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, true, undefined, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} com ID ${id} não encontrado`
      : `${resource} não encontrado`;
    super(message, 404, true, undefined, 'NOT_FOUND_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados') {
    super(message, 500, true, undefined, 'DATABASE_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Serviço indisponível') {
    super(message, 503, true, undefined, 'SERVICE_UNAVAILABLE');
  }
}

function mapMongoDBError(error: any): AppError {
  if (error instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(error.errors)) {
      errors[key] = [(value as any).message];
    }
    return new ValidationError(errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new AppError(`ID inválido: ${error.value}`, 400, true, undefined, 'INVALID_ID');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'campo';
    return new AppError(`Valor duplicado para ${field}`, 409, true, undefined, 'DUPLICATE_KEY');
  }

  if (error.name === 'MongoNetworkError') {
    return new ServiceUnavailableError('Falha na conexão com o banco de dados');
  }

  return new DatabaseError(error.message);
}

function mapJWTError(error: any): AppError {
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expirado');
  }
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Token inválido');
  }
  return new AuthenticationError('Erro na autenticação');
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = err as AppError;
  
  if (err instanceof mongoose.Error) {
    error = mapMongoDBError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = mapJWTError(err);
  } else if (!(err instanceof AppError)) {
    error = new AppError(
      err.message || 'Erro interno do servidor',
      500,
      false,
      undefined,
      'UNKNOWN_ERROR'
    );
  }

  const logData = {
    eventType: 'ERROR',
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    stack: config.NODE_ENV !== 'production' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).userId,
    userAgent: req.headers['user-agent'],
    body: config.NODE_ENV !== 'production' ? req.body : undefined,
    query: config.NODE_ENV !== 'production' ? req.query : undefined,
    params: config.NODE_ENV !== 'production' ? req.params : undefined,
  };

  if (error.statusCode === 401 || error.statusCode === 403) {
    SecurityLogger.log({
      eventType: error.statusCode === 401 ? 'LOGIN_FAILED' : 'ACCESS_DENIED',
      timestamp: new Date(),
      userId: (req as any).userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      success: false,
      message: error.message,
      details: { statusCode: error.statusCode, code: error.code },
    });
  }

  if (error.isOperational) {
    logger.warn(`[OPERATIONAL ERROR] ${error.message}`, logData);
  } else {
    logger.error(`[CRITICAL ERROR] ${error.message}`, logData);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(config.NODE_ENV !== 'production' && {
      stack: error.stack,
    }),
  };

  res.status(error.statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(
    `Rota ${req.method} ${req.path} não encontrada`,
    404,
    true,
    undefined,
    'ROUTE_NOT_FOUND'
  );
  next(error);
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\errorHandler.ts" -Encoding UTF8
Write-Success "errorHandler.ts atualizado"

# ============================================
# PARTE 2: RETRY COM BACKOFF
# ============================================
Write-Step "PARTE 2/4: RETRY COM BACKOFF"

Write-Info "Criando retry.ts..."
@'
// backend/src/utils/retry.ts
import { logger } from './logger.js';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'MongoNetworkError',
    'MongoTimeoutError',
    'MongoServerSelectionError',
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'EPIPE',
    'EAI_AGAIN',
  ],
};

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = Math.min(
    options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1),
    options.maxDelay
  );
  const jitter = 0.8 + Math.random() * 0.4;
  return delay * jitter;
}

function isRetryable(error: any, options: Required<RetryOptions>): boolean {
  const errorName = error?.name || error?.code || '';
  const errorMessage = error?.message || '';
  
  return options.retryableErrors.some((pattern) => {
    if (pattern.startsWith('E')) {
      return error?.code === pattern || errorMessage.includes(pattern);
    }
    return errorName.includes(pattern) || errorMessage.includes(pattern);
  });
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context: string = 'operation'
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;
  let attempt = 0;

  while (attempt < opts.maxAttempts) {
    try {
      attempt++;
      const result = await fn();
      
      if (attempt > 1) {
        logger.info(`✅ ${context} succeeded after ${attempt} attempts`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (!isRetryable(error, opts)) {
        logger.warn(`❌ ${context} failed with non-retryable error:`, error);
        throw error;
      }

      if (attempt === opts.maxAttempts) {
        logger.error(`❌ ${context} failed after ${attempt} attempts:`, error);
        throw error;
      }

      const delay = calculateDelay(attempt, opts);
      
      logger.warn(`⚠️ ${context} failed (attempt ${attempt}/${opts.maxAttempts}), retrying in ${(delay / 1000).toFixed(1)}s...`);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function retryDatabase<T>(
  fn: () => Promise<T>,
  context: string = 'database'
): Promise<T> {
  return retry(fn, {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      'MongoNetworkError',
      'MongoTimeoutError',
      'MongoServerSelectionError',
      'ETIMEDOUT',
      'ECONNRESET',
    ],
  }, context);
}

export function retryHttp<T>(
  fn: () => Promise<T>,
  context: string = 'http'
): Promise<T> {
  return retry(fn, {
    maxAttempts: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
    retryableErrors: [
      'ETIMEDOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      'EPIPE',
      'EAI_AGAIN',
      '502',
      '503',
      '504',
    ],
  }, context);
}
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\retry.ts" -Encoding UTF8
Write-Success "retry.ts criado"

# ============================================
# PARTE 3: CIRCUIT BREAKER
# ============================================
Write-Step "PARTE 3/4: CIRCUIT BREAKER"

Write-Info "Criando circuitBreaker.ts..."
@'
// backend/src/utils/circuitBreaker.ts
import { logger } from './logger.js';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  timeoutMultiplier: number;
}

const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 5000,
  timeoutMultiplier: 2,
};

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private currentTimeout: number;
  private config: CircuitBreakerConfig;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.currentTimeout = this.config.timeout;
    this.name = name;
  }

  public readonly name: string;

  isAllowed(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.currentTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logger.info(`🔓 Circuit ${this.name} entered HALF-OPEN state`);
        return true;
      }
      return false;
    }

    return true;
  }

  onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.currentTimeout = this.config.timeout;
        logger.info(`🔒 Circuit ${this.name} closed (success threshold reached)`);
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  onFailure(error: Error): void {
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.currentTimeout = Math.min(
        this.currentTimeout * this.config.timeoutMultiplier,
        60000
      );
      logger.warn(`🔴 Circuit ${this.name} opened (failed in half-open state), timeout: ${this.currentTimeout}ms`);
      return;
    }

    if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.currentTimeout = this.config.timeout;
        logger.error(`🔴 Circuit ${this.name} opened (${this.failureCount} failures), timeout: ${this.currentTimeout}ms`);
      }
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.isAllowed()) {
      throw new Error(`Circuit ${this.name} is OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    currentTimeout: number;
    lastFailureTime: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      currentTimeout: this.currentTimeout,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

export const databaseCircuitBreaker = new CircuitBreaker('database', {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 5000,
  timeoutMultiplier: 2,
});

export const externalApiCircuitBreaker = new CircuitBreaker('external-api', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 10000,
  timeoutMultiplier: 2,
});
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\circuitBreaker.ts" -Encoding UTF8
Write-Success "circuitBreaker.ts criado"

# ============================================
# PARTE 4: TIMEOUTS E DATABASE
# ============================================
Write-Step "PARTE 4/4: TIMEOUTS E DATABASE ATUALIZADO"

Write-Info "Criando timeout.ts..."
@'
// backend/src/middleware/timeout.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { AppError } from './errorHandler.js';

export interface TimeoutConfig {
  defaultTimeout: number;
  routeOverrides?: Record<string, number>;
}

const defaultConfig: TimeoutConfig = {
  defaultTimeout: 30000,
  routeOverrides: {
    '/api/auth/login': 10000,
    '/api/auth/register': 15000,
    '/api/auth/refresh-token': 5000,
    '/api/auth/profile': 10000,
  },
};

export function timeoutMiddleware(
  config: TimeoutConfig = defaultConfig
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let timeoutMs = config.defaultTimeout;
    
    for (const [route, timeout] of Object.entries(config.routeOverrides || {})) {
      if (req.path.startsWith(route)) {
        timeoutMs = timeout;
        break;
      }
    }

    const timeout = setTimeout(() => {
      const error = new AppError(
        `Request timeout after ${timeoutMs}ms`,
        408,
        true,
        undefined,
        'REQUEST_TIMEOUT'
      );
      
      logger.warn(`Timeout em ${req.method} ${req.path} (${timeoutMs}ms)`);
      
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: error.message,
          statusCode: 408,
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }
      
      next(error);
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
}

export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  context: string = 'operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new AppError(
        `Operation ${context} timed out after ${timeoutMs}ms`,
        408,
        true,
        undefined,
        'OPERATION_TIMEOUT'
      ));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

export function withDbTimeout<T>(
  fn: () => Promise<T>,
  context: string = 'database'
): Promise<T> {
  return withTimeout(fn, 15000, context);
}

export function withHttpTimeout<T>(
  fn: () => Promise<T>,
  context: string = 'http'
): Promise<T> {
  return withTimeout(fn, 10000, context);
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\timeout.ts" -Encoding UTF8
Write-Success "timeout.ts criado"

Write-Info "Atualizando database.ts..."
@'
// backend/src/config/database.ts
import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';

export class Database {
  private static instance: Database;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('📦 Database already connected');
      return;
    }

    try {
      const options: mongoose.ConnectOptions = {
        dbName: config.MONGODB_DB_NAME,
        autoIndex: config.NODE_ENV !== 'production',
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true,
      };

      await databaseCircuitBreaker.execute(async () => {
        await retryDatabase(async () => {
          await withDbTimeout(async () => {
            await mongoose.connect(config.MONGODB_URI, options);
          }, 'MongoDB connection');
        }, 'MongoDB connection');
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      logger.info('📦 MongoDB connected successfully');
      
      this.setupEventHandlers();
      
    } catch (error) {
      logger.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
      this.isConnected = false;
      this.attemptReconnect();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    mongoose.connection.on('connected', () => {
      logger.info('📦 MongoDB connection established');
    });

    mongoose.connection.on('close', () => {
      logger.warn('📦 MongoDB connection closed');
      this.isConnected = false;
    });
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`❌ Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    logger.info(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error(`❌ Reconnect attempt ${this.reconnectAttempts} failed:`, error);
        this.attemptReconnect();
      }
    }, delay);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('📦 MongoDB disconnected successfully');
    } catch (error) {
      logger.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionState(): boolean {
    return this.isConnected;
  }

  public getStats(): {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    readyState: number;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      readyState: mongoose.connection.readyState,
    };
  }
}

export const db = Database.getInstance();
'@ | Out-File -FilePath "$BaseDir\backend\src\config\database.ts" -Encoding UTF8
Write-Success "database.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/middleware/errorHandler.ts (atualizado)"
Write-Info "  • backend/src/utils/retry.ts"
Write-Info "  • backend/src/utils/circuitBreaker.ts"
Write-Info "  • backend/src/middleware/timeout.ts"
Write-Info "  • backend/src/config/database.ts (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste health check: curl http://localhost:3000/health" -ForegroundColor White
Write-Info "  3. Teste timeout: faça uma requisição lenta" -ForegroundColor White
Write-Info "  4. Teste retry: desconecte o MongoDB e reconecte" -ForegroundColor White

Write-Success "🎉 Parte 1/4 concluída com sucesso!"
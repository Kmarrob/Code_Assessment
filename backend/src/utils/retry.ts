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

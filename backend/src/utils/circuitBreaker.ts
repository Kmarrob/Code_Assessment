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

  onFailure(_error: Error): void {
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
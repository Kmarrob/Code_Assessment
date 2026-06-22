"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalApiCircuitBreaker = exports.databaseCircuitBreaker = exports.CircuitBreaker = exports.CircuitState = void 0;
// backend/src/utils/circuitBreaker.ts
const logger_js_1 = require("./logger.js");
const defaultConfig = {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 5000,
    timeoutMultiplier: 2,
};
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    state = CircuitState.CLOSED;
    failureCount = 0;
    successCount = 0;
    lastFailureTime = 0;
    currentTimeout;
    config;
    constructor(name, config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.currentTimeout = this.config.timeout;
        this.name = name;
    }
    name;
    isAllowed() {
        if (this.state === CircuitState.CLOSED) {
            return true;
        }
        if (this.state === CircuitState.OPEN) {
            const now = Date.now();
            if (now - this.lastFailureTime >= this.currentTimeout) {
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
                logger_js_1.logger.info(`🔓 Circuit ${this.name} entered HALF-OPEN state`);
                return true;
            }
            return false;
        }
        return true;
    }
    onSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.failureCount = 0;
                this.successCount = 0;
                this.currentTimeout = this.config.timeout;
                logger_js_1.logger.info(`🔒 Circuit ${this.name} closed (success threshold reached)`);
            }
        }
        else if (this.state === CircuitState.CLOSED) {
            this.failureCount = Math.max(0, this.failureCount - 1);
        }
    }
    onFailure(_error) {
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
            this.currentTimeout = Math.min(this.currentTimeout * this.config.timeoutMultiplier, 60000);
            logger_js_1.logger.warn(`🔴 Circuit ${this.name} opened (failed in half-open state), timeout: ${this.currentTimeout}ms`);
            return;
        }
        if (this.state === CircuitState.CLOSED) {
            this.failureCount++;
            if (this.failureCount >= this.config.failureThreshold) {
                this.state = CircuitState.OPEN;
                this.currentTimeout = this.config.timeout;
                logger_js_1.logger.error(`🔴 Circuit ${this.name} opened (${this.failureCount} failures), timeout: ${this.currentTimeout}ms`);
            }
        }
    }
    async execute(fn) {
        if (!this.isAllowed()) {
            throw new Error(`Circuit ${this.name} is OPEN`);
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            currentTimeout: this.currentTimeout,
            lastFailureTime: this.lastFailureTime,
        };
    }
}
exports.CircuitBreaker = CircuitBreaker;
exports.databaseCircuitBreaker = new CircuitBreaker('database', {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 5000,
    timeoutMultiplier: 2,
});
exports.externalApiCircuitBreaker = new CircuitBreaker('external-api', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 10000,
    timeoutMultiplier: 2,
});
//# sourceMappingURL=circuitBreaker.js.map
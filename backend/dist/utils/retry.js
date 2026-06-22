"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = retry;
exports.retryDatabase = retryDatabase;
exports.retryHttp = retryHttp;
// backend/src/utils/retry.ts
const logger_js_1 = require("./logger.js");
const defaultOptions = {
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
function calculateDelay(attempt, options) {
    const delay = Math.min(options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1), options.maxDelay);
    const jitter = 0.8 + Math.random() * 0.4;
    return delay * jitter;
}
function isRetryable(error, options) {
    const errorName = error?.name || error?.code || '';
    const errorMessage = error?.message || '';
    return options.retryableErrors.some((pattern) => {
        if (pattern.startsWith('E')) {
            return error?.code === pattern || errorMessage.includes(pattern);
        }
        return errorName.includes(pattern) || errorMessage.includes(pattern);
    });
}
async function retry(fn, options = {}, context = 'operation') {
    const opts = { ...defaultOptions, ...options };
    let lastError;
    let attempt = 0;
    while (attempt < opts.maxAttempts) {
        try {
            attempt++;
            const result = await fn();
            if (attempt > 1) {
                logger_js_1.logger.info(`✅ ${context} succeeded after ${attempt} attempts`);
            }
            return result;
        }
        catch (error) {
            lastError = error;
            if (!isRetryable(error, opts)) {
                logger_js_1.logger.warn(`❌ ${context} failed with non-retryable error:`, error);
                throw error;
            }
            if (attempt === opts.maxAttempts) {
                logger_js_1.logger.error(`❌ ${context} failed after ${attempt} attempts:`, error);
                throw error;
            }
            const delay = calculateDelay(attempt, opts);
            logger_js_1.logger.warn(`⚠️ ${context} failed (attempt ${attempt}/${opts.maxAttempts}), retrying in ${(delay / 1000).toFixed(1)}s...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
function retryDatabase(fn, context = 'database') {
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
function retryHttp(fn, context = 'http') {
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
//# sourceMappingURL=retry.js.map
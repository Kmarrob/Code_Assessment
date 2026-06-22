export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryableErrors?: string[];
}
export declare function retry<T>(fn: () => Promise<T>, options?: RetryOptions, context?: string): Promise<T>;
export declare function retryDatabase<T>(fn: () => Promise<T>, context?: string): Promise<T>;
export declare function retryHttp<T>(fn: () => Promise<T>, context?: string): Promise<T>;
//# sourceMappingURL=retry.d.ts.map
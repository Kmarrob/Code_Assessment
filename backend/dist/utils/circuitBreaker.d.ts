export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    timeoutMultiplier: number;
}
export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private currentTimeout;
    private config;
    constructor(name: string, config?: Partial<CircuitBreakerConfig>);
    readonly name: string;
    isAllowed(): boolean;
    onSuccess(): void;
    onFailure(_error: Error): void;
    execute<T>(fn: () => Promise<T>): Promise<T>;
    getState(): CircuitState;
    getStats(): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        currentTimeout: number;
        lastFailureTime: number;
    };
}
export declare const databaseCircuitBreaker: CircuitBreaker;
export declare const externalApiCircuitBreaker: CircuitBreaker;
//# sourceMappingURL=circuitBreaker.d.ts.map
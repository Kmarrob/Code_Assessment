import { Server } from 'http';
export interface ShutdownConfig {
    timeout: number;
    forceTimeout: number;
    retryDelay: number;
    maxRetries: number;
}
export declare class GracefulShutdown {
    private server;
    private config;
    private isShuttingDown;
    constructor(config?: Partial<ShutdownConfig>);
    register(server: Server): void;
    shutdown(signal: string): Promise<void>;
    private stopAcceptingConnections;
    private waitForConnections;
    private closeDatabase;
    isShuttingDownNow(): boolean;
}
export declare const gracefulShutdown: GracefulShutdown;
//# sourceMappingURL=shutdown.d.ts.map
export declare class Database {
    private static instance;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    private setupEventHandlers;
    private attemptReconnect;
    disconnect(): Promise<void>;
    getConnectionState(): boolean;
    getStats(): {
        isConnected: boolean;
        reconnectAttempts: number;
        maxReconnectAttempts: number;
        readyState: number;
    };
}
export declare const db: Database;
//# sourceMappingURL=database.d.ts.map
import { Request, Response } from 'express';
interface MemoryAlert {
    timestamp: Date;
    type: 'warning' | 'critical';
    heapUsed: number;
    heapTotal: number;
    rss: number;
    threshold: number;
    message: string;
}
export declare class MemoryMonitor {
    private intervalId;
    private isMonitoring;
    start(intervalMs?: number): void;
    stop(): void;
    private checkMemory;
    getStats(): {
        current: {
            heapUsed: number;
            heapTotal: number;
            rss: number;
            external: number;
            arrayBuffers: number;
        };
        alerts: MemoryAlert[];
        alertCount: {
            warning: number;
            critical: number;
        };
    };
    getHandler(): (_req: Request, res: Response) => void;
}
export declare const memoryMonitor: MemoryMonitor;
export {};
//# sourceMappingURL=memoryMonitor.d.ts.map
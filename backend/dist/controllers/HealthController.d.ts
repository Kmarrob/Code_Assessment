import { Request, Response } from 'express';
export declare class HealthController {
    private static startTime;
    static basic(_req: Request, res: Response): Promise<void>;
    static detailed(_req: Request, res: Response): Promise<void>;
    static readiness(_req: Request, res: Response): Promise<void>;
    static liveness(_req: Request, res: Response): Promise<void>;
    private static formatUptime;
}
//# sourceMappingURL=HealthController.d.ts.map
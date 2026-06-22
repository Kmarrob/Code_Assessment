import { Request, Response } from 'express';
export declare class HealthController {
    private static startTime;
    static basic(req: Request, res: Response): Promise<void>;
    static detailed(req: Request, res: Response): Promise<void>;
    static readiness(req: Request, res: Response): Promise<void>;
    static liveness(req: Request, res: Response): Promise<void>;
    private static formatUptime;
}
//# sourceMappingURL=HealthController.d.ts.map
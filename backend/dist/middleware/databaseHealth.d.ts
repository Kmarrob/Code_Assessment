import { Request, Response, NextFunction } from 'express';
export declare function checkDatabaseHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function withDatabaseRetry(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=databaseHealth.d.ts.map
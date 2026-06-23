import { Request, Response, NextFunction } from 'express';
export declare const CacheControl: {
    STATIC: string;
    SHORT: string;
    MEDIUM: string;
    NO_CACHE: string;
    PRIVATE: string;
};
export declare function cacheControl(directive: string): (_req: Request, res: Response, next: NextFunction) => void;
export declare const staticCache: (_req: Request, res: Response, next: NextFunction) => void;
export declare const shortCache: (_req: Request, res: Response, next: NextFunction) => void;
export declare const noCache: (_req: Request, res: Response, next: NextFunction) => void;
export declare const privateCache: (_req: Request, res: Response, next: NextFunction) => void;
export declare const publicCache: (_req: Request, res: Response, next: NextFunction) => void;
export declare function conditionalCache(etag: string): (req: Request, res: Response, next: NextFunction) => void;
export declare function lastModifiedCache(lastModified: Date): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=cache.d.ts.map
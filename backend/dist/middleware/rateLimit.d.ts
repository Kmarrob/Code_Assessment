export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const registerRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const refreshRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authenticatedRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const publicRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const healthRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const sensitiveRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const adminRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare function createRateLimiter(options: {
    windowMs?: number;
    max?: number;
    message?: string;
    skip?: (req: any) => boolean;
}): import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.d.ts.map
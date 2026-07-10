import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        companyId: string;
        role: string;
        name: string;
        email: string;
    };
}
export declare class ReviewController {
    static createReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getReviewsByUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getReviewById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updateReviewStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static addAttachments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getReviewStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=ReviewController.d.ts.map
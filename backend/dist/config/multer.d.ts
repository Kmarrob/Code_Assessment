import multer from 'multer';
import { Request } from 'express';
export declare const uploadLogo: multer.Multer;
export declare const uploadFavicon: multer.Multer;
export declare const handleMulterError: (err: any, req: Request, res: any, next: any) => any;
declare const _default: {
    uploadLogo: multer.Multer;
    uploadFavicon: multer.Multer;
    handleMulterError: (err: any, req: Request, res: any, next: any) => any;
};
export default _default;
//# sourceMappingURL=multer.d.ts.map
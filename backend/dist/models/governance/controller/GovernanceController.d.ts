import { Request, Response } from 'express';
export declare class GovernanceController {
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    findAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    findById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    approve(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getByLevel(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTree(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Download de documento em formato DOC
     */
    downloadDoc(req: Request, res: Response): Promise<Response | void>;
    /**
     * Download de documento em formato PDF
     */
    downloadPdf(req: Request, res: Response): Promise<Response | void>;
    /**
     * Visualizar documento com placeholders substituídos pelo nome da empresa
     * Suporta busca por _id (ObjectId) ou por code (string)
     */
    viewDocument(req: Request, res: Response): Promise<Response | void>;
}
//# sourceMappingURL=GovernanceController.d.ts.map
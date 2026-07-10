import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class DocumentController {
    /**
     * Upload de um novo documento
     * POST /api/documents
     */
    static uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar documentos da empresa
     * GET /api/documents
     */
    static getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar documento por ID
     * GET /api/documents/:id
     */
    static getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Download do arquivo
     * GET /api/documents/:id/download
     */
    static downloadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar documento
     * PATCH /api/documents/:id
     */
    static updateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Excluir documento
     * DELETE /api/documents/:id
     */
    static deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Arquivar documento
     * PATCH /api/documents/:id/archive
     */
    static archiveDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Restaurar documento arquivado
     * PATCH /api/documents/:id/restore
     */
    static restoreDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Estatísticas de documentos
     * GET /api/documents/stats
     */
    static getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Middleware para upload de arquivo único
     */
    static uploadSingleFile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
}
//# sourceMappingURL=DocumentController.d.ts.map
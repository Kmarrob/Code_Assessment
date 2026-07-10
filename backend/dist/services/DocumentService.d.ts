import { ICompanyDocument, DocumentCategory, DocumentStatus } from '../models/CompanyDocument.js';
interface CreateDocumentDTO {
    companyId: string;
    title: string;
    description?: string;
    category: DocumentCategory;
    subcategory?: string;
    fileName: string;
    fileBuffer: Buffer;
    mimeType: string;
    fileSize: number;
    uploadedBy: string;
    expiresAt?: Date;
    tags?: string[];
    controlIds?: string[];
    metadata?: Record<string, any>;
}
interface UpdateDocumentDTO {
    title?: string;
    description?: string;
    category?: DocumentCategory;
    subcategory?: string;
    status?: DocumentStatus;
    expiresAt?: Date;
    tags?: string[];
    controlIds?: string[];
    metadata?: Record<string, any>;
}
interface DocumentFilters {
    page?: number;
    limit?: number;
    category?: DocumentCategory;
    status?: DocumentStatus;
    search?: string;
    controlId?: string;
}
export declare class DocumentService {
    private static readonly UPLOAD_DIR;
    /**
     * Garante que o diretório de upload existe
     */
    private static ensureUploadDir;
    /**
     * Gera um nome único para o arquivo
     */
    private static generateFileName;
    /**
     * Salva o arquivo no sistema de arquivos
     */
    private static saveFile;
    /**
     * Cria um novo documento
     */
    static createDocument(data: CreateDocumentDTO): Promise<ICompanyDocument>;
    /**
     * Busca documentos da empresa com filtros
     */
    static getDocuments(companyId: string, filters?: DocumentFilters): Promise<{
        documents: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Busca documento por ID
     */
    static getDocumentById(documentId: string, companyId: string): Promise<any | null>;
    /**
     * Atualiza um documento
     */
    static updateDocument(documentId: string, companyId: string, data: UpdateDocumentDTO): Promise<ICompanyDocument | null>;
    /**
     * Exclui um documento (permanentemente)
     */
    static deleteDocument(documentId: string, companyId: string): Promise<void>;
    /**
     * Arquivar documento (muda status para archived)
     */
    static archiveDocument(documentId: string, companyId: string): Promise<ICompanyDocument | null>;
    /**
     * Restaurar documento arquivado
     */
    static restoreDocument(documentId: string, companyId: string): Promise<ICompanyDocument | null>;
    /**
     * Obtém estatísticas de documentos da empresa
     */
    static getDocumentStats(companyId: string): Promise<{
        total: number;
        byCategory: {
            category: string;
            count: number;
        }[];
        byStatus: {
            status: string;
            count: number;
        }[];
    }>;
    /**
     * Busca documentos por controle
     */
    static getDocumentsByControl(controlId: string, companyId: string): Promise<any[]>;
    /**
     * Obtém o arquivo do documento
     */
    static getDocumentFile(documentId: string, companyId: string): Promise<{
        buffer: Buffer;
        mimeType: string;
        fileName: string;
    } | null>;
}
export {};
//# sourceMappingURL=DocumentService.d.ts.map
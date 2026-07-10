"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const DocumentService_js_1 = require("../services/DocumentService.js");
const errors_js_1 = require("../utils/errors.js");
const User_js_1 = require("../models/User.js"); // 🔴 ADICIONADO
const multer_1 = __importDefault(require("multer"));
// Configuração do multer para upload de arquivos
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'text/csv',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Use: PDF, Word, Excel, Imagem, TXT ou CSV'));
        }
    },
});
class DocumentController {
    /**
     * Upload de um novo documento
     * POST /api/documents
     */
    static async uploadDocument(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const { title, description, category, subcategory, expiresAt, tags, controlIds, metadata } = req.body;
            const file = req.file; // 🔴 CORRIGIDO: Cast para any para acessar file
            if (!file) {
                throw new errors_js_1.AppError('Arquivo é obrigatório', 400);
            }
            // Validações
            if (!title) {
                throw new errors_js_1.AppError('Título é obrigatório', 400);
            }
            if (!category) {
                throw new errors_js_1.AppError('Categoria é obrigatória', 400);
            }
            // Obter companyId do usuário
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            // Parse de campos JSON
            let parsedTags = [];
            let parsedControlIds = [];
            let parsedMetadata = {};
            try {
                if (tags)
                    parsedTags = JSON.parse(tags);
                if (controlIds)
                    parsedControlIds = JSON.parse(controlIds);
                if (metadata)
                    parsedMetadata = JSON.parse(metadata);
            }
            catch (error) {
                throw new errors_js_1.AppError('Campos JSON inválidos', 400);
            }
            const document = await DocumentService_js_1.DocumentService.createDocument({
                companyId: companyId.toString(),
                title,
                description: description || '',
                category,
                subcategory: subcategory || '',
                fileName: file.originalname,
                fileBuffer: file.buffer,
                mimeType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userId,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                tags: parsedTags,
                controlIds: parsedControlIds,
                metadata: parsedMetadata,
            });
            res.status(201).json({
                success: true,
                data: document,
                message: 'Documento enviado com sucesso',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Buscar documentos da empresa
     * GET /api/documents
     */
    static async getDocuments(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const category = req.query.category;
            const status = req.query.status;
            const search = req.query.search;
            const controlId = req.query.controlId;
            const result = await DocumentService_js_1.DocumentService.getDocuments(companyId.toString(), {
                page,
                limit,
                category,
                status,
                search,
                controlId,
            });
            res.status(200).json({
                success: true,
                data: result.documents,
                pagination: {
                    page: result.page,
                    limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Buscar documento por ID
     * GET /api/documents/:id
     */
    static async getDocumentById(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const { id } = req.params;
            if (!id) {
                throw new errors_js_1.AppError('ID do documento é obrigatório', 400);
            }
            const document = await DocumentService_js_1.DocumentService.getDocumentById(id, companyId.toString());
            if (!document) {
                throw new errors_js_1.AppError('Documento não encontrado', 404);
            }
            res.status(200).json({
                success: true,
                data: document,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Download do arquivo
     * GET /api/documents/:id/download
     */
    static async downloadDocument(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const { id } = req.params;
            if (!id) {
                throw new errors_js_1.AppError('ID do documento é obrigatório', 400);
            }
            const file = await DocumentService_js_1.DocumentService.getDocumentFile(id, companyId.toString());
            if (!file) {
                throw new errors_js_1.AppError('Arquivo não encontrado', 404);
            }
            res.setHeader('Content-Type', file.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
            res.send(file.buffer);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Atualizar documento
     * PATCH /api/documents/:id
     */
    static async updateDocument(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const { id } = req.params;
            if (!id) {
                throw new errors_js_1.AppError('ID do documento é obrigatório', 400);
            }
            const { title, description, category, subcategory, status, expiresAt, tags, controlIds, metadata } = req.body;
            // Parse de campos JSON
            let parsedTags;
            let parsedControlIds;
            let parsedMetadata;
            try {
                if (tags !== undefined)
                    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                if (controlIds !== undefined)
                    parsedControlIds = typeof controlIds === 'string' ? JSON.parse(controlIds) : controlIds;
                if (metadata !== undefined)
                    parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
            }
            catch (error) {
                throw new errors_js_1.AppError('Campos JSON inválidos', 400);
            }
            const document = await DocumentService_js_1.DocumentService.updateDocument(id, companyId.toString(), {
                title,
                description,
                category,
                subcategory,
                status,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                tags: parsedTags,
                controlIds: parsedControlIds,
                metadata: parsedMetadata,
            });
            res.status(200).json({
                success: true,
                data: document,
                message: 'Documento atualizado com sucesso',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Excluir documento
     * DELETE /api/documents/:id
     */
    static async deleteDocument(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const { id } = req.params;
            if (!id) {
                throw new errors_js_1.AppError('ID do documento é obrigatório', 400);
            }
            await DocumentService_js_1.DocumentService.deleteDocument(id, companyId.toString());
            res.status(200).json({
                success: true,
                message: 'Documento excluído com sucesso',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Arquivar documento
     * PATCH /api/documents/:id/archive
     */
    static async archiveDocument(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const { id } = req.params;
            if (!id) {
                throw new errors_js_1.AppError('ID do documento é obrigatório', 400);
            }
            const document = await DocumentService_js_1.DocumentService.archiveDocument(id, companyId.toString());
            res.status(200).json({
                success: true,
                data: document,
                message: 'Documento arquivado com sucesso',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Restaurar documento arquivado
     * PATCH /api/documents/:id/restore
     */
    static async restoreDocument(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const { id } = req.params;
            if (!id) {
                throw new errors_js_1.AppError('ID do documento é obrigatório', 400);
            }
            const document = await DocumentService_js_1.DocumentService.restoreDocument(id, companyId.toString());
            res.status(200).json({
                success: true,
                data: document,
                message: 'Documento restaurado com sucesso',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Estatísticas de documentos
     * GET /api/documents/stats
     */
    static async getStats(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errors_js_1.AppError('Usuário não autenticado', 401);
            }
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            const companyId = user.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Usuário não possui empresa associada', 400);
            }
            const stats = await DocumentService_js_1.DocumentService.getDocumentStats(companyId.toString());
            res.status(200).json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Middleware para upload de arquivo único
     */
    static uploadSingleFile = upload.single('file');
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=DocumentController.js.map
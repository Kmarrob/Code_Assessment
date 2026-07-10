"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
// backend/src/services/DocumentService.ts
const mongoose_1 = __importDefault(require("mongoose"));
const CompanyDocument_js_1 = require("../models/CompanyDocument.js");
const User_js_1 = require("../models/User.js");
const Control_js_1 = require("../models/Control.js");
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// 🔴 REMOVIDO: Importação do uuid substituída por função nativa
// 🔴 NOVO: Função para gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
class DocumentService {
    static UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads', 'documents');
    /**
     * Garante que o diretório de upload existe
     */
    static async ensureUploadDir() {
        try {
            await promises_1.default.mkdir(this.UPLOAD_DIR, { recursive: true });
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao criar diretório de upload:', error);
        }
    }
    /**
     * Gera um nome único para o arquivo
     */
    static generateFileName(originalName) {
        const ext = path_1.default.extname(originalName);
        const name = path_1.default.basename(originalName, ext);
        const id = generateId();
        const timestamp = Date.now();
        return `${name}_${timestamp}_${id}${ext}`;
    }
    /**
     * Salva o arquivo no sistema de arquivos
     */
    static async saveFile(fileBuffer, fileName) {
        await this.ensureUploadDir();
        const fullPath = path_1.default.join(this.UPLOAD_DIR, fileName);
        await promises_1.default.writeFile(fullPath, fileBuffer);
        return fullPath;
    }
    /**
     * Cria um novo documento
     */
    static async createDocument(data) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Validar usuário
            const user = await User_js_1.User.findById(data.uploadedBy).session(session);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            // Validar empresa
            if (!data.companyId) {
                throw new errors_js_1.AppError('Empresa é obrigatória', 400);
            }
            // Validar controles se fornecidos
            if (data.controlIds && data.controlIds.length > 0) {
                const controls = await Control_js_1.Control.find({
                    _id: { $in: data.controlIds },
                }).session(session);
                if (controls.length !== data.controlIds.length) {
                    throw new errors_js_1.AppError('Um ou mais controles não foram encontrados', 404);
                }
            }
            // Gerar nome único e salvar arquivo
            const uniqueFileName = this.generateFileName(data.fileName);
            const filePath = await this.saveFile(data.fileBuffer, uniqueFileName);
            // URL pública do arquivo (ajustar conforme ambiente)
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const fileUrl = `${baseUrl}/api/documents/file/${uniqueFileName}`;
            const document = new CompanyDocument_js_1.CompanyDocument({
                companyId: new mongoose_1.default.Types.ObjectId(data.companyId),
                title: data.title,
                description: data.description || '',
                category: data.category,
                subcategory: data.subcategory || '',
                fileName: data.fileName,
                fileUrl,
                fileSize: data.fileSize,
                mimeType: data.mimeType,
                version: 1,
                status: 'active',
                uploadedBy: new mongoose_1.default.Types.ObjectId(data.uploadedBy),
                uploadedAt: new Date(),
                expiresAt: data.expiresAt || null,
                tags: data.tags || [],
                controlIds: data.controlIds ? data.controlIds.map(id => new mongoose_1.default.Types.ObjectId(id)) : [],
                metadata: data.metadata || {},
            });
            await document.save({ session });
            await session.commitTransaction();
            logger_js_1.logger.info(`📄 Documento criado: ${document.title} por ${user.email}`);
            return document;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Busca documentos da empresa com filtros
     */
    static async getDocuments(companyId, filters = {}) {
        const { page = 1, limit = 20, category, status, search, controlId } = filters;
        const skip = (page - 1) * limit;
        const query = { companyId: new mongoose_1.default.Types.ObjectId(companyId) };
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        if (controlId)
            query.controlIds = new mongoose_1.default.Types.ObjectId(controlId);
        if (search) {
            query.$text = { $search: search };
        }
        const [documents, total] = await Promise.all([
            CompanyDocument_js_1.CompanyDocument.find(query)
                .populate('uploadedBy', 'name email')
                .populate('controlIds', 'id nome')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CompanyDocument_js_1.CompanyDocument.countDocuments(query),
        ]);
        return {
            documents,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Busca documento por ID
     */
    static async getDocumentById(documentId, companyId) {
        const document = await CompanyDocument_js_1.CompanyDocument.findOne({
            _id: documentId,
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
        })
            .populate('uploadedBy', 'name email')
            .populate('controlIds', 'id nome')
            .lean();
        return document;
    }
    /**
     * Atualiza um documento
     */
    static async updateDocument(documentId, companyId, data) {
        const document = await CompanyDocument_js_1.CompanyDocument.findOne({
            _id: documentId,
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
        });
        if (!document) {
            throw new errors_js_1.AppError('Documento não encontrado', 404);
        }
        // Validar controles se fornecidos
        if (data.controlIds && data.controlIds.length > 0) {
            const controls = await Control_js_1.Control.find({
                _id: { $in: data.controlIds },
            });
            if (controls.length !== data.controlIds.length) {
                throw new errors_js_1.AppError('Um ou mais controles não foram encontrados', 404);
            }
        }
        // Atualizar campos
        if (data.title !== undefined)
            document.title = data.title;
        if (data.description !== undefined)
            document.description = data.description;
        if (data.category !== undefined)
            document.category = data.category;
        if (data.subcategory !== undefined)
            document.subcategory = data.subcategory;
        if (data.status !== undefined)
            document.status = data.status;
        if (data.expiresAt !== undefined)
            document.expiresAt = data.expiresAt;
        if (data.tags !== undefined)
            document.tags = data.tags;
        if (data.controlIds !== undefined) {
            document.controlIds = data.controlIds.map(id => new mongoose_1.default.Types.ObjectId(id));
        }
        if (data.metadata !== undefined)
            document.metadata = data.metadata;
        await document.save();
        logger_js_1.logger.info(`📄 Documento atualizado: ${document.title}`);
        return document;
    }
    /**
     * Exclui um documento (permanentemente)
     */
    static async deleteDocument(documentId, companyId) {
        const document = await CompanyDocument_js_1.CompanyDocument.findOne({
            _id: documentId,
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
        });
        if (!document) {
            throw new errors_js_1.AppError('Documento não encontrado', 404);
        }
        // Remover arquivo do sistema
        try {
            const fileName = path_1.default.basename(document.fileUrl);
            const filePath = path_1.default.join(this.UPLOAD_DIR, fileName);
            await promises_1.default.unlink(filePath);
        }
        catch (error) {
            logger_js_1.logger.warn(`⚠️ Arquivo não encontrado para exclusão: ${document.fileUrl}`);
        }
        await CompanyDocument_js_1.CompanyDocument.deleteOne({ _id: documentId });
        logger_js_1.logger.info(`🗑️ Documento excluído: ${document.title}`);
    }
    /**
     * Arquivar documento (muda status para archived)
     */
    static async archiveDocument(documentId, companyId) {
        return this.updateDocument(documentId, companyId, { status: 'archived' });
    }
    /**
     * Restaurar documento arquivado
     */
    static async restoreDocument(documentId, companyId) {
        return this.updateDocument(documentId, companyId, { status: 'active' });
    }
    /**
     * Obtém estatísticas de documentos da empresa
     */
    static async getDocumentStats(companyId) {
        const [total, byCategory, byStatus] = await Promise.all([
            CompanyDocument_js_1.CompanyDocument.countDocuments({ companyId: new mongoose_1.default.Types.ObjectId(companyId) }),
            CompanyDocument_js_1.CompanyDocument.aggregate([
                { $match: { companyId: new mongoose_1.default.Types.ObjectId(companyId) } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
            CompanyDocument_js_1.CompanyDocument.aggregate([
                { $match: { companyId: new mongoose_1.default.Types.ObjectId(companyId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);
        return {
            total,
            byCategory: byCategory.map((item) => ({ category: item._id, count: item.count })),
            byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
        };
    }
    /**
     * Busca documentos por controle
     */
    static async getDocumentsByControl(controlId, companyId) {
        return CompanyDocument_js_1.CompanyDocument.find({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            controlIds: new mongoose_1.default.Types.ObjectId(controlId),
        })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    }
    /**
     * Obtém o arquivo do documento
     */
    static async getDocumentFile(documentId, companyId) {
        const document = await CompanyDocument_js_1.CompanyDocument.findOne({
            _id: documentId,
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
        });
        if (!document) {
            throw new errors_js_1.AppError('Documento não encontrado', 404);
        }
        const fileName = path_1.default.basename(document.fileUrl);
        const filePath = path_1.default.join(this.UPLOAD_DIR, fileName);
        try {
            const buffer = await promises_1.default.readFile(filePath);
            return {
                buffer,
                mimeType: document.mimeType,
                fileName: document.fileName,
            };
        }
        catch (error) {
            throw new errors_js_1.AppError('Arquivo não encontrado no servidor', 404);
        }
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=DocumentService.js.map
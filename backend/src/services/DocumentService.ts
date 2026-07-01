// backend/src/services/DocumentService.ts
import mongoose from 'mongoose';
import { CompanyDocument, ICompanyDocument, DocumentCategory, DocumentStatus } from '../models/CompanyDocument.js';
import { User } from '../models/User.js';
import { Control } from '../models/Control.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

export class DocumentService {
  
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

  /**
   * Garante que o diretório de upload existe
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      logger.error('❌ Erro ao criar diretório de upload:', error);
    }
  }

  /**
   * Gera um nome único para o arquivo
   */
  private static generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const uuid = uuidv4().substring(0, 8);
    const timestamp = Date.now();
    return `${name}_${timestamp}_${uuid}${ext}`;
  }

  /**
   * Salva o arquivo no sistema de arquivos
   */
  private static async saveFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    await this.ensureUploadDir();
    const fullPath = path.join(this.UPLOAD_DIR, fileName);
    await fs.writeFile(fullPath, fileBuffer);
    return fullPath;
  }

  /**
   * Cria um novo documento
   */
  static async createDocument(data: CreateDocumentDTO): Promise<ICompanyDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validar usuário
      const user = await User.findById(data.uploadedBy).session(session);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Validar empresa
      if (!data.companyId) {
        throw new AppError('Empresa é obrigatória', 400);
      }

      // Validar controles se fornecidos
      if (data.controlIds && data.controlIds.length > 0) {
        const controls = await Control.find({
          _id: { $in: data.controlIds },
        }).session(session);
        if (controls.length !== data.controlIds.length) {
          throw new AppError('Um ou mais controles não foram encontrados', 404);
        }
      }

      // Gerar nome único e salvar arquivo
      const uniqueFileName = this.generateFileName(data.fileName);
      const filePath = await this.saveFile(data.fileBuffer, uniqueFileName);

      // URL pública do arquivo (ajustar conforme ambiente)
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const fileUrl = `${baseUrl}/api/documents/file/${uniqueFileName}`;

      const document = new CompanyDocument({
        companyId: new mongoose.Types.ObjectId(data.companyId),
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
        uploadedBy: new mongoose.Types.ObjectId(data.uploadedBy),
        uploadedAt: new Date(),
        expiresAt: data.expiresAt || null,
        tags: data.tags || [],
        controlIds: data.controlIds ? data.controlIds.map(id => new mongoose.Types.ObjectId(id)) : [],
        metadata: data.metadata || {},
      });

      await document.save({ session });
      await session.commitTransaction();

      logger.info(`📄 Documento criado: ${document.title} por ${user.email}`);
      return document;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Busca documentos da empresa com filtros
   */
  static async getDocuments(
    companyId: string,
    filters: DocumentFilters = {}
  ): Promise<{ documents: any[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, category, status, search, controlId } = filters;
    const skip = (page - 1) * limit;

    const query: any = { companyId: new mongoose.Types.ObjectId(companyId) };
    if (category) query.category = category;
    if (status) query.status = status;
    if (controlId) query.controlIds = new mongoose.Types.ObjectId(controlId);
    if (search) {
      query.$text = { $search: search };
    }

    const [documents, total] = await Promise.all([
      CompanyDocument.find(query)
        .populate('uploadedBy', 'name email')
        .populate('controlIds', 'id nome')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CompanyDocument.countDocuments(query),
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
  static async getDocumentById(documentId: string, companyId: string): Promise<any | null> {
    const document = await CompanyDocument.findOne({
      _id: documentId,
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .populate('uploadedBy', 'name email')
      .populate('controlIds', 'id nome')
      .lean();

    return document;
  }

  /**
   * Atualiza um documento
   */
  static async updateDocument(
    documentId: string,
    companyId: string,
    data: UpdateDocumentDTO
  ): Promise<ICompanyDocument | null> {
    const document = await CompanyDocument.findOne({
      _id: documentId,
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    // Validar controles se fornecidos
    if (data.controlIds && data.controlIds.length > 0) {
      const controls = await Control.find({
        _id: { $in: data.controlIds },
      });
      if (controls.length !== data.controlIds.length) {
        throw new AppError('Um ou mais controles não foram encontrados', 404);
      }
    }

    // Atualizar campos
    if (data.title !== undefined) document.title = data.title;
    if (data.description !== undefined) document.description = data.description;
    if (data.category !== undefined) document.category = data.category;
    if (data.subcategory !== undefined) document.subcategory = data.subcategory;
    if (data.status !== undefined) document.status = data.status;
    if (data.expiresAt !== undefined) document.expiresAt = data.expiresAt;
    if (data.tags !== undefined) document.tags = data.tags;
    if (data.controlIds !== undefined) {
      document.controlIds = data.controlIds.map(id => new mongoose.Types.ObjectId(id));
    }
    if (data.metadata !== undefined) document.metadata = data.metadata;

    // Se status mudar para archived, atualizar versão? (opcional)
    if (data.status === 'archived') {
      // Mantém a versão, mas pode ser incrementada se desejar
    }

    await document.save();

    logger.info(`📄 Documento atualizado: ${document.title}`);
    return document;
  }

  /**
   * Exclui um documento (permanentemente)
   */
  static async deleteDocument(documentId: string, companyId: string): Promise<void> {
    const document = await CompanyDocument.findOne({
      _id: documentId,
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    // Remover arquivo do sistema
    try {
      const fileName = path.basename(document.fileUrl);
      const filePath = path.join(this.UPLOAD_DIR, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn(`⚠️ Arquivo não encontrado para exclusão: ${document.fileUrl}`);
    }

    await CompanyDocument.deleteOne({ _id: documentId });
    logger.info(`🗑️ Documento excluído: ${document.title}`);
  }

  /**
   * Arquivar documento (muda status para archived)
   */
  static async archiveDocument(documentId: string, companyId: string): Promise<ICompanyDocument | null> {
    return this.updateDocument(documentId, companyId, { status: 'archived' });
  }

  /**
   * Restaurar documento arquivado
   */
  static async restoreDocument(documentId: string, companyId: string): Promise<ICompanyDocument | null> {
    return this.updateDocument(documentId, companyId, { status: 'active' });
  }

  /**
   * Obtém estatísticas de documentos da empresa
   */
  static async getDocumentStats(companyId: string): Promise<{
    total: number;
    byCategory: { category: string; count: number }[];
    byStatus: { status: string; count: number }[];
  }> {
    const [total, byCategory, byStatus] = await Promise.all([
      CompanyDocument.countDocuments({ companyId: new mongoose.Types.ObjectId(companyId) }),
      CompanyDocument.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      CompanyDocument.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byCategory: byCategory.map((item: any) => ({ category: item._id, count: item.count })),
      byStatus: byStatus.map((item: any) => ({ status: item._id, count: item.count })),
    };
  }

  /**
   * Busca documentos por controle
   */
  static async getDocumentsByControl(controlId: string, companyId: string): Promise<any[]> {
    return CompanyDocument.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      controlIds: new mongoose.Types.ObjectId(controlId),
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Obtém o arquivo do documento
   */
  static async getDocumentFile(documentId: string, companyId: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const document = await CompanyDocument.findOne({
      _id: documentId,
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    const fileName = path.basename(document.fileUrl);
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    try {
      const buffer = await fs.readFile(filePath);
      return {
        buffer,
        mimeType: document.mimeType,
        fileName: document.fileName,
      };
    } catch (error) {
      throw new AppError('Arquivo não encontrado no servidor', 404);
    }
  }
}
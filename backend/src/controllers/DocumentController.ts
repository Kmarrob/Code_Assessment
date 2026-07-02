// backend/src/controllers/DocumentController.ts
import { Response, NextFunction } from 'express';
import { DocumentService } from '../services/DocumentService.js';
import { AppError } from '../utils/errors.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js'; // 🔴 ADICIONADO
import multer from 'multer';
import path from 'path';

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: any, file: any, cb: any) => { // 🔴 CORRIGIDO: Adicionar tipos any
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
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use: PDF, Word, Excel, Imagem, TXT ou CSV'));
    }
  },
});

export class DocumentController {
  
  /**
   * Upload de um novo documento
   * POST /api/documents
   */
  static async uploadDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { 
        title, 
        description, 
        category, 
        subcategory,
        expiresAt,
        tags,
        controlIds,
        metadata 
      } = req.body;

      const file = (req as any).file; // 🔴 CORRIGIDO: Cast para any para acessar file
      if (!file) {
        throw new AppError('Arquivo é obrigatório', 400);
      }

      // Validações
      if (!title) {
        throw new AppError('Título é obrigatório', 400);
      }

      if (!category) {
        throw new AppError('Categoria é obrigatória', 400);
      }

      // Obter companyId do usuário
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      // Parse de campos JSON
      let parsedTags: string[] = [];
      let parsedControlIds: string[] = [];
      let parsedMetadata: Record<string, any> = {};

      try {
        if (tags) parsedTags = JSON.parse(tags);
        if (controlIds) parsedControlIds = JSON.parse(controlIds);
        if (metadata) parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        throw new AppError('Campos JSON inválidos', 400);
      }

      const document = await DocumentService.createDocument({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar documentos da empresa
   * GET /api/documents
   */
  static async getDocuments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as any;
      const status = req.query.status as any;
      const search = req.query.search as string;
      const controlId = req.query.controlId as string;

      const result = await DocumentService.getDocuments(companyId.toString(), {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar documento por ID
   * GET /api/documents/:id
   */
  static async getDocumentById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID do documento é obrigatório', 400);
      }

      const document = await DocumentService.getDocumentById(id, companyId.toString());

      if (!document) {
        throw new AppError('Documento não encontrado', 404);
      }

      res.status(200).json({
        success: true,
        data: document,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download do arquivo
   * GET /api/documents/:id/download
   */
  static async downloadDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID do documento é obrigatório', 400);
      }

      const file = await DocumentService.getDocumentFile(id, companyId.toString());

      if (!file) {
        throw new AppError('Arquivo não encontrado', 404);
      }

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
      res.send(file.buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar documento
   * PATCH /api/documents/:id
   */
  static async updateDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID do documento é obrigatório', 400);
      }

      const { 
        title, 
        description, 
        category, 
        subcategory,
        status,
        expiresAt,
        tags,
        controlIds,
        metadata 
      } = req.body;

      // Parse de campos JSON
      let parsedTags: string[] | undefined;
      let parsedControlIds: string[] | undefined;
      let parsedMetadata: Record<string, any> | undefined;

      try {
        if (tags !== undefined) parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (controlIds !== undefined) parsedControlIds = typeof controlIds === 'string' ? JSON.parse(controlIds) : controlIds;
        if (metadata !== undefined) parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (error) {
        throw new AppError('Campos JSON inválidos', 400);
      }

      const document = await DocumentService.updateDocument(id, companyId.toString(), {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir documento
   * DELETE /api/documents/:id
   */
  static async deleteDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID do documento é obrigatório', 400);
      }

      await DocumentService.deleteDocument(id, companyId.toString());

      res.status(200).json({
        success: true,
        message: 'Documento excluído com sucesso',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Arquivar documento
   * PATCH /api/documents/:id/archive
   */
  static async archiveDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID do documento é obrigatório', 400);
      }

      const document = await DocumentService.archiveDocument(id, companyId.toString());

      res.status(200).json({
        success: true,
        data: document,
        message: 'Documento arquivado com sucesso',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar documento arquivado
   * PATCH /api/documents/:id/restore
   */
  static async restoreDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID do documento é obrigatório', 400);
      }

      const document = await DocumentService.restoreDocument(id, companyId.toString());

      res.status(200).json({
        success: true,
        data: document,
        message: 'Documento restaurado com sucesso',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Estatísticas de documentos
   * GET /api/documents/stats
   */
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const companyId = user.companyId;
      if (!companyId) {
        throw new AppError('Usuário não possui empresa associada', 400);
      }

      const stats = await DocumentService.getDocumentStats(companyId.toString());

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Middleware para upload de arquivo único
   */
  static uploadSingleFile = upload.single('file');
}
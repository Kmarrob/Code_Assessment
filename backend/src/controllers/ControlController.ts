// backend/src/controllers/ControlController.ts
import { Response, NextFunction } from 'express';
import { Control } from '../models/Control.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class ControlController {
  /**
   * Lista todos os controles com paginação e filtros
   */
  static async listControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        dominio,
        tipo,
        nota,
        propriedade,
      } = req.query;

      const filter: any = {};

      // Filtro por domínio
      if (dominio) {
        filter.dominioDeSI = { $in: [dominio] };
      }

      // Filtro por tipo de controle
      if (tipo) {
        filter.tipoDeControle = { $in: [tipo] };
      }

      // Filtro por nota
      if (nota) {
        filter.nota = nota;
      }

      // Filtro por propriedade de SI
      if (propriedade) {
        filter.propriedadeDeSI = { $in: [propriedade] };
      }

      // Busca por texto (ID ou nome)
      if (search) {
        filter.$or = [
          { id: { $regex: search, $options: 'i' } },
          { nome: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [controls, total] = await Promise.all([
        Control.find(filter)
          .select('_id id nome tiposDeControles nota controles tipoDeControle propriedadeDeSI conceitoDeSegurancaCibernetica capacidadesOperacionais dominioDeSI createdAt updatedAt')
          .collation({ locale: 'pt', numericOrdering: true })
          .lean()
          .skip(skip)
          .limit(Number(limit))
          .sort({ id: 1 }),
        Control.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      res.json({
        success: true,
        data: { controls },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrevious: Number(page) > 1,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao listar controles:', error);
      next(error);
    }
  }

  /**
   * Busca um controle por ID
   */
  static async getControlById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const control = await Control.findById(id)
        .select('_id id nome tiposDeControles nota controles tipoDeControle propriedadeDeSI conceitoDeSegurancaCibernetica capacidadesOperacionais dominioDeSI createdAt updatedAt')
        .lean();

      if (!control) {
        throw new AppError('Controle não encontrado', 404);
      }

      res.json({
        success: true,
        data: { control },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao buscar controle:', error);
      next(error);
    }
  }

  /**
   * Busca controles por domínio
   */
  static async getControlsByDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dominio } = req.params;

      const controls = await Control.find({
        dominioDeSI: { $in: [dominio] },
      })
        .select('_id id nome nota')
        .lean()
        .sort({ id: 1 });

      res.json({
        success: true,
        data: { controls },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao buscar controles por domínio:', error);
      next(error);
    }
  }

  /**
   * Obtém estatísticas dos controles
   */
  static async getControlStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [total, byNota, byDominio, byTipo] = await Promise.all([
        Control.countDocuments({}),
        Control.aggregate([
          { $group: { _id: '$nota', count: { $sum: 1 } } },
        ]),
        Control.aggregate([
          { $unwind: '$dominioDeSI' },
          { $group: { _id: '$dominioDeSI', count: { $sum: 1 } } },
        ]),
        Control.aggregate([
          { $unwind: '$tipoDeControle' },
          { $group: { _id: '$tipoDeControle', count: { $sum: 1 } } },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          total,
          byNota,
          byDominio,
          byTipo,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas dos controles:', error);
      next(error);
    }
  }

  /**
   * Cria um novo controle
   */
  static async createControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        id,
        nome,
        tiposDeControles,
        nota,
        controles,
        cenarioIdentificado,
        tipoDeControle,
        propriedadeDeSI,
        conceitoDeSegurancaCibernetica,
        capacidadesOperacionais,
        dominioDeSI,
      } = req.body;

      // Validações básicas
      if (!id || !nome) {
        throw new AppError('ID e Nome são obrigatórios', 400);
      }

      // Verificar se já existe
      const existing = await Control.findOne({ id });
      if (existing) {
        throw new AppError(`Controle com ID ${id} já existe`, 400);
      }

      const control = new Control({
        id,
        nome,
        tiposDeControles: tiposDeControles || [],
        nota: nota || '',
        controles: controles || '',
        cenarioIdentificado: cenarioIdentificado || '',
        tipoDeControle: tipoDeControle || [],
        propriedadeDeSI: propriedadeDeSI || [],
        conceitoDeSegurancaCibernetica: conceitoDeSegurancaCibernetica || [],
        capacidadesOperacionais: capacidadesOperacionais || [],
        dominioDeSI: dominioDeSI || [],
      });

      await control.save();

      logger.info(`Controle ${control.id} criado por ${req.user?.email}`);

      res.status(201).json({
        success: true,
        data: { control },
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao criar controle:', error);
      next(error);
    }
  }

  /**
   * Atualiza um controle existente
   */
  static async updateControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const {
        nome,
        tiposDeControles,
        nota,
        controles,
        cenarioIdentificado,
        tipoDeControle,
        propriedadeDeSI,
        conceitoDeSegurancaCibernetica,
        capacidadesOperacionais,
        dominioDeSI,
      } = req.body;

      // Verificar se o controle existe
      const existing = await Control.findById(id);
      if (!existing) {
        throw new AppError('Controle não encontrado', 404);
      }

      // Construir objeto de atualização
      const updateData: any = {};
      if (nome !== undefined) updateData.nome = nome;
      if (tiposDeControles !== undefined) updateData.tiposDeControles = tiposDeControles;
      if (nota !== undefined) updateData.nota = nota;
      if (controles !== undefined) updateData.controles = controles;
      if (cenarioIdentificado !== undefined) updateData.cenarioIdentificado = cenarioIdentificado;
      if (tipoDeControle !== undefined) updateData.tipoDeControle = tipoDeControle;
      if (propriedadeDeSI !== undefined) updateData.propriedadeDeSI = propriedadeDeSI;
      if (conceitoDeSegurancaCibernetica !== undefined) updateData.conceitoDeSegurancaCibernetica = conceitoDeSegurancaCibernetica;
      if (capacidadesOperacionais !== undefined) updateData.capacidadesOperacionais = capacidadesOperacionais;
      if (dominioDeSI !== undefined) updateData.dominioDeSI = dominioDeSI;

      const control = await Control.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      logger.info(`Controle ${control?.id} atualizado por ${req.user?.email}`);

      res.json({
        success: true,
        data: { control },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao atualizar controle:', error);
      next(error);
    }
  }

  /**
   * Deleta um controle
   */
  static async deleteControl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const control = await Control.findByIdAndDelete(id);

      if (!control) {
        throw new AppError('Controle não encontrado', 404);
      }

      logger.info(`Controle ${control.id} deletado por ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Controle deletado com sucesso',
        data: { id: control.id },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao deletar controle:', error);
      next(error);
    }
  }
}
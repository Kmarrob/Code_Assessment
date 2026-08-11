// backend/src/controllers/AuditController.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuditController {
  /**
   * Listar logs de auditoria com filtros
   * GET /api/admin/audit/logs
   */
  static async listLogs(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        category,
        level,
        userId,
        userEmail,
        companyId,
        success,
        startDate,
        endDate,
        search,
      } = req.query;

      const filter: any = {};

      if (action) filter.action = action;
      if (category) filter.category = category;
      if (level) filter.level = level;
      if (userId) filter.userId = userId;
      if (userEmail) filter.userEmail = { $regex: userEmail, $options: 'i' };
      if (companyId) filter.companyId = companyId;
      if (success !== undefined) filter.success = success === 'true';

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate as string);
        if (endDate) filter.timestamp.$lte = new Date(endDate as string);
      }

      if (search) {
        filter.$or = [
          { userEmail: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } },
          { resourceName: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { errorMessage: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        AuditLog.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      res.json({
        success: true,
        data: { logs },
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
      next(error);
    }
  }

  /**
   * Obter estatísticas de logs
   * GET /api/admin/audit/stats
   */
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { days = 30 } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(days));

      const [totalLogs, byCategory, byAction, byLevel, bySuccess, byDay] = await Promise.all([
        AuditLog.countDocuments({ timestamp: { $gte: daysAgo } }),
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: daysAgo } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: daysAgo } } },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]),
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: daysAgo } } },
          { $group: { _id: '$level', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: daysAgo } } },
          { $group: { _id: '$success', count: { $sum: 1 } } },
        ]),
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: daysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          total: totalLogs,
          days: Number(days),
          byCategory,
          byAction,
          byLevel,
          bySuccess,
          byDay,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar log por ID
   * GET /api/admin/audit/logs/:id
   */
  static async getLogById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID do log é obrigatório', 400);
      }

      const log = await AuditLog.findById(id).lean();

      if (!log) {
        throw new AppError('Log não encontrado', 404);
      }

      res.json({
        success: true,
        data: { log },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar logs (CSV/JSON)
   * GET /api/admin/audit/export
   */
  static async exportLogs(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        category,
        action,
        format = 'json',
      } = req.query;

      const filter: any = {};
      if (startDate) filter.timestamp = { $gte: new Date(startDate as string) };
      if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate as string) };
      if (category) filter.category = category;
      if (action) filter.action = action;

      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(10000)
        .lean();

      if (format === 'csv') {
        // Gerar CSV
        const headers = ['timestamp', 'userEmail', 'action', 'category', 'level', 'resource', 'success', 'errorMessage'];
        const csvRows = [
          headers.join(','),
          ...logs.map(log => headers.map(h => JSON.stringify(log[h as keyof typeof log] || '')).join(',')),
        ];
        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
        return;
      }

      // JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.json"`);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
}
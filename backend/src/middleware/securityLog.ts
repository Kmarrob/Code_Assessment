// backend/src/middleware/securityLog.ts
import { Request, Response, NextFunction } from 'express';
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';

/**
 * Middleware para logging de todas as requisições autenticadas
 */
export function securityLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Registrar a requisição no objeto para uso posterior
  (req as any)._security = {
    ip,
    userAgent,
    startTime: Date.now(),
  };

  // Interceptar resposta para logging
  const originalSend = res.send;
  
  res.send = function(body: any): any {
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    // Log apenas para erros (já que ações específicas são logadas nos controllers)
    if (isError) {
      const securityData = (req as any)._security;
      SecurityLogger.log({
        eventType: SecurityEventType.ACCESS_DENIED,
        timestamp: new Date(),
        userId: (req as any).userId,
        email: (req as any).user?.email,
        ip: securityData?.ip || ip,
        userAgent: securityData?.userAgent || userAgent,
        success: false,
        message: `Requisição com erro: ${statusCode} - ${req.method} ${req.path}`,
        details: { statusCode, path: req.path, method: req.method },
      });
    }

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  next();
}
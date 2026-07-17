// backend/src/config/multer.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { logger } from '../utils/logger.js';

// Garantir que o diretório de uploads existe
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`📁 Diretório de uploads criado: ${uploadDir}`);
}

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: timestamp + nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivos - permitir apenas imagens
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`));
  }
};

// Limites de arquivo
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 1,
};

// Middleware multer para upload de logo
export const uploadLogo = multer({
  storage,
  fileFilter,
  limits
});

// Middleware multer para upload de favicon (permitir ícones)
const faviconFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido para favicon. Use: ${allowedTypes.join(', ')}`));
  }
};

export const uploadFavicon = multer({
  storage,
  fileFilter: faviconFilter,
  limits
});

// Middleware de erro para multer
export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
        code: 'FILE_TOO_LARGE',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Apenas um arquivo pode ser enviado por vez',
        code: 'LIMIT_UNEXPECTED_FILE',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${err.message}`,
      code: err.code,
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Erro no upload do arquivo',
      code: 'UPLOAD_ERROR',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  next();
};

export default {
  uploadLogo,
  uploadFavicon,
  handleMulterError
};
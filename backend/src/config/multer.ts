import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// 🔴 CORREÇÃO: Definir caminho base para uploads
// Usar o Disk do Render se estiver em produção, ou local se estiver em desenvolvimento
const isProduction = process.env.NODE_ENV === 'production';
const baseUploadDir = isProduction 
  ? '/opt/render/project/src/backend/uploads' // Disk do Render
  : path.join(process.cwd(), 'uploads'); // Local

// Garantir que os diretórios existam
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`📁 Diretório criado: ${dir}`);
  }
};

// Criar diretórios principais
const uploadsDir = baseUploadDir;
const logoDir = path.join(uploadsDir, 'logo');
const faviconDir = path.join(uploadsDir, 'favicon');

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(logoDir);
ensureDirectoryExists(faviconDir);

// Configuração do storage do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationPath = uploadsDir;
    
    // Determinar destino baseado no campo do formulário
    if (file.fieldname === 'logo') {
      destinationPath = logoDir;
    } else if (file.fieldname === 'favicon') {
      destinationPath = faviconDir;
    }
    
    // Criar subdiretório para a empresa (se companyId estiver disponível)
    const companyId = req.params.companyId;
    if (companyId) {
      destinationPath = path.join(destinationPath, companyId);
      ensureDirectoryExists(destinationPath);
    }
    
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // 🔴 CORREÇÃO: Sanitizar nome do arquivo (remover acentos e caracteres especiais)
    const name = path.basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por _
      .replace(/_+/g, '_'); // Remove underscores duplicados
    
    const filename = `${name}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filtro de arquivos
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/svg+xml', 
    'image/webp',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Formato de arquivo não suportado: ${file.mimetype}. Use PNG, JPG, SVG, WEBP ou ICO.`, 400), false);
  }
};

// Limites de tamanho
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB para logo
};

// Configuração do Multer para logo
export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Configuração do Multer para favicon
export const uploadFavicon = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 512 * 1024, // 512KB
  },
});

// Middleware para tratar erros do Multer
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Limite máximo: 2MB.',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de arquivo inesperado.',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${err.message}`,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Erro ao fazer upload do arquivo',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

export default {
  uploadLogo,
  uploadFavicon,
  handleMulterError,
};
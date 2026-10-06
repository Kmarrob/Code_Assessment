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

// ============================================================
// 🆕 v51.1 — DIRETÓRIO DE EVIDÊNCIAS DE AUDITORIA
// ============================================================
//
// MOTIVO:
//   O endpoint POST /api/internal-audit/evidence/upload NÃO
//   tinha middleware Multer aplicado. Resultado: o multipart
//   não era parseado, `req.file` ficava undefined e
//   `req.body.auditPlanId` nunca chegava ao controller,
//   causando o erro "ID do plano é obrigatório".
//
// SOLUÇÃO:
//   Criar um uploader Multer dedicado para evidências, com
//   fileFilter mais permissivo (aceita PDF, Office, imagens,
//   TXT, CSV) e limite de 10MB — coerente com o módulo de
//   documentos (CompanyDocument).
//
// COMPATIBILIDADE:
//   - Não altera `uploadLogo` nem `uploadFavicon`.
//   - Não altera o `fileFilter` compartilhado.
//   - Aplica-se apenas à rota /evidence/upload.
//
// ============================================================

const evidenceDir = path.join(uploadsDir, 'evidence');

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(logoDir);
ensureDirectoryExists(faviconDir);
ensureDirectoryExists(evidenceDir);

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

// ============================================================
// 🆕 v51.1 — STORAGE DEDICADO PARA EVIDÊNCIAS
// ============================================================
//
// MOTIVO:
//   Evidências vão para `uploads/evidence/`, não para `logo/`
//   nem `favicon/`. Storage separado evita mistura de arquivos
//   e facilita backup/limpeza por tipo.
//
// ============================================================

const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Estrutura: uploads/evidence/<auditPlanId>/
    // (auditPlanId chega no body via FormData)
    const auditPlanId =
      (req.body && (req.body as any).auditPlanId) ||
      (req.params && req.params.auditPlanId) ||
      '';

    let destinationPath = evidenceDir;

    if (auditPlanId) {
      destinationPath = path.join(evidenceDir, String(auditPlanId));
      ensureDirectoryExists(destinationPath);
    }

    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Mesmo padrão do storage de logo: sanitiza + gera sufixo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);

    const name = path.basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por _
      .replace(/_+/g, '_'); // Remove underscores duplicados

    const filename = `${name}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// ============================================================
// 🆕 v51.1 — FILE FILTER PARA EVIDÊNCIAS
// ============================================================
//
// MOTIVO:
//   Evidência de auditoria é por natureza variada — pode ser
//   PDF, planilha, documento, imagem, screenshot, CSV, TXT.
//   O fileFilter de logo é restrito a imagens e não serve aqui.
//
// COMPATIBILIDADE:
//   Não altera o fileFilter de logo/favicon. É um filtro
//   independente, aplicado apenas ao uploader de evidências.
//
// ============================================================

const evidenceFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Texto
    'text/plain',
    'text/csv',
    // Imagens
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // Compactados
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Formato de evidência não suportado: ${file.mimetype}. Use PDF, Word, Excel, PowerPoint, imagens, TXT, CSV ou ZIP.`,
        400
      ),
      false
    );
  }
};

// ============================================================
// 🆕 v51.1 — UPLOADER DE EVIDÊNCIAS
// ============================================================
//
// Limite: 10 MB (coerente com o módulo CompanyDocument).
// Campo esperado no FormData: `file`.
//
// Uso na rota:
//   router.post('/evidence/upload',
//     uploadEvidence.single('file'),
//     auditEvidenceController.upload
//   );
//
// ============================================================

export const uploadEvidence = multer({
  storage: evidenceStorage,
  fileFilter: evidenceFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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

// ============================================================
// 🆕 v51.1 — HANDLER DE ERROS ESPECÍFICO PARA EVIDÊNCIAS
// ============================================================
//
// Diferença para `handleMulterError`:
//   - Mensagem de limite cita 10MB (coerente com o uploader
//     de evidências) em vez de 2MB.
//   - Resto idêntico em comportamento (mesma estrutura JSON).
//
// Não substitui `handleMulterError` — coexiste com ele.
//
// ============================================================

export const handleEvidenceMulterError = (
  err: any,
  req: any,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Limite máximo: 10MB.',
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
      message: err.message || 'Erro ao fazer upload da evidência',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

export default {
  uploadLogo,
  uploadFavicon,
  // 🆕 v51.1 — Uploader de evidências de auditoria
  uploadEvidence,
  handleMulterError,
  // 🆕 v51.1 — Handler de erros específico para evidências
  handleEvidenceMulterError,
};
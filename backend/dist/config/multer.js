"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.uploadFavicon = exports.uploadLogo = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_js_1 = require("../utils/logger.js");
// Garantir que o diretório de uploads existe
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    logger_js_1.logger.info(`📁 Diretório de uploads criado: ${uploadDir}`);
}
// Configuração de armazenamento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único: timestamp + nome original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext);
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
});
// Filtro de arquivos - permitir apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`));
    }
};
// Limites de arquivo
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
};
// Middleware multer para upload de logo
exports.uploadLogo = (0, multer_1.default)({
    storage,
    fileFilter,
    limits
});
// Middleware multer para upload de favicon (permitir ícones)
const faviconFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Tipo de arquivo não permitido para favicon. Use: ${allowedTypes.join(', ')}`));
    }
};
exports.uploadFavicon = (0, multer_1.default)({
    storage,
    fileFilter: faviconFilter,
    limits
});
// Middleware de erro para multer
const handleMulterError = (err, req, res, next) => {
    // Verificar se é erro do Multer
    if (err instanceof multer_1.default.MulterError) {
        // 🔴 CORRIGIDO: Usar os códigos corretos do Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
                code: 'LIMIT_FILE_SIZE',
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
    // Outros erros (não relacionados ao Multer)
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
exports.handleMulterError = handleMulterError;
exports.default = {
    uploadLogo: exports.uploadLogo,
    uploadFavicon: exports.uploadFavicon,
    handleMulterError: exports.handleMulterError
};
//# sourceMappingURL=multer.js.map
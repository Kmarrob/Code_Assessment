"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPasswordExpiry = checkPasswordExpiry;
const logger_js_1 = require("../utils/logger.js");
async function checkPasswordExpiry(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return next();
        }
        // Verificar se o método existe e se a senha expirou
        if (typeof user.needsPasswordChange === 'function' && user.needsPasswordChange()) {
            const isPasswordChangeRoute = req.path === '/profile' && req.method === 'PUT';
            if (!isPasswordChangeRoute) {
                logger_js_1.logger.warn(`Senha expirada para usuário: ${user.email}`);
                res.status(403).json({
                    success: false,
                    message: 'Sua senha expirou. Por favor, troque sua senha.',
                    data: {
                        requiresPasswordChange: true,
                    },
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
        }
        next();
    }
    catch (error) {
        logger_js_1.logger.error('Erro ao verificar expiração de senha:', error);
        next(error);
    }
}
//# sourceMappingURL=passwordExpiry.js.map
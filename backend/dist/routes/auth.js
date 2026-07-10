"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth.ts
const express_1 = require("express");
const AuthController_js_1 = require("../controllers/AuthController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const cache_js_1 = require("../middleware/cache.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// Rotas públicas (sem cache)
router.post('/register', rateLimit_js_1.registerRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.register);
router.post('/login', rateLimit_js_1.authRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.login);
router.post('/refresh-token', rateLimit_js_1.refreshRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.refreshToken);
// 🔴 NOVO: Rotas públicas de redefinição de senha
router.post('/validate-reset-token', rateLimit_js_1.authRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.validateResetToken);
router.post('/reset-password', rateLimit_js_1.authRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.resetPassword);
// Rotas autenticadas (cache privado)
router.use(auth_js_1.authenticate);
router.post('/logout', rateLimit_js_1.authenticatedRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.logout);
router.get('/profile', rateLimit_js_1.authenticatedRateLimiter, cache_js_1.privateCache, AuthController_js_1.AuthController.getProfile);
router.put('/profile', rateLimit_js_1.sensitiveRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.updateProfile);
// Rotas admin (sem cache)
router.get('/users', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.listUsers);
router.get('/users/:id', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, cache_js_1.noCache, AuthController_js_1.AuthController.getUserById);
exports.default = router;
//# sourceMappingURL=auth.js.map
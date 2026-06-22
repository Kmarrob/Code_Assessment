"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/admin.ts
const express_1 = require("express");
const AdminController_js_1 = require("../controllers/AdminController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const cache_js_1 = require("../middleware/cache.js");
const sanitizeAdmin_js_1 = require("../middleware/sanitizeAdmin.js");
const adminPerformance_js_1 = require("../middleware/adminPerformance.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN));
router.use(sanitizeAdmin_js_1.sanitizeAdminInputs);
router.use(sanitizeAdmin_js_1.sanitizeSensitiveFields);
router.use(adminPerformance_js_1.adminPerformanceMiddleware);
router.get('/users', rateLimit_js_1.authenticatedRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.listUsers);
router.get('/users/:id', rateLimit_js_1.authenticatedRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.getUserById);
router.post('/users', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.createUser);
router.put('/users/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.updateUser);
router.delete('/users/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.deleteUser);
router.post('/users/:id/reactivate', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.reactivateUser);
router.post('/users/:id/reset-password', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.resetPassword);
exports.default = router;
//# sourceMappingURL=admin.js.map
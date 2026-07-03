// backend/src/routes/auth.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  authRateLimiter, 
  registerRateLimiter, 
  refreshRateLimiter,
  authenticatedRateLimiter,
  sensitiveRateLimiter
} from '../middleware/rateLimit.js';
import { noCache, privateCache } from '../middleware/cache.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Rotas públicas (sem cache)
router.post('/register', registerRateLimiter, noCache, AuthController.register);
router.post('/login', authRateLimiter, noCache, AuthController.login);
router.post('/refresh-token', refreshRateLimiter, noCache, AuthController.refreshToken);

// 🔴 NOVO: Rotas públicas de redefinição de senha
router.post('/validate-reset-token', authRateLimiter, noCache, AuthController.validateResetToken);
router.post('/reset-password', authRateLimiter, noCache, AuthController.resetPassword);

// Rotas autenticadas (cache privado)
router.use(authenticate);

router.post('/logout', authenticatedRateLimiter, noCache, AuthController.logout);
router.get('/profile', authenticatedRateLimiter, privateCache, AuthController.getProfile);
router.put('/profile', sensitiveRateLimiter, noCache, AuthController.updateProfile);

// Rotas admin (sem cache)
router.get(
  '/users', 
  authorize(UserRole.ADMIN),
  authenticatedRateLimiter, 
  noCache,
  AuthController.listUsers
);

router.get(
  '/users/:id', 
  authorize(UserRole.ADMIN),
  authenticatedRateLimiter, 
  noCache,
  AuthController.getUserById
);

export default router;
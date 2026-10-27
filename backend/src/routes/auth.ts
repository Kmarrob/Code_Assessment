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
import jwt from 'jsonwebtoken'; // NOVO

const router = Router();

// Rotas públicas (sem cache)
router.post('/register', registerRateLimiter, noCache, AuthController.register);
router.post('/login', authRateLimiter, noCache, AuthController.login);
router.post('/refresh-token', refreshRateLimiter, noCache, AuthController.refreshToken);

// 🔴 Rotas públicas de redefinição de senha
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

// ==========================================
// NOVO: ROTA DE SSO PARA O LGPD
// ==========================================
router.get('/sso/lgpd', authenticatedRateLimiter, noCache, (req: any, res: any) => {
  try {
    const user = req.user; // Populado pelo middleware authenticate

    if (!user || !user.companyId) {
      return res.status(400).json({ error: 'Usuário não possui empresa associada para acessar o LGPD.' });
    }

    // Gera o token que será validado pelo backend do LGPD
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.companyId, // Mapeia companyId para tenantId
      role: user.role
    };

    // O segredo deve ser o mesmo configurado no Render do LGPD
    const ssoSecret = process.env.SSO_SHARED_SECRET || 'lgpd_sso_secret_2026_mrs';
    
    // Token expira em 2 minutos (tempo suficiente para o redirecionamento)
    const ssoToken = jwt.sign(payload, ssoSecret, { expiresIn: '2m' });

    // Retorna a URL pronta para o frontend redirecionar
    const lgpdFrontendUrl = process.env.LGPD_FRONTEND_URL || 'https://lgpd-frontend.onrender.com';
    
    return res.status(200).json({ 
      redirectUrl: `${lgpdFrontendUrl}/auth/sso?sso_token=${ssoToken}` 
    });

  } catch (error) {
    console.error('[Erro SSO LGPD]', error);
    return res.status(500).json({ error: 'Erro ao gerar token de acesso ao LGPD.' });
  }
});
// FIM DA ROTA DE SSO

export default router;
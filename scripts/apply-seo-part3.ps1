# scripts/apply-seo-part3.ps1
# Script para implementar SEO & Semântica - Parte 3/4 (Configuração de Arquivos SEO)

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - SEO & SEMÂNTICA (PILAR 6)            ║" -ForegroundColor Cyan
Write-Host "║     PARTE 3/4 - CONFIGURAÇÃO DE ARQUIVOS SEO              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: ROBOTS.TXT
# ============================================
Write-Step "PARTE 1/4: ROBOTS.TXT"

Write-Info "Criando robots.txt..."
# Criar pasta public se não existir
New-Item -ItemType Directory -Path "$BaseDir\frontend\public" -Force | Out-Null

@'
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api

Sitemap: https://code-assessment.com/sitemap.xml

Crawl-delay: 2

User-agent: Googlebot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api

User-agent: Bingbot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api
'@ | Out-File -FilePath "$BaseDir\frontend\public\robots.txt" -Encoding UTF8
Write-Success "robots.txt criado"

# ============================================
# PARTE 2: SITEMAP CONTROLLER
# ============================================
Write-Step "PARTE 2/4: SITEMAP CONTROLLER"

Write-Info "Criando SitemapController.ts..."
@'
// backend/src/controllers/SitemapController.ts
import { Request, Response } from 'express';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const routes: SitemapUrl[] = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/login', changefreq: 'monthly', priority: 0.5 },
  { loc: '/register', changefreq: 'monthly', priority: 0.6 },
  { loc: '/dashboard', changefreq: 'daily', priority: 0.8 },
  { loc: '/profile', changefreq: 'weekly', priority: 0.6 },
];

const adminRoutes: SitemapUrl[] = [
  { loc: '/admin', changefreq: 'weekly', priority: 0.3 },
  { loc: '/rep', changefreq: 'weekly', priority: 0.4 },
  { loc: '/consultant', changefreq: 'weekly', priority: 0.4 },
];

export class SitemapController {
  static async generate(req: Request, res: Response): Promise<void> {
    const baseUrl = req.protocol + '://' + req.get('host') || 'https://code-assessment.com';
    const currentDate = new Date().toISOString();

    const allRoutes = [...routes, ...adminRoutes];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    for (const route of allRoutes) {
      sitemap += `
  <url>
    <loc>${baseUrl}${route.loc}</loc>
    <lastmod>${route.lastmod || currentDate}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || 0.5}</priority>
  </url>`;
    }

    sitemap += `
  <url>
    <loc>${baseUrl}/</loc>
    <image:image>
      <image:loc>${baseUrl}/og-image.jpg</image:loc>
      <image:title>Code_Assessment - Avaliação de Maturidade ISO 27001</image:title>
    </image:image>
  </url>`;

    sitemap += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\controllers\SitemapController.ts" -Encoding UTF8
Write-Success "SitemapController.ts criado"

# ============================================
# PARTE 3: SERVER COM SITEMAP E ROBOTS
# ============================================
Write-Step "PARTE 3/4: SERVER COM SITEMAP E ROBOTS"

Write-Info "Atualizando server.ts..."
@'
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.js';
import { db } from './config/database.js';
import { logger, httpLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import { noCache } from './middleware/cache.js';
import { SitemapController } from './controllers/SitemapController.js';

const app = express();

app.use(compression({
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.CORS_ORIGIN],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpLogger);
app.use(generalRateLimiter);

app.use('/api/auth', authRoutes);

app.get('/health', noCache, (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: db.getConnectionState() ? 'connected' : 'disconnected',
  });
});

// ============================================
// SEO - SITEMAP
// ============================================
app.get('/sitemap.xml', SitemapController.generate);

// ============================================
// SEO - ROBOTS.TXT
// ============================================
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api

Sitemap: https://code-assessment.com/sitemap.xml

Crawl-delay: 2

User-agent: Googlebot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api

User-agent: Bingbot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api
`);
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.PORT;

async function startServer() {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
      logger.info(`🔧 Ambiente: ${config.NODE_ENV}`);
      logger.info(`🔒 Segurança ativa: Helmet, CORS, Rate Limit`);
      logger.info(`📦 Compressão: Gzip/Brotli ativa`);
      logger.info(`❤️ Health check: http://localhost:${PORT}/health`);
      logger.info(`🗺️ Sitemap: http://localhost:${PORT}/sitemap.xml`);
      logger.info(`🤖 Robots: http://localhost:${PORT}/robots.txt`);
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await db.disconnect();
  process.exit(0);
});

startServer();
'@ | Out-File -FilePath "$BaseDir\backend\src\server.ts" -Encoding UTF8
Write-Success "server.ts atualizado"

# ============================================
# PARTE 4: IMAGE COMPONENT
# ============================================
Write-Step "PARTE 4/4: IMAGE COMPONENT"

Write-Info "Criando Image.tsx..."
@'
// frontend/src/components/ui/Image.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallbackSrc,
  lazy = true,
  className,
  ...props
}) => {
  const [error, setError] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const handleError = () => {
    if (fallbackSrc && !error) {
      setError(true);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const finalSrc = error && fallbackSrc ? fallbackSrc : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      onError={handleError}
      onLoad={handleLoad}
      className={cn(
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
};

export const LogoImage: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src="/logo.svg"
    alt="Code_Assessment - Logo"
    fallbackSrc="/logo-fallback.png"
    className={className}
  />
);

export const HeroImage: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src="/hero-image.svg"
    alt="Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001"
    fallbackSrc="/hero-image-fallback.png"
    className={className}
  />
);

export const OgImage: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src="/og-image.jpg"
    alt="Code_Assessment - Compartilhe a avaliação de maturidade ISO 27001"
    fallbackSrc="/og-image-fallback.png"
    className={className}
  />
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Image.tsx" -Encoding UTF8
Write-Success "Image.tsx criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 3/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/public/robots.txt"
Write-Info "  • backend/src/controllers/SitemapController.ts"
Write-Info "  • backend/src/server.ts (atualizado)"
Write-Info "  • frontend/src/components/ui/Image.tsx"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ robots.txt configurado" -ForegroundColor White
Write-Info "  ✅ sitemap.xml dinâmico" -ForegroundColor White
Write-Info "  ✅ Componente Image com alt e lazy loading" -ForegroundColor White
Write-Info "  ✅ Rotas de SEO no backend" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Acesse: http://localhost:3000/sitemap.xml" -ForegroundColor White
Write-Info "  3. Acesse: http://localhost:3000/robots.txt" -ForegroundColor White
Write-Info "  4. Verifique o componente Image com alt text" -ForegroundColor White

Write-Success "🎉 Parte 3/4 concluída com sucesso!"
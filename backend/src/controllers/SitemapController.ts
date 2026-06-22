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

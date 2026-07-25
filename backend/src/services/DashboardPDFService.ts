```typescript
// backend/src/services/DashboardPDFService.ts
// 🔴 CORRIGIDO: Agora renderiza gráficos Recharts no PDF usando React

import { logger } from '../utils/logger.js';

interface DashboardPDFData {
  company: {
    id: string;
    name: string;
  };
  summary: {
    totalControls: number;
    Implementado: number;
    Parcialmente: number;
    NaoImplementado: number;
    NaoSeAplica: number;
    percentages: {
      Implementado: number;
      Parcialmente: number;
      NaoImplementado: number;
      NaoSeAplica: number;
    };
  };
  byDomain: Record<string, any>;
  byCategory: Record<string, any>;
  byType: Record<string, any>;
  byCyberConcept: Record<string, any>;
  byCapability: Record<string, any>;
  user: {
    name: string;
    email: string;
  };
  generatedAt: string;
}

interface BrowserLaunchOptions {
  headless: boolean;
  args?: string[];
  executablePath?: string;
}

export class DashboardPDFService {
  /**
   * Gera o PDF do Dashboard de Maturidade usando Puppeteer com React + Recharts
   */
  static async generateDashboardPDF(data: DashboardPDFData): Promise<Buffer> {
    const startTime = Date.now();
    let browser = null;

    try {
      const isProduction = process.env.NODE_ENV === 'production';
      let puppeteer;
      let browserOptions: BrowserLaunchOptions;

      if (isProduction) {
        const chromiumModule = await import('@sparticuz/chromium');
        const chromium = chromiumModule.default || chromiumModule;
        const puppeteerCore = await import('puppeteer-core');
        puppeteer = puppeteerCore.default || puppeteerCore;

        browserOptions = {
          args: chromium.args || [],
          executablePath: await chromium.executablePath(),
          headless: true,
        };

        logger.info('🔄 DashboardPDF: Usando Chromium do @sparticuz em produção');
      } else {
        const puppeteerModule = await import('puppeteer');
        puppeteer = puppeteerModule.default || puppeteerModule;

        let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

        browserOptions = {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
          ]
        };

        if (executablePath) {
          browserOptions.executablePath = executablePath;
        }

        logger.info('🔄 DashboardPDF: Usando Puppeteer local em desenvolvimento');
      }

      browser = await puppeteer.launch(browserOptions);
      const page = await browser.newPage();

      await page.setViewport({
        width: 1280,
        height: 2000,
        deviceScaleFactor: 2,
      });

      // 🔴 Gerar HTML com React + Recharts
      const html = this.generateReactHTML(data);

      await page.setContent(html, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'] as any
      });

      // 🔴 Aguardar a renderização dos gráficos Recharts
      logger.info('🔄 DashboardPDF: Aguardando renderização dos gráficos...');

      try {
        await page.waitForFunction(
          () => {
            const wrappers = document.querySelectorAll('.recharts-wrapper');
            return wrappers.length > 0;
          },
          { timeout: 60000 }
        );

        logger.info('✅ DashboardPDF: Gráficos Recharts encontrados');
      } catch (error) {
        logger.warn('⚠️ DashboardPDF: Nenhum gráfico Recharts encontrado, continuando...');
      }

      // 🔴 Espera adicional para renderização completa
      await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 5000);
        });
      });

      // 🔴 Verificar quantos gráficos foram renderizados
      const chartCount = await page.evaluate(() => {
        return document.querySelectorAll('.recharts-wrapper').length;
      });

      logger.info(`📊 DashboardPDF: ${chartCount} gráficos encontrados na página`);

      // Gerar PDF
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '15mm',
          bottom: '15mm',
          left: '10mm',
          right: '10mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 8pt; color: #475569; border-bottom: 1px solid #e2e8f0; padding: 4mm 10mm; width: 100%; font-family: Arial, Helvetica, sans-serif;">
            <span style="float: left; font-weight: bold;">
              <span style="color: #2563eb;">Code</span><span style="color: #475569;">_Assessment</span>
            </span>
            <span style="float: right; color: #64748b; font-size: 7pt;">
              <strong>${data.company.name}</strong> | Dashboard de Maturidade
            </span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 7pt; color: #64748b; border-top: 1px solid #e2e8f0; padding: 3mm 10mm; width: 100%; font-family: Arial, Helvetica, sans-serif;">
            <span style="float: left;">Gerado em ${new Date(data.generatedAt).toLocaleDateString('pt-BR')}</span>
            <span style="float: right;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
          </div>
        `,
        preferCSSPageSize: true,
        scale: 1.0,
        timeout: 120000,
      });

      const endTime = Date.now();

      logger.info(
        `✅ DashboardPDF gerado em ${endTime - startTime}ms (${pdf.length} bytes)`
      );

      return Buffer.from(pdf);

    } catch (error) {
      logger.error('❌ DashboardPDF: Erro ao gerar PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        logger.debug('🔒 DashboardPDF: Browser fechado');
      }
    }
  }

  /**
   * 🔴 NOVO: Gera HTML com React + Recharts para renderização no Puppeteer
   */
  private static generateReactHTML(data: DashboardPDFData): string {
    const {
      company,
      summary,
      byDomain,
      byCategory,
      byType,
      byCyberConcept,
      byCapability,
      user,
      generatedAt
    } = data;

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    const completionRate = summary.totalControls > 0
      ? Math.round((summary.Implementado / summary.totalControls) * 100)
      : 0;

    // 🔴 Preparar dados para os gráficos (mesmo formato do frontend)
    const pieData = [
      {
        name: 'Implementado',
        value: summary.Implementado || 0,
        color: '#10b981'
      },
      {
        name: 'Parcialmente implementado',
        value: summary.Parcialmente || 0,
        color: '#f59e0b'
      },
      {
        name: 'Não implementado',
        value: summary.NaoImplementado || 0,
        color: '#ef4444'
      },
      {
        name: 'Não se aplica',
        value: summary.NaoSeAplica || 0,
        color: '#94a3b8'
      },
    ].filter(d => d.value > 0);

    const barData = [
      {
        name: 'Implementados',
        value: summary.Implementado || 0,
        color: '#10b981'
      },
      {
        name: 'Parciais',
        value: summary.Parcialmente || 0,
        color: '#f59e0b'
      },
      {
        name: 'Não Implementados',
        value: summary.NaoImplementado || 0,
        color: '#ef4444'
      },
    ].filter(d => d.value > 0);

    // 🔴 Dados por categoria
    const categoryData = Object.entries(byCategory || {}).map(
      ([key, value]: [string, any]) => ({
        name: key.replace('Controles ', ''),
        total: value.total || 0,
        implemented: value.implemented || 0,
        partial: value.partial || 0,
        notImpl: value.notImpl || 0,
      })
    );

    // 🔴 Dados por conceito cibernético
    const conceptData = Object.entries(byCyberConcept || {}).map(
      ([key, value]: [string, any]) => ({
        name: key,
        total: value.total || 0,
        implemented: value.implemented || 0,
        partial: value.partial || 0,
        notImpl: value.notImpl || 0,
      })
    );

    // 🔴 Dados por domínio
    const domainData = Object.entries(byDomain || {}).map(
      ([key, value]: [string, any]) => ({
        name: key,
        total: value.total || 0,
        implemented: value.implemented || 0,
        partial: value.partial || 0,
        notImpl: value.notImpl || 0,
      })
    );

    // 🔴 Dados por tipo
    const typeData = Object.entries(byType || {}).map(
      ([key, value]: [string, any]) => ({
        name: key,
        total: value.total || 0,
        implemented: value.implemented || 0,
        partial: value.partial || 0,
        notImpl: value.notImpl || 0,
      })
    );

    // 🔴 Dados por capacidade
    const capabilityData = Object.entries(byCapability || {}).map(
      ([key, value]: [string, any]) => ({
        name: key,
        total: value.total || 0,
        implemented: value.implemented || 0,
        partial: value.partial || 0,
        notImpl: value.notImpl || 0,
        aderente: value.aderente || 0,
      })
    );

    // 🔴 Dados para o gráfico de radar
    const capabilities = [
      'Governança',
      'Gestão de ativos',
      'Proteção da informação',
      'Gestão de identidade e acesso',
      'Relações com fornecedores',
      'Eventos de SI',
      'Ameaças e vulnerabilidades',
      'Continuidade',
      'Segurança física',
      'Desenvolvimento seguro',
      'Gestão de redes',
      'Monitoramento e análise',
      'Gestão de pessoas',
      'Criptografia',
      'Garantia de SI'
    ];

    const radarData = capabilities.map(cap => {
      const capData = byCapability?.[cap];
      const aderente = capData?.aderente || 0;

      return {
        subject: cap.length > 20
          ? cap.substring(0, 20) + '…'
          : cap,
        fullLabel: cap,
        Implementado: aderente,
        Recomendado: 100,
      };
    });

    const hasRadarData = radarData.some(
      d => d.Implementado > 0
    );

    // 🔴 Escapar os dados para JSON
    const escapeJson = (obj: any) => {
      return JSON.stringify(obj)
        .replace(/<\/script/g, '<\\/script');
    };

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard de Maturidade - ${company.name}</title>

  <!-- React e ReactDOM via CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Recharts via CDN -->
  <script src="https://unpkg.com/recharts@2.8.0/umd/Recharts.js"></script>

  <!-- Babel Standalone para JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #1e293b;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }

    .page {
      width: 100%;
      min-height: 100vh;
      padding: 15pt 12pt;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #0f172a;
      text-align: center;
      margin-bottom: 8pt;
    }

    h2 {
      font-size: 14pt;
      font-weight: bold;
      color: #1e3a8a;
      margin-top: 10pt;
      margin-bottom: 6pt;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3pt;
    }

    h3 {
      font-size: 11pt;
      font-weight: bold;
      color: #0f172a;
      margin-top: 8pt;
      margin-bottom: 4pt;
    }

    p {
      text-align: justify;
      margin: 3pt 0;
      line-height: 1.4;
      font-size: 9pt;
    }

    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-900 { color: #111827; }
    .text-blue-600 { color: #2563eb; }
    .text-emerald-600 { color: #059669; }
    .text-amber-600 { color: #d97706; }
    .text-red-600 { color: #dc2626; }

    .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-green-50 { background-color: #f0fdf4; }
    .bg-yellow-50 { background-color: #fffbeb; }
    .bg-red-50 { background-color: #fef2f2; }

    .border {
      border: 1px solid #e5e7eb;
    }

    .border-gray-200 {
      border-color: #e5e7eb;
    }

    .rounded-lg {
      border-radius: 4pt;
    }

    .p-3 { padding: 6pt; }
    .p-4 { padding: 8pt; }
    .p-6 { padding: 12pt; }

    .mt-2 { margin-top: 4pt; }
    .mt-3 { margin-top: 6pt; }
    .mt-4 { margin-top: 8pt; }

    .mb-2 { margin-bottom: 4pt; }
    .mb-3 { margin-bottom: 6pt; }
    .mb-4 { margin-bottom: 8pt; }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6pt;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6pt;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 6pt;
    }

    .grid-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin: 4pt 0;
      page-break-inside: avoid;
    }

    th,
    td {
      border: 1px solid #cbd5e1;
      padding: 3pt 4pt;
      text-align: left;
      vertical-align: middle;
    }

    th {
      font-weight: bold;
      background-color: #f1f5f9;
      text-align: center;
    }

    .metric-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4pt;
      padding: 6pt 8pt;
      text-align: center;
    }

    .metric-card .value {
      font-size: 18pt;
      font-weight: bold;
    }

    .metric-card .label {
      font-size: 8pt;
      color: #64748b;
    }

    .progress-bar {
      width: 100%;
      height: 6pt;
      background-color: #e2e8f0;
      border-radius: 3pt;
      overflow: hidden;
      margin-top: 2pt;
    }

    .progress-bar .fill {
      height: 100%;
      border-radius: 3pt;
    }

    .section-break {
      page-break-before: always;
    }

    .page-break-avoid {
      page-break-inside: avoid;
    }

    .recharts-wrapper {
      max-width: 100%;
      margin: 0 auto;
      display: block;
    }

    .recharts-text {
      fill: #334155 !important;
      font-size: 7pt !important;
    }

    .recharts-legend-item-text {
      font-size: 7pt !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cover-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .cover-page h1 {
      font-size: 24pt;
      border-bottom: none;
    }

    .cover-page .subtitle {
      font-size: 14pt;
      color: #475569;
      margin-top: 4pt;
    }

    .cover-page .company-name {
      font-size: 20pt;
      font-weight: 600;
      color: #2563eb;
      margin-top: 12pt;
      padding: 6pt 24pt;
      border-top: 2px solid #2563eb;
      border-bottom: 2px solid #2563eb;
    }

    .cover-page .meta-info {
      font-size: 10pt;
      color: #64748b;
      margin-top: 16pt;
      line-height: 1.8;
    }

    .cover-page .footer-text {
      font-size: 8pt;
      color: #94a3b8;
      margin-top: 24pt;
      border-top: 1px solid #e2e8f0;
      padding-top: 8pt;
      width: 60%;
    }

    .print-only {
      display: block;
    }

    .screen-only {
      display: none;
    }

    /* Container para gráficos Recharts */
    .chart-container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 4pt;
      padding: 6pt;
      margin-bottom: 4pt;
      width: 100%;
    }

    .chart-title {
      font-size: 9pt;
      font-weight: bold;
      color: #475569;
      text-align: center;
      margin-bottom: 2pt;
    }

    .chart-subtitle {
      font-size: 7pt;
      color: #94a3b8;
      text-align: center;
      margin-bottom: 4pt;
    }

    .radar-container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 4pt;
      padding: 6pt;
      margin-bottom: 4pt;
      width: 100%;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .recharts-wrapper {
      width: 100% !important;
      height: auto !important;
    }

    .recharts-surface {
      width: 100% !important;
      height: auto !important;
    }
  </style>
</head>

<body>

  <!-- CAPA -->
  <div class="page cover-page">
    <div style="font-size: 36pt; font-weight: 900; color: #0f172a; letter-spacing: -2px;">
      Code<span style="color: #2563eb;">_Assessment</span>
    </div>

    <h1>Dashboard de Maturidade</h1>

    <p class="subtitle">Avaliação ISO 27001:2022</p>

    <div class="company-name">${company.name}</div>

    <div class="meta-info">
      <div><strong>Responsável:</strong> ${user.name}</div>
      <div><strong>E-mail:</strong> ${user.email}</div>
      <div><strong>Data de emissão:</strong> ${formatDate(generatedAt)}</div>
    </div>

    <div class="footer-text">
      Este dashboard consolida todas as métricas de maturidade da empresa<br />
      com base nos 93 controles da norma ISO 27001:2022
    </div>
  </div>

  <!-- SEÇÃO 1: VISÃO GERAL -->
  <div class="page">
    <h2>1. Visão Geral</h2>

    <div class="grid-5" style="margin-bottom: 6pt;">
      <div class="metric-card">
        <div class="value" style="color: #2563eb;">
          ${summary.totalControls}
        </div>
        <div class="label">Total Controles</div>
      </div>

      <div class="metric-card">
        <div class="value" style="color: #10b981;">
          ${summary.Implementado}
        </div>
        <div class="label">Implementados</div>
      </div>

      <div class="metric-card">
        <div class="value" style="color: #f59e0b;">
          ${summary.Parcialmente}
        </div>
        <div class="label">Parciais</div>
      </div>

      <div class="metric-card">
        <div class="value" style="color: #ef4444;">
          ${summary.NaoImplementado}
        </div>
        <div class="label">Não Implementados</div>
      </div>

      <div class="metric-card">
        <div class="value" style="color: #2563eb;">
          ${completionRate}%
        </div>
        <div class="label">Taxa de Conclusão</div>
      </div>
    </div>

    <div class="grid-2">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 8pt; text-align: center;">
        <p style="font-size: 9pt; font-weight: bold; color: #475569;">
          Distribuição de Status
        </p>

        ${pieData.map(d => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 2pt 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 8pt; height: 8pt; border-radius: 50%; background-color: ${d.color};"></span>
              <span style="font-size: 8pt;">${d.name}</span>
            </div>

            <span style="font-size: 8pt; font-weight: bold;">
              ${d.value}
            </span>
          </div>
        `).join('')}

        <div style="margin-top: 4pt; padding-top: 4pt; border-top: 1px solid #e2e8f0;">
          <span style="font-size: 8pt; color: #64748b;">
            Total: ${summary.totalControls} controles
          </span>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 8pt;">
        <p style="font-size: 9pt; font-weight: bold; color: #475569; text-align: center;">
          Taxa de Conclusão
        </p>

        <div style="text-align: center; margin: 4pt 0;">
          <span style="font-size: 28pt; font-weight: bold; color: ${completionRate >= 67 ? '#10b981' : completionRate >= 34 ? '#f59e0b' : '#ef4444'};">
            ${completionRate}%
          </span>
        </div>

        <div class="progress-bar">
          <div class="fill" style="width: ${completionRate}%; background-color: ${completionRate >= 67 ? '#10b981' : completionRate >= 34 ? '#f59e0b' : '#ef4444'};"></div>
        </div>

        <p style="font-size: 7pt; color: #94a3b8; text-align: center; margin-top: 2pt;">
          ${summary.Implementado} de ${summary.totalControls} controles implementados
        </p>
      </div>
    </div>

    <!-- 🔴 GRÁFICOS REACT - PIE E BAR -->
    <div class="grid-2" style="margin-top: 8pt;">
      <div class="chart-container">
        <div id="pie-chart-root" style="width: 100%; height: 260px;"></div>
      </div>

      <div class="chart-container">
        <div id="bar-chart-root" style="width: 100%; height: 260px;"></div>
      </div>
    </div>
  </div>

  <!-- SEÇÃO 2: CATEGORIZAÇÃO -->
  ${categoryData.length > 0 ? `
  <div class="page section-break">
    <h2>2. Categorização</h2>

    <div class="grid-4">
      ${categoryData.map(cat => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; color: #1e293b;">
            ${cat.total}
          </div>

          <div style="font-size: 7pt; color: #64748b;">
            ${cat.name}
          </div>

          <div style="display: flex; justify-content: center; gap: 4pt; margin-top: 2pt;">
            <span style="font-size: 6pt; color: #10b981;">
              ✅ ${cat.implemented}
            </span>

            <span style="font-size: 6pt; color: #f59e0b;">
              🔄 ${cat.partial}
            </span>

            <span style="font-size: 6pt; color: #ef4444;">
              ❌ ${cat.notImpl}
            </span>
          </div>

          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0}%; background-color: #8b5cf6;"></div>
          </div>

          <div style="font-size: 6pt; color: #94a3b8; margin-top: 1pt;">
            ${cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0}%
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 3: CONCEITOS CIBERNÉTICOS -->
  ${conceptData.length > 0 ? `
  <div class="page section-break">
    <h2>3. Conceitos Cibernéticos</h2>

    <div class="grid-5">
      ${conceptData.map(concept => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 8pt; font-weight: 600; color: #475569;">
            ${concept.name}
          </div>

          <div style="font-size: 14pt; font-weight: bold; color: ${concept.implemented > 0 ? '#10b981' : '#94a3b8'};">
            ${concept.implemented}
          </div>

          <div style="font-size: 6pt; color: #94a3b8;">
            de ${concept.total}
          </div>

          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${concept.total > 0 ? Math.round((concept.implemented / concept.total) * 100) : 0}%; background-color: #8b5cf6;"></div>
          </div>

          <div style="font-size: 6pt; color: #94a3b8; margin-top: 1pt;">
            ${concept.total > 0 ? Math.round((concept.implemented / concept.total) * 100) : 0}%
          </div>
        </div>
      `).join('')}
    </div>

    <!-- 🔴 GRÁFICO DE BARRAS PARA CONCEITOS -->
    <div class="chart-container" style="margin-top: 8pt;">
      <div id="concept-bar-chart-root" style="width: 100%; height: 260px;"></div>
    </div>

    <div style="margin-top: 8pt; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt;">
      <p style="font-size: 7pt; color: #94a3b8; text-align: center;">
        Distribuição dos controles por conceito cibernético (NIST): Identificar, Proteger, Detectar, Responder, Restaurar
      </p>
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 4: DOMÍNIOS DE SI -->
  ${domainData.length > 0 ? `
  <div class="page section-break">
    <h2>4. Domínios de SI</h2>

    <div class="grid-4">
      ${domainData.map(domain => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 10pt; font-weight: bold; color: #1e293b;">
            ${domain.total}
          </div>

          <div style="font-size: 7pt; color: #64748b;">
            ${domain.name}
          </div>

          <div style="display: flex; justify-content: center; gap: 4pt; margin-top: 2pt;">
            <span style="font-size: 6pt; color: #10b981;">
              ✅ ${domain.implemented}
            </span>

            <span style="font-size: 6pt; color: #f59e0b;">
              🔄 ${domain.partial}
            </span>

            <span style="font-size: 6pt; color: #ef4444;">
              ❌ ${domain.notImpl}
            </span>
          </div>

          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${domain.total > 0 ? Math.round((domain.implemented / domain.total) * 100) : 0}%; background-color: #3b82f6;"></div>
          </div>

          <div style="font-size: 6pt; color: #94a3b8; margin-top: 1pt;">
            ${domain.total > 0 ? Math.round((domain.implemented / domain.total) * 100) : 0}%
          </div>
        </div>
      `).join('')}
    </div>

    <!-- 🔴 GRÁFICO DE BARRAS PARA DOMÍNIOS -->
    <div class="chart-container" style="margin-top: 8pt;">
      <div id="domain-bar-chart-root" style="width: 100%; height: 260px;"></div>
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 5: TIPOS DE CONTROLE -->
  ${typeData.length > 0 ? `
  <div class="page section-break">
    <h2>5. Tipos de Controle</h2>

    <div class="grid-3">
      ${typeData.map(type => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 10pt; font-weight: bold; color: #1e293b;">
            ${type.total}
          </div>

          <div style="font-size: 7pt; color: #64748b;">
            ${type.name}
          </div>

          <div style="display: flex; justify-content: center; gap: 4pt; margin-top: 2pt;">
            <span style="font-size: 6pt; color: #10b981;">
              ✅ ${type.implemented}
            </span>

            <span style="font-size: 6pt; color: #f59e0b;">
              🔄 ${type.partial}
            </span>

            <span style="font-size: 6pt; color: #ef4444;">
              ❌ ${type.notImpl}
            </span>
          </div>

          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${type.total > 0 ? Math.round((type.implemented / type.total) * 100) : 0}%; background-color: #6366f1;"></div>
          </div>

          <div style="font-size: 6pt; color: #94a3b8; margin-top: 1pt;">
            ${type.total > 0 ? Math.round((type.implemented / type.total) * 100) : 0}%
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 6: CAPACIDADES OPERACIONAIS -->
  ${capabilityData.length > 0 ? `
  <div class="page section-break">
    <h2>6. Capacidades Operacionais</h2>

    <!-- 🔴 GRÁFICO RADAR -->
    ${hasRadarData ? `
    <div class="radar-container" style="margin-bottom: 8pt;">
      <div id="radar-chart-root" style="width: 100%; height: 350px;"></div>
    </div>
    ` : ''}

    <table style="font-size: 7pt;">
      <thead>
        <tr>
          <th style="font-size: 7pt;">Capacidade</th>
          <th style="text-align: center; font-size: 7pt;">✅ Imp.</th>
          <th style="text-align: center; font-size: 7pt;">🔄 Parc.</th>
          <th style="text-align: center; font-size: 7pt;">❌ N.I.</th>
          <th style="text-align: center; font-size: 7pt;">Total</th>
          <th style="text-align: center; font-size: 7pt;">Aderência</th>
        </tr>
      </thead>

      <tbody>
        ${capabilityData.map(cap => `
          <tr>
            <td style="font-size: 7pt;">
              ${cap.name}
            </td>

            <td style="text-align: center; font-size: 7pt; color: #10b981;">
              ${cap.implemented}
            </td>

            <td style="text-align: center; font-size: 7pt; color: #f59e0b;">
              ${cap.partial}
            </td>

            <td style="text-align: center; font-size: 7pt; color: #ef4444;">
              ${cap.notImpl}
            </td>

            <td style="text-align: center; font-size: 7pt; font-weight: bold;">
              ${cap.total}
            </td>

            <td style="text-align: center; font-size: 7pt; font-weight: bold; color: ${cap.aderente >= 70 ? '#10b981' : cap.aderente >= 40 ? '#f59e0b' : '#ef4444'};">
              ${cap.aderente}%
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- RODAPÉ -->
  <div class="page" style="page-break-after: auto;">
    <div style="text-align: center; padding: 20pt 0; border-top: 1px solid #e2e8f0; margin-top: 12pt;">
      <p style="font-size: 7pt; color: #94a3b8;">
        © ${new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001<br>
        Relatório gerado em ${formatDate(generatedAt)} para ${company.name}
      </p>
    </div>
  </div>

  <!-- 🔴 SCRIPTS REACT PARA RENDERIZAR OS GRÁFICOS -->
  <script type="text/babel">
    (function() {
      const { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } = Recharts;

      // Dados
      const pieData = ${escapeJson(pieData)};
      const barData = ${escapeJson(barData)};
      const conceptData = ${escapeJson(conceptData)};
      const domainData = ${escapeJson(domainData)};
      const radarData = ${escapeJson(radarData)};
      const typeData = ${escapeJson(typeData)};

      // Cores para os gráficos
      const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
      const DOMAIN_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

      // Renderizar Pie Chart
      const pieRoot = document.getElementById('pie-chart-root');

      if (pieRoot && pieData.length > 0) {
        const PieApp = () => {
          const data = pieData;

          return React.createElement(
            ResponsiveContainer,
            { width: '100%', height: 260 },
            React.createElement(
              PieChart,
              {},
              React.createElement(
                Pie,
                {
                  data: data,
                  cx: '50%',
                  cy: '50%',
                  outerRadius: 90,
                  dataKey: 'value',
                  label: ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    if (percent < 0.03) {
                      return null;
                    }

                    return React.createElement(
                      'text',
                      {
                        x,
                        y,
                        fill: '#fff',
                        textAnchor: 'middle',
                        dominantBaseline: 'central',
                        fontSize: 10,
                        fontWeight: 'bold'
                      },
                      Math.round(percent * 100) + '%'
                    );
                  }
                },
                data.map((entry, index) =>
                  React.createElement(
                    Cell,
                    {
                      key: 'cell-' + index,
                      fill: entry.color
                    }
                  )
                )
              ),

              React.createElement(
                Legend,
                {
                  wrapperStyle: {
                    fontSize: '9px',
                    paddingTop: '4px'
                  },
                  iconSize: 8
                }
              ),

              React.createElement(
                Tooltip,
                {
                  contentStyle: {
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px'
                  },
                  formatter: (v) => [v, 'Controles']
                }
              )
            )
          );
        };

        ReactDOM
          .createRoot(pieRoot)
          .render(React.createElement(PieApp));
      }

      // Renderizar Bar Chart (Status)
      const barRoot = document.getElementById('bar-chart-root');

      if (barRoot && barData.length > 0) {
        const BarApp = () => {
          const data = barData;

          return React.createElement(
            ResponsiveContainer,
            { width: '100%', height: 260 },
            React.createElement(
              BarChart,
              {
                data: data,
                margin: {
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10
                }
              },

              React.createElement(
                CartesianGrid,
                {
                  strokeDasharray: '3 3',
                  stroke: '#e2e8f0'
                }
              ),

              React.createElement(
                XAxis,
                {
                  dataKey: 'name',
                  tick: {
                    fill: '#475569',
                    fontSize: 9
                  }
                }
              ),

              React.createElement(
                YAxis,
                {
                  tick: {
                    fill: '#94a3b8',
                    fontSize: 9
                  },
                  allowDecimals: false
                }
              ),

              React.createElement(
                Tooltip,
                {
                  contentStyle: {
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px'
                  },
                  formatter: (v) => [v, 'Controles']
                }
              ),

              React.createElement(
                Legend,
                {
                  wrapperStyle: {
                    fontSize: '9px'
                  },
                  iconSize: 8
                }
              ),

              React.createElement(
                Bar,
                {
                  dataKey: 'value',
                  name: 'Controles',
                  radius: [4, 4, 0, 0]
                },

                data.map((entry, index) =>
                  React.createElement(
                    Cell,
                    {
                      key: 'cell-' + index,
                      fill: entry.color
                    }
                  )
                )
              )
            )
          );
        };

        ReactDOM
          .createRoot(barRoot)
          .render(React.createElement(BarApp));
      }

      // Renderizar Bar Chart (Conceitos)
      const conceptBarRoot = document.getElementById('concept-bar-chart-root');

      if (conceptBarRoot && conceptData.length > 0) {
        const conceptBarData = conceptData.map((item, index) => ({
          name: item.name,
          value: item.total || 0,
          color: COLORS[index % COLORS.length]
        }));

        const ConceptBarApp = () => {
          return React.createElement(
            ResponsiveContainer,
            { width: '100%', height: 260 },
            React.createElement(
              BarChart,
              {
                data: conceptBarData,
                margin: {
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10
                }
              },

              React.createElement(
                CartesianGrid,
                {
                  strokeDasharray: '3 3',
                  stroke: '#e2e8f0'
                }
              ),

              React.createElement(
                XAxis,
                {
                  dataKey: 'name',
                  tick: {
                    fill: '#475569',
                    fontSize: 9
                  }
                }
              ),

              React.createElement(
                YAxis,
                {
                  tick: {
                    fill: '#94a3b8',
                    fontSize: 9
                  },
                  allowDecimals: false
                }
              ),

              React.createElement(
                Tooltip,
                {
                  contentStyle: {
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px'
                  },
                  formatter: (v) => [v, 'Controles']
                }
              ),

              React.createElement(
                Bar,
                {
                  dataKey: 'value',
                  name: 'Controles',
                  radius: [4, 4, 0, 0]
                },

                conceptBarData.map((entry, index) =>
                  React.createElement(
                    Cell,
                    {
                      key: 'cell-' + index,
                      fill: entry.color
                    }
                  )
                )
              )
            )
          );
        };

        ReactDOM
          .createRoot(conceptBarRoot)
          .render(React.createElement(ConceptBarApp));
      }

      // Renderizar Bar Chart (Domínios)
      const domainBarRoot = document.getElementById('domain-bar-chart-root');

      if (domainBarRoot && domainData.length > 0) {
        const domainBarData = domainData.map((item, index) => ({
          name: item.name,
          value: item.total || 0,
          color: DOMAIN_COLORS[index % DOMAIN_COLORS.length]
        }));

        const DomainBarApp = () => {
          return React.createElement(
            ResponsiveContainer,
            { width: '100%', height: 260 },
            React.createElement(
              BarChart,
              {
                data: domainBarData,
                margin: {
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10
                }
              },

              React.createElement(
                CartesianGrid,
                {
                  strokeDasharray: '3 3',
                  stroke: '#e2e8f0'
                }
              ),

              React.createElement(
                XAxis,
                {
                  dataKey: 'name',
                  tick: {
                    fill: '#475569',
                    fontSize: 9
                  }
                }
              ),

              React.createElement(
                YAxis,
                {
                  tick: {
                    fill: '#94a3b8',
                    fontSize: 9
                  },
                  allowDecimals: false
                }
              ),

              React.createElement(
                Tooltip,
                {
                  contentStyle: {
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px'
                  },
                  formatter: (v) => [v, 'Controles']
                }
              ),

              React.createElement(
                Bar,
                {
                  dataKey: 'value',
                  name: 'Controles',
                  radius: [4, 4, 0, 0]
                },

                domainBarData.map((entry, index) =>
                  React.createElement(
                    Cell,
                    {
                      key: 'cell-' + index,
                      fill: entry.color
                    }
                  )
                )
              )
            )
          );
        };

        ReactDOM
          .createRoot(domainBarRoot)
          .render(React.createElement(DomainBarApp));
      }

      // Renderizar Radar Chart
      const radarRoot = document.getElementById('radar-chart-root');

      if (
        radarRoot &&
        radarData.length > 0 &&
        radarData.some(d => d.Implementado > 0)
      ) {
        const radarChartData = radarData.map(item => ({
          subject: item.subject,
          Implementado: item.Implementado,
          Recomendado: 100
        }));

        const RadarApp = () => {
          return React.createElement(
            ResponsiveContainer,
            { width: '100%', height: 350 },
            React.createElement(
              RadarChart,
              {
                data: radarChartData,
                margin: {
                  top: 10,
                  right: 20,
                  bottom: 10,
                  left: 20
                }
              },

              React.createElement(
                PolarGrid,
                {
                  stroke: '#94a3b8'
                }
              ),

              React.createElement(
                PolarAngleAxis,
                {
                  dataKey: 'subject',
                  tick: {
                    fill: '#334155',
                    fontSize: 9,
                    fontWeight: 500
                  }
                }
              ),

              React.createElement(
                PolarRadiusAxis,
                {
                  angle: 90,
                  domain: [0, 100],
                  tick: {
                    fill: '#94a3b8',
                    fontSize: 8
                  }
                }
              ),

              React.createElement(
                Radar,
                {
                  name: 'Implementado',
                  dataKey: 'Implementado',
                  stroke: '#10b981',
                  fill: '#10b981',
                  fillOpacity: 0.15,
                  strokeWidth: 2
                }
              ),

              React.createElement(
                Radar,
                {
                  name: 'Recomendado',
                  dataKey: 'Recomendado',
                  stroke: '#94a3b8',
                  fill: '#94a3b8',
                  fillOpacity: 0.05,
                  strokeWidth: 1.5,
                  strokeDasharray: '6 4'
                }
              ),

              React.createElement(
                Legend,
                {
                  wrapperStyle: {
                    fontSize: '9px',
                    paddingTop: '4px'
                  },
                  iconSize: 8
                }
              ),

              React.createElement(
                Tooltip,
                {
                  contentStyle: {
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px'
                  },
                  formatter: (v) => [v + '%', '']
                }
              )
            )
          );
        };

        ReactDOM
          .createRoot(radarRoot)
          .render(React.createElement(RadarApp));
      }

      console.log('✅ Todos os gráficos foram renderizados!');
    })();
  </script>

</body>
</html>`;
  }
}


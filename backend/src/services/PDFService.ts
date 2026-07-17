// Puppeteer é ESM, usar importação dinâmica
type PuppeteerType = typeof import('puppeteer');
import { logger } from '../utils/logger.js';

interface PDFData {
  report: any;
  resultados: any;
  matrix: any[];
  roadmap: any;
  recomendacoes: any[];
  branding: any;
  user: {
    name: string;
    email: string;
  };
  companyName: string;
  generatedAt: string;
}

export class PDFService {
  /**
   * Gera o PDF do relatório usando Puppeteer
   */
  static async generateReportPDF(data: PDFData): Promise<Buffer> {
    const startTime = Date.now();
    let browser = null;

    try {
      // 🔴 CORREÇÃO: Detectar ambiente
      const isProduction = process.env.NODE_ENV === 'production';
      
      let puppeteer;
      let browserOptions;

      if (isProduction) {
        // 🔴 CORREÇÃO: Em produção, usar @sparticuz/chromium com puppeteer-core
        const chromium = await import('@sparticuz/chromium');
        const puppeteerCore = await import('puppeteer-core');
        puppeteer = puppeteerCore.default || puppeteerCore;
        
        browserOptions = {
          args: chromium.default.args,
          defaultViewport: chromium.default.defaultViewport,
          executablePath: await chromium.default.executablePath(),
          headless: chromium.default.headless,
        };
        
        logger.info('🔄 Usando Chromium do @sparticuz em produção');
      } else {
        // 🔴 CORREÇÃO: Em desenvolvimento, usar puppeteer normal
        const puppeteerModule = await import('puppeteer') as PuppeteerType;
        puppeteer = puppeteerModule.default || puppeteerModule;
        
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
        
        logger.info('🔄 Usando Puppeteer local em desenvolvimento');
      }

      // Inicializar o browser
      browser = await puppeteer.launch(browserOptions);

      const page = await browser.newPage();

      // Configurar a página
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });

      // Gerar o HTML do relatório
      const html = this.generateReportHTML(data);

      // 🔴 CORREÇÃO 1: waitUntil com tipo correto e mais robusto
      await page.setContent(html, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'] as any
      });

      // Aguardar renderização dos gráficos (Recharts) com timeout maior
      try {
        await page.waitForSelector('.recharts-wrapper', { timeout: 10000 });
        logger.info('✅ Gráficos Recharts encontrados, aguardando renderização...');
        
        // 🔴 CORREÇÃO 2: Espera mais tempo para renderizar gráficos
        await page.evaluate(() => {
          return new Promise((resolve) => {
            // Aguardar 2 segundos para garantir que os gráficos sejam renderizados
            setTimeout(resolve, 2000);
          });
        });

        // Verificar se os gráficos foram realmente renderizados
        const chartCount = await page.evaluate(() => {
          return document.querySelectorAll('.recharts-wrapper').length;
        });
        logger.info(`📊 ${chartCount} gráficos encontrados na página`);
      } catch (error) {
        logger.warn('⚠️ Nenhum gráfico Recharts encontrado, continuando...');
      }

      // Aguardar mais tempo para garantir que tudo foi renderizado
      await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      });

      // 🔴 CORREÇÃO 3: Ajustar margens para melhor aproveitamento da página
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '18mm',
          bottom: '15mm',
          left: '12mm',
          right: '12mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 8pt; color: #475569; border-bottom: 1px solid #e2e8f0; padding: 5mm 12mm; width: 100%; font-family: Arial, Helvetica, sans-serif;">
            <span style="float: left; font-weight: bold;">
              <span style="color: #2563eb;">Code</span><span style="color: #475569;">_Assessment</span>
            </span>
            <span style="float: right; color: #64748b; font-size: 7pt;">
              <strong>Emitido por:</strong> ${data.user.name || 'Consultor Técnico'} | ${data.user.email || ''}
            </span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 8pt; color: #64748b; border-top: 1px solid #e2e8f0; padding: 5mm 12mm; width: 100%; font-family: Arial, Helvetica, sans-serif;">
            <span style="float: left;">Sistema de Gestão de Conformidade e Segurança · MRS Consultoria</span>
            <span style="float: right;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
          </div>
        `,
        preferCSSPageSize: true,
        scale: 1,
        // 🔴 CORREÇÃO 5: Aumentar timeout para relatórios grandes
        timeout: 120000,
      });

      const endTime = Date.now();
      logger.info(`✅ PDF gerado com sucesso em ${endTime - startTime}ms (${pdf.length} bytes)`);

      return Buffer.from(pdf);

    } catch (error) {
      logger.error('❌ Erro ao gerar PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        logger.debug('🔒 Browser fechado');
      }
    }
  }

  /**
   * Gera o HTML do relatório para o PDF
   */
  private static generateReportHTML(data: PDFData): string {
    const { report, resultados, matrix, roadmap, recomendacoes, branding, user, companyName, generatedAt } = data;

    // Função para formatar data
    const formatDate = (date: string) => {
      if (!date) return 'Não disponível';
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    };

    const formatDateShort = (date: string) => {
      if (!date) return 'Não disponível';
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    // Função para renderizar a Matriz de Priorização
    const renderMatrix = () => {
      if (!matrix || matrix.length === 0) {
        return `<p style="text-align: center; color: #6b7280; padding: 20pt 0;">Nenhum dado disponível para a matriz de priorização.</p>`;
      }

      let tableRows = '';
      matrix.forEach((item, index) => {
        const priorityClass = item.priority === 'Crítico' ? 'bg-red-100' :
                           item.priority === 'Muito Alto' ? 'bg-orange-100' :
                           item.priority === 'Alto' ? 'bg-yellow-100' :
                           item.priority === 'Médio' ? 'bg-blue-100' :
                           item.priority === 'Baixo' ? 'bg-green-100' : 'bg-gray-100';

        const hasRecommendation = recomendacoes.some(r => r.controlId === item.controlId);

        tableRows += `
          <tr class="${priorityClass}">
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: left; color: #000000;">ISO 27001</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: center; color: #000000;">${item.refId || (index + 1)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: center; color: #000000;">${item.controlId}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: left; color: #000000;">${item.controlName || ''}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: center; color: #000000;">${item.maturity}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 6.5pt; text-align: left; color: #000000;">${item.scenario || ''}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 6.5pt; text-align: left; color: #000000;">${item.vulnerabilities || ''}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 6.5pt; text-align: left; color: #000000;">${hasRecommendation ? 'Ver soluções técnicas' : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: bold; color: #000000;">${item.probability}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: bold; color: #000000;">${item.impact}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: bold; color: #000000;">${item.riskScore}</td>
            <td style="border: 1px solid #cbd5e1; padding: 3pt 4pt; font-size: 6.5pt; text-align: center; font-weight: bold; color: #000000;">${item.priority}</td>
          </tr>
        `;
      });

      return `
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-top: 4pt;">
          <thead>
            <tr style="background-color: #eff6ff;">
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: left; font-weight: 600; color: #1d4ed8;">METODOLOGIA</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">ID REF.</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">ID Controle</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: left; font-weight: 600; color: #1d4ed8;">Controle</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">Maturidade</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: left; font-weight: 600; color: #1d4ed8;">Cenário identificado</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: left; font-weight: 600; color: #1d4ed8;">Vulnerabilidades</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: left; font-weight: 600; color: #1d4ed8;">Soluções técnicas</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">Prob.</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">Impacto</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">Classif.</th>
              <th style="border: 1px solid #93c5fd; padding: 3pt 4pt; font-size: 7pt; text-align: center; font-weight: 600; color: #1d4ed8;">Priorização</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;
    };

    // 🔴 CORREÇÃO: Tratar URL do logo para ser absoluta e com fallback
    const logoUrl = branding?.logo?.url || '';
    
    // 🔴 CORREÇÃO: Verificar se a URL é válida e tem protocolo
    let finalLogoUrl = logoUrl;
    if (finalLogoUrl && !finalLogoUrl.startsWith('http://') && !finalLogoUrl.startsWith('https://')) {
      // Se for URL relativa, construir URL absoluta com base no domínio
      const baseUrl = process.env.BASE_URL || 'https://cisatool.com.br';
      finalLogoUrl = `${baseUrl}${finalLogoUrl.startsWith('/') ? '' : '/'}${finalLogoUrl}`;
    }

    // 🔴 NOVA CORREÇÃO: Se estiver em produção, substituir o domínio para o Render
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && finalLogoUrl && finalLogoUrl.includes('cisatool.com.br')) {
      finalLogoUrl = finalLogoUrl.replace('cisatool.com.br', 'code-assessment-898z.onrender.com');
      logger.info(`🔄 URL da logo substituída para produção: ${finalLogoUrl}`);
    }
    
    // 🔴 CORREÇÃO: Se não tiver URL, usar fallback (texto)
    const logoHtml = finalLogoUrl ? 
      `<img src="${finalLogoUrl}" alt="MRS Consultoria" style="max-height: 100pt; width: auto;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 24pt; font-weight: bold; color: #2563eb;\\'>Code</span><span style=\\'font-size: 24pt; font-weight: bold; color: #475569;\\'>_Assessment</span>'" />` :
      '<span style="font-size: 24pt; font-weight: bold; color: #2563eb;">Code</span><span style="font-size: 24pt; font-weight: bold; color: #475569;">_Assessment</span>';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório - ${companyName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
          background: #ffffff;
          padding: 0;
          margin: 0;
        }

        .page {
          width: 100%;
          min-height: 100vh;
          padding: 20pt 15pt;
          page-break-after: always;
        }

        .page:last-child {
          page-break-after: auto;
        }

        h1 {
          font-size: 18pt;
          font-weight: bold;
          text-align: center;
          color: #0f172a;
          margin-bottom: 12pt;
        }

        h2 {
          font-size: 14pt;
          font-weight: bold;
          color: #1e3a8a;
          margin-top: 14pt;
          margin-bottom: 8pt;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4pt;
          page-break-after: avoid;
        }

        h3 {
          font-size: 12pt;
          font-weight: bold;
          color: #0f172a;
          margin-top: 12pt;
          margin-bottom: 6pt;
          page-break-after: avoid;
        }

        h4 {
          font-size: 11pt;
          font-weight: bold;
          color: #1e293b;
          margin-top: 10pt;
          margin-bottom: 4pt;
          page-break-after: avoid;
        }

        p {
          text-align: justify;
          margin: 4pt 0;
          line-height: 1.5;
        }

        .text-center {
          text-align: center !important;
        }

        .text-left {
          text-align: left !important;
        }

        .text-justify {
          text-align: justify !important;
        }

        .italic {
          font-style: italic;
        }

        .font-bold {
          font-weight: bold;
        }

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
        .bg-gray-200 { background-color: #e5e7eb; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-yellow-50 { background-color: #fffbeb; }
        .bg-green-50 { background-color: #f0fdf4; }
        .bg-red-100 { background-color: #fee2e2; }
        .bg-orange-100 { background-color: #ffedd5; }
        .bg-yellow-100 { background-color: #fef9c3; }
        .bg-blue-100 { background-color: #dbeafe; }
        .bg-green-100 { background-color: #d1fae5; }
        .bg-gray-100 { background-color: #f3f4f6; }

        .border { border: 1px solid #e5e7eb; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-blue-200 { border-color: #bfdbfe; }

        .rounded-lg { border-radius: 4pt; }
        .rounded-xl { border-radius: 6pt; }

        .p-3 { padding: 8pt; }
        .p-4 { padding: 10pt; }
        .p-6 { padding: 14pt; }
        .px-4 { padding-left: 10pt; padding-right: 10pt; }
        .px-5 { padding-left: 12pt; padding-right: 12pt; }
        .px-6 { padding-left: 14pt; padding-right: 14pt; }
        .py-6 { padding-top: 10pt; padding-bottom: 10pt; }

        .mt-3 { margin-top: 6pt; }
        .mt-4 { margin-top: 8pt; }
        .mt-6 { margin-top: 12pt; }
        .mb-2 { margin-bottom: 4pt; }
        .mb-3 { margin-bottom: 6pt; }
        .mb-4 { margin-bottom: 8pt; }
        .mb-6 { margin-bottom: 10pt; }

        .w-full { width: 100%; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 6pt 0;
          font-size: 9pt;
          page-break-inside: avoid;
        }

        th, td {
          border: 1px solid #cbd5e1;
          padding: 4pt 6pt;
          text-align: left;
          vertical-align: middle;
        }

        th {
          font-weight: bold;
          background-color: #f1f5f9;
          text-align: center;
        }

        .landscape-page {
          page: landscape-page;
        }

        .cover-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20pt 0;
        }

        .cover-page h1 {
          font-size: 20pt;
          border-bottom: none;
        }

        .cover-page p {
          text-align: center;
        }

        .cover-page .logo {
          margin-bottom: 16pt;
        }

        .cover-page .logo img {
          max-height: 100pt;
          width: auto;
        }

        .print-section {
          page-break-inside: avoid;
          margin-bottom: 6pt;
          padding-bottom: 4pt;
        }

        .page-break {
          page-break-before: always;
        }

        .page-break-avoid {
          page-break-inside: avoid;
        }

        .status-nao-implementado { color: #dc2626 !important; font-weight: bold; }
        .status-parcial { color: #d97706 !important; font-weight: bold; }
        .status-implementado { color: #16a34a !important; font-weight: bold; }

        ul, ol {
          padding-left: 1.25cm;
          margin: 4pt 0;
          text-align: justify;
        }

        li {
          text-align: justify;
          line-height: 1.5;
          margin-bottom: 2pt;
        }

        .badge {
          display: inline-block;
          padding: 1pt 6pt;
          border-radius: 10pt;
          font-size: 8pt;
          font-weight: bold;
        }

        .badge-gray { background-color: #9ca3af; color: #1f2937; }
        .badge-red { background-color: #dc2626; color: #ffffff; }
        .badge-yellow { background-color: #d97706; color: #ffffff; }
        .badge-green { background-color: #16a34a; color: #ffffff; }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8pt;
        }

        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8pt;
        }

        .recommendation-block {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4pt;
          padding: 10pt 14pt;
          margin-bottom: 8pt;
          page-break-inside: avoid;
        }

        .recommendation-block h4 {
          margin-top: 0;
        }

        .recommendation-block .status {
          font-size: 9pt;
          font-weight: bold;
        }

        .recommendation-block p {
          font-size: 9.5pt;
        }

        .recommendation-block ul {
          font-size: 9.5pt;
        }

        .recommendation-block li {
          font-size: 9.5pt;
        }

        /* 🔴 CORREÇÃO 7: Estilos para gráficos Recharts */
        .recharts-wrapper {
          max-width: 100% !important;
          margin: 0 auto !important;
          display: block !important;
        }

        .recharts-surface {
          width: 100% !important;
          max-width: 100% !important;
        }

        .recharts-text {
          fill: #334155 !important;
          font-size: 8pt !important;
        }

        .recharts-legend-item-text {
          font-size: 7pt !important;
        }

        .recharts-tooltip-wrapper {
          display: none !important;
        }

        /* 🔴 CORREÇÃO 8: Forçar cores de impressão */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>
    </head>
    <body>

      <!-- CAPA -->
      <div class="page cover-page">
        <div class="logo">
          ${logoHtml}
        </div>
        <h1>Consultoria para avaliação de maturidade ABNT NBR ISO 27001:2022</h1>
        <p style="font-weight: 500; font-size: 12pt; margin-top: 8pt;">Recomendações</p>
        <p style="font-size: 10pt; margin-top: 4pt; color: #6b7280;">${formatDate(generatedAt)}</p>
        <p style="font-size: 10pt; margin-top: 8pt; color: #6b7280; max-width: 80%; margin-left: auto; margin-right: auto;">
          ${report.projectNumber || 'Nº do projeto não definido'} - ${companyName} - ${report.scope || 'Escopo não definido'}
        </p>
      </div>

      <!-- QUEM SOMOS -->
      <div class="page print-section">
        <h2>Quem Somos</h2>
        <p class="italic">"O nosso negócio é segurança da informação, infraestrutura de TI, GRC e computação na nuvem"</p>
      </div>

      <!-- APRESENTAÇÃO -->
      <div class="page print-section">
        <h2>Apresentação</h2>
        <p>A MRS Consultoria, empresa especializada em soluções de segurança, e tecnologia da informação, apresenta relatório de maturidade referente à ABNT NBR ISO 27001:2022.</p>
        <p>Agradecemos esta oportunidade e nos colocamos a disposição para contribuir de forma plena com os objetivos e metas da <strong>${companyName}</strong>. Da mesma maneira, estamos à disposição para sanar quaisquer dúvidas decorrentes desta, ou em relação aos demais serviços oferecidos em nossas áreas de atuação que também podem ser obtidas por meio de nosso endereço virtual <a href="http://www.cisatool.com.br" style="color: #2563eb; text-decoration: none;">http://www.cisatool.com.br</a></p>
        <p class="italic" style="font-size: 10pt; color: #4b5563;">"O nosso negócio é segurança da informação, infraestrutura de TI, GRC e computação na nuvem"</p>
      </div>

      <!-- ÍNDICE -->
      <div class="page print-section">
        <h2>Índice</h2>
        <div class="grid-2" style="font-size: 10pt;">
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>1. Objetivo</span>
            <span style="color: #9ca3af;">2</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>2. Benefícios da ISO 27001</span>
            <span style="color: #9ca3af;">3</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>3. Equipe</span>
            <span style="color: #9ca3af;">4</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>4. Metodologia de Avaliação</span>
            <span style="color: #9ca3af;">5</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>5. Atributos</span>
            <span style="color: #9ca3af;">6</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>6. Recomendações</span>
            <span style="color: #9ca3af;">7</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>7. Resultados da Avaliação</span>
            <span style="color: #9ca3af;">8</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>8. Cenário atual e Recomendações</span>
            <span style="color: #9ca3af;">9</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>9. Matriz de Priorização</span>
            <span style="color: #9ca3af;">10</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #f3f4f6;">
            <span>10. Roadmap de Implementação</span>
            <span style="color: #9ca3af;">11</span>
          </div>
        </div>
      </div>

      <!-- OBJETIVO -->
      <div class="page print-section">
        <h2>1. Objetivo</h2>
        <p>Apresentar análises e resultados oriundos da avaliação de maturidade do ambiente da <strong>${companyName}</strong>, identificando lacunas que impactam na sua maturidade, propondo recomendações de melhorias técnicas e processuais que precisam ser implementadas para elevação do nível de segurança. Através deste documento, a empresa terá um material que auxiliará na melhoria contínua do SGSI – Sistema de Gestão de Segurança da Informação, visando otimizar a segurança da informação em seus processos, recursos e pessoas.</p>
        <p>Os trabalhos foram baseados nas entrevistas realizadas no período de <strong>${formatDate(report.assessmentStartDate)}</strong> a <strong>${formatDate(report.assessmentEndDate)}</strong>, bem como informações complementares recebidas por e-mail no dia <strong>${formatDate(report.assessmentEndDate)}</strong>. Após avaliação do ambiente, foram elaboradas recomendações do nível desejado para a organização, que poderão ser aplicadas aos diversos types de ameaças identificadas.</p>
        <p style="font-size: 10pt; color: #6b7280; font-style: italic;">Ressaltamos que não foram realizadas análises de evidências e que todos os insumos gerados neste documento são oriundos do questionário baseado nos controles da ABNT NBR ISO/IEC 27001:2022, Anexo A, respondido pela <strong>${companyName}</strong>.</p>
      </div>

      <!-- BENEFÍCIOS DA ISO 27001 -->
      <div class="page print-section">
        <h2>2. Benefícios da ISO 27001</h2>
        <p>A ABNT NBR ISO 27001 é uma norma internacional de padrão e referência para a gestão de segurança da informação na empresa. Por meio dela será desenvolvido um Sistema de Gestão de Segurança da Informação (SGSI) que permitirá à empresa ter um melhor conhecimento dos seus processos, activities, sistemas, ambientes e pessoas que possam impactar na segurança da informação, assim como os aprimoramentos sobre os processos de gestão permitindo uma melhoria contínua.</p>
        <p>Será possível identificar por meio da matriz de priorização, anexo deste documento, quais são as ameaças e vulnerabilidades identificadas relacionadas aos controles da ISO, classificando os controles de crítico até o mais baixo, relacionando as medidas tecnológicas e processuais para uma mitigação efetiva.</p>
        <p>Caso a <strong>${companyName}</strong> busque futuramente uma certificação nessa norma, a empresa terá uma maior credibilidade e confiabilidade na entrega dos serviços prestados, por utilizar a segurança da informação em todas as etapas do negócio, aumentando a satisfação dos seus clientes e parceiros comerciais, além de também ter uma expansão dos seus clientes e uma maior vantagem competitiva sobre as empresas concorrentes. Pela ISO 27001 ser uma norma internacionalmente reconhecida e adotada por vários países como uma garantia do uso da segurança da informação, é possível assegurar que a empresa estará em conformidade com as obrigações legais e contratuais relacionadas à segurança da informação.</p>
      </div>

      <!-- EQUIPE -->
      <div class="page print-section">
        <h2>3. Equipe</h2>

        <h3>${companyName}</h3>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Designação</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>
            ${report.clientTeam && report.clientTeam.length > 0 ? report.clientTeam.map((member: any) => `
              <tr>
                <td>${member.name}</td>
                <td>${member.role}</td>
                <td>${member.email}</td>
              </tr>
            `).join('') : '<tr><td colspan="3" style="text-align: center; color: #6b7280;">Nenhum membro cadastrado</td></tr>'}
          </tbody>
        </table>

        <h3>MRS Consultoria</h3>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Designação</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>
            ${report.consultantTeam && report.consultantTeam.length > 0 ? report.consultantTeam.map((member: any) => `
              <tr>
                <td>${member.name}</td>
                <td>${member.role}</td>
                <td>${member.email}</td>
              </tr>
            `).join('') : '<tr><td colspan="3" style="text-align: center; color: #6b7280;">Nenhum consultor vinculado</td></tr>'}
          </tbody>
        </table>

        ${(!report.consultantTeam || report.consultantTeam.length === 0) ? `
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4pt; padding: 10pt 14pt; margin-top: 8pt;">
            <p style="font-size: 10pt;"><strong>Nota sobre o processo de avaliação:</strong> Para esta avaliação, <strong>não foram contratadas horas de consultoria</strong>. O processo de preenchimento e validação das respostas foi realizado integralmente pela organização, por meio da solução <strong>Code_Assessment</strong>. A <strong>MRS Consultoria</strong> não atuou como consultora durante esta etapa, sendo as informações apresentadas de <strong>inteira responsabilidade do cliente</strong>.</p>
          </div>
        ` : ''}
      </div>

      <!-- METODOLOGIA DE AVALIAÇÃO -->
      <div class="page print-section">
        <h2>4. Metodologia de Avaliação</h2>
        <p>Com estrutura mais simples e controles contemporâneos, a ABNT NBR ISO/IEC 27002:2022, tem uma visão holística e coordenada dos riscos de segurança da informação das organizações (SGSI), a fim de determinar e implementar um conjunto abrangente de controles na estrutura geral de um sistema de gestão coerente. Deste modo, é possível direcionar a análise/avaliação de riscos, gerenciamento, especificação, reavaliação e implementação de segurança na <strong>${companyName}</strong>.</p>
        <p>É composta por 93 controles agrupados em 4 temas:</p>

        <div class="grid-2" style="margin-bottom: 8pt;">
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4pt; padding: 8pt 12pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #1e40af;">Controles Organizacionais</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Referentes a forma com qual organização estrutura ações estratégicas, relacionadas à Gestão da Segurança da Informação, com abrangência institucional ou perante partes externas. Aqui também se incluem todos os controles que não se encaixam nas demais categorias.</p>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4pt; padding: 8pt 12pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #166534;">Controles de Pessoas</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Referentes a pessoas individuais, como a organização aborda aspectos de Segurança da Informação, aliada à segurança jurídica, durante o ciclo de vida do colaborador na empresa.</p>
          </div>
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4pt; padding: 8pt 12pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #92400e;">Controles Físicos</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Aspectos de segurança física, predial e ambiental da organização que impactam direta ou indiretamente na Segurança da Informação.</p>
          </div>
          <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 4pt; padding: 8pt 12pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #6b21a8;">Controles Tecnológicos</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Referentes diretamente a tecnologia, ações e mechanisms de Segurança da Informação aplicados a recursos computacionais, sistemas e redes, repositório de dados, etc.</p>
          </div>
        </div>

        <h3>Níveis de Maturidade</h3>
        <p>A avaliação de maturidade é baseada nos níveis mostrados abaixo. Eles fornecem a descrição sobre as práticas que a empresa possui no que tange a existência de processos de Segurança da Informação.</p>

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">NÍVEL</th>
              <th style="width: 25%;">MATURIDADE</th>
              <th>DESCRIÇÃO</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #f9fafb;">
              <td style="text-align: center;">N/A</td>
              <td><span class="badge badge-gray">NÃO SE APLICA</span></td>
              <td>CONTROLE NÃO APLICÁVEL À ORGANIZAÇÃO</td>
            </tr>
            <tr style="background-color: #fef2f2;">
              <td style="text-align: center; font-weight: bold; color: #dc2626;">0</td>
              <td><span class="badge badge-red">NÃO IMPLEMENTADO</span></td>
              <td>FALTA DE UM PROCESSO RECONHECIDO.</td>
            </tr>
            <tr style="background-color: #fffbeb;">
              <td style="text-align: center; font-weight: bold; color: #d97706;">1</td>
              <td><span class="badge badge-yellow">PARCIAL</span></td>
              <td>JÁ ESTÁ EM APLICAÇÃO PARTES DOS CONTROLES NA INSTITUIÇÃO, MAS HÁ QUESTÕES QUE PRECISAM SER TRABALHADAS.</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
              <td style="text-align: center; font-weight: bold; color: #16a34a;">2</td>
              <td><span class="badge badge-green">IMPLEMENTADO</span></td>
              <td>OS PROCESSOS FORAM REFINADOS A UM NÍVEL DE BOAS PRÁTICAS, RESULTADO DE UM CONTÍNUO APRIMORAMENTO E MODELAGEM DA MATURIDADE EM ORGANIZAÇÃO E EM PROCESSOS.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ATRIBUTOS -->
      <div class="page print-section">
        <h2>5. Atributos</h2>
        <p>De forma complementar, a ABNT NBR ISO/IEC 27002:2022 possibilitou a análise dos controles à luz de 05 (cinco) atributos: 1) tipo de controle; 2) propriedades de segurança da informação; 3) conceitos de segurança cibernética; 4) capacidades operacionais; 5) domínios de segurança.</p>

        <h3>5.1 Tipo de Controle</h3>
        <p>Atributo utilizado para fornecer uma visão dos controles na perspectiva de quando e como uma medida altera o risco relacionado com a ocorrência de um incidente de segurança da informação. Assim, o controle poderá variar entre:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4pt; margin-bottom: 8pt;">
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #dbeafe; color: #1e40af; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Preventivo</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #fef9c3; color: #854d0e; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Detectivo</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #d1fae5; color: #065f46; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Corretivo</span>
        </div>

        <h3>5.2 Propriedades de Segurança da Informação</h3>
        <p>Atributo para visualizar controles na perspectiva de qual característica das informações o controle contribuirá para a preservação. Os valores dos atributos consistem em:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4pt; margin-bottom: 8pt;">
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #fecaca; color: #991b1b; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Confidencialidade</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #dbeafe; color: #1e40af; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Integridade</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #d1fae5; color: #065f46; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Disponibilidade</span>
        </div>

        <h3>5.3 Conceitos de Segurança Cibernética</h3>
        <p>Atributo para visualizar os controles sob a perspectiva da associação de controles aos conceitos de segurança cibernética definidos no quadro de segurança cibernética descrito no ISO/IEC TS 27110. Os valores dos atributos consistem em:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4pt; margin-bottom: 8pt;">
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #e0e7ff; color: #3730a3; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Identificar</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #dbeafe; color: #1e40af; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Proteger</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #fef9c3; color: #854d0e; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Detectar</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #ffedd5; color: #9a3412; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Responder</span>
          <span style="display: inline-block; padding: 2pt 8pt; background-color: #d1fae5; color: #065f46; border-radius: 12pt; font-size: 9pt; font-weight: 500;">Recuperar</span>
        </div>

        <h3>5.4 Capacidades Operacionais</h3>
        <p>As capacidades operacionais são atributos para visualizar controles da perspectiva do praticante sobre os recursos de segurança da informação. Os valores de atributos consistem em:</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4pt; margin-bottom: 8pt;">
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Governança, Gestão de identidade e acesso</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Gestão de ameaças e vulnerabilidades</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Garantia de segurança da informação</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Gestão de eventos de segurança da informação</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Gestão de ativos</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Proteção da informação</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Legal e compliance</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Segurança física</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Configuração segura</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Segurança em recursos humanos</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Segurança de sistemas e redes</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Segurança de aplicações</span>
          <span style="padding: 2pt 6pt; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; font-size: 9pt;">Segurança do relacionamento na cadeia de suprimentos</span>
        </div>

        <h3>5.5 Domínios de Segurança</h3>
        <p>Os domínios de segurança são um atributo para visualizar controles na perspectiva de 4 domínios de SI:</p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6pt;">
          <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 4pt; padding: 6pt 10pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #3730a3;">Governança e Ecossistema</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Inclui "Governança do System de Segurança da Informação e Gestão de Riscos" e "Gestão de segurança cibernética do ecossistema" (partes interessadas internas e externas).</p>
          </div>
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4pt; padding: 6pt 10pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #1e40af;">Proteção</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Inclui "Arquitetura de Segurança de TI", "Administração de Segurança de TI", "Gestão de identidade e acesso", "Manutenção de Segurança de TI" e "Segurança física e ambiental".</p>
          </div>
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4pt; padding: 6pt 10pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #92400e;">Defesa</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Inclui "Detectar" e "Gestão de Incidente de segurança computacional".</p>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4pt; padding: 6pt 10pt;">
            <div style="display: flex; align-items: center; gap: 4pt; margin-bottom: 2pt;">
              <span style="font-weight: 600; color: #166534;">Resiliência</span>
            </div>
            <p style="font-size: 9pt; color: #4b5563;">Inclui "Operações de continuidade" e "Gestão de crises".</p>
          </div>
        </div>
      </div>

      <!-- RECOMENDAÇÕES -->
      <div class="page print-section">
        <h2>6. Recomendações</h2>
        <p>As recomendações propostas neste relatório são oriundas da norma <strong>ISO/IEC 27002:2022</strong> que fornecem um conjunto abrangente de controles de segurança da informação comumente utilizados, incluindo orientação para implementação desses controles em uma organização.</p>
        <p>A norma <strong>ISO/IEC 27002:2022</strong> é complementar à norma <strong>ISO/IEC 27001</strong> e totalmente indispensável à sua aplicação. Enquanto a norma ISO/IEC 27001 estabelece os requisitos para implementação de um Sistema de Gestão da Segurança da Informação (SGSI), a norma fornece um conjunto de controles genéricos de segurança da informação, além da ISO/IEC 27002:2022 fornecer orientação para implementação de controles de segurança da informação.</p>
        <p>A norma <strong>ISO/IEC 27002:2022</strong> foi concebida para ser usada pelas organizações:</p>
        <ul>
          <li>no contexto de um sistema de gestão de segurança da informação (SGSI) baseado na ISO/IEC 27001;</li>
          <li>para a implementação de controles de segurança da informação com base em melhores práticas reconhecidas internacionalmente;</li>
          <li>para o desenvolvimento de diretrizes específicas de gestão de segurança da informação da organização.</li>
        </ul>
      </div>

      <!-- RESULTADOS DA AVALIAÇÃO -->
      <div class="page print-section landscape-page">
        <h2>7. Resultados da Avaliação</h2>

        <h3>7.1 Categorização dos controles</h3>
        <p>A análise dos controles e processos utilizados pela <strong>${companyName}</strong>, no que se refere a ISO 27001, permitiu identificar a média geral do Nível de Maturidade dos 93 controles, que estão claramente subdivididos e resumidos em 4 áreas temáticas: controles organizacionais, controle de pessoas, controles físicos e controles tecnológicos. O resultado exibido abaixo diz respeito ao <strong>percentual de controles efetivamente implementados</strong>.</p>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6pt; margin-bottom: 8pt;">
          ${resultados?.categorizacao?.categories?.map((cat: any) => `
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6pt; padding: 8pt; text-align: center;">
              <div style="font-size: 18pt; font-weight: bold; color: #1d4ed8;">${cat.pImpl}%</div>
              <p style="font-size: 9pt; font-weight: 500; color: #1e40af; margin-top: 2pt;">${cat.name}</p>
            </div>
          `).join('')}
        </div>

        <p>O quadro abaixo mostra o quantitativo de controles identificados em cada uma das 04 (quatro) categorizações da ISO 27001:2022, bem como a quantidade de controles que se encontram implementados, parcialmente implementados, não implementados e os que não se aplicam, mostrando uma visão geral das lacunas que foram encontradas na <strong>${companyName}</strong>.</p>

        <table style="font-size: 8pt;">
          <thead>
            <tr>
              <th>Categorização</th>
              <th style="text-align: center;">Total</th>
              <th style="text-align: center;">N/A</th>
              <th style="text-align: center;">Implementados</th>
              <th style="text-align: center;">Parciais</th>
              <th style="text-align: center;">Não Implementados</th>
            </tr>
          </thead>
          <tbody>
            ${resultados?.categorizacao?.categories?.map((cat: any) => `
              <tr>
                <td>${cat.name}</td>
                <td style="text-align: center; font-weight: bold;">${cat.total}</td>
                <td style="text-align: center;">${cat.na}</td>
                <td style="text-align: center; color: #059669; font-weight: bold;">${cat.implemented}</td>
                <td style="text-align: center; color: #d97706; font-weight: bold;">${cat.partial}</td>
                <td style="text-align: center; color: #dc2626; font-weight: bold;">${cat.notImpl}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #e5e7eb; font-weight: bold;">
              <td>Total</td>
              <td style="text-align: center;">${resultados?.categorizacao?.totals?.total || 0}</td>
              <td style="text-align: center;">${resultados?.categorizacao?.totals?.na || 0}</td>
              <td style="text-align: center; color: #059669;">${resultados?.categorizacao?.totals?.implemented || 0}</td>
              <td style="text-align: center; color: #d97706;">${resultados?.categorizacao?.totals?.partial || 0}</td>
              <td style="text-align: center; color: #dc2626;">${resultados?.categorizacao?.totals?.notImpl || 0}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 12pt;">7.2 Capacidades Operacionais</h3>
        <p>A capacidade operacional analisa os controles da perspectiva de seus recursos operacionais de segurança da informação e oferece suporte a uma visão prática dos controles pelo usuário.</p>

        ${resultados?.capacidades?.capabilities ? `
          <table style="font-size: 8pt;">
            <thead>
              <tr>
                <th>Capacidades Operacionais</th>
                <th style="text-align: center;">N/A</th>
                <th style="text-align: center;">Não Implementado</th>
                <th style="text-align: center;">Parcial</th>
                <th style="text-align: center;">Implementados</th>
              </tr>
            </thead>
            <tbody>
              ${resultados.capacidades.capabilities.map((cap: any) => `
                <tr>
                  <td>${cap.name}</td>
                  <td style="text-align: center;">0</td>
                  <td style="text-align: center; color: #dc2626; font-weight: bold;">${cap.notImpl}</td>
                  <td style="text-align: center; color: #d97706; font-weight: bold;">${cap.partial}</td>
                  <td style="text-align: center; color: #059669; font-weight: bold;">${cap.implemented}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                <td>Total</td>
                <td style="text-align: center;">0</td>
                <td style="text-align: center; color: #dc2626;">${resultados?.capacidades?.totals?.notImpl || 0}</td>
                <td style="text-align: center; color: #d97706;">${resultados?.capacidades?.totals?.partial || 0}</td>
                <td style="text-align: center; color: #059669; font-weight: bold;">${resultados?.capacidades?.totals?.implemented || 0}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4pt; padding: 8pt 12pt; margin-top: 6pt;">
            <p style="font-size: 9pt;"><strong>Legenda:</strong> O "Total" na linha de rodapé corresponde ao quantitativo total de <strong>capacidades operacionais</strong> aplicadas (ou não aplicáveis) para o total das 93 Categorias da ISO 27001:2022, considerando-se que um mesmo controle pode ter mais de uma capacidade operacional a ele atribuída.</p>
          </div>
        ` : ''}
      </div>

      <!-- CENÁRIO ATUAL E RECOMENDAÇÕES -->
      <div class="page print-section">
        <h2>8. Cenário atual e Recomendações</h2>

        ${recomendacoes && recomendacoes.length > 0 ? `
          ${['Controles organizacionais', 'Controles de pessoas', 'Controles físicos', 'Controles tecnológicos'].map(dominio => {
            const items = recomendacoes.filter((r: any) => {
              const statusLower = r.status?.toLowerCase() || '';
              const isNaoImpl = statusLower.includes('não') || statusLower.includes('nao');
              const isParcial = statusLower.includes('parcial');
              return r.dominio === dominio && (isNaoImpl || isParcial);
            });

            if (items.length === 0) return '';

            const dominioNumero = {
              'Controles organizacionais': '5',
              'Controles de pessoas': '6',
              'Controles físicos': '7',
              'Controles tecnológicos': '8',
            }[dominio] || '5';

            return `
              <div style="margin-bottom: 10pt;">
                <h3>${dominioNumero} – ${dominio}</h3>
                ${items.map((item: any) => {
                  const isNaoImpl = item.status?.toLowerCase().includes('não') || item.status?.toLowerCase().includes('nao');
                  const isParcial = item.status?.toLowerCase().includes('parcial');
                  const statusClass = isNaoImpl ? 'status-nao-implementado' : isParcial ? 'status-parcial' : '';

                  return `
                    <div class="recommendation-block">
                      <h4 style="font-size: 10.5pt; font-weight: bold; margin-bottom: 2pt;">${item.controlId} ${item.titulo || ''}</h4>
                      <div style="margin-bottom: 4pt;">
                        <span class="status ${statusClass}">${item.status}</span>
                      </div>
                      <div style="margin-bottom: 4pt;">
                        <p style="font-weight: 600; font-size: 9pt; margin-bottom: 2pt;">Cenário identificado</p>
                        <p style="font-size: 9pt;">${item.cenarioIdentificado || 'Cenário não descrito para este controle.'}</p>
                      </div>
                      <div style="margin-bottom: 4pt;">
                        <p style="font-weight: 600; font-size: 9pt; margin-bottom: 2pt;">Recomendações</p>
                        <ul style="font-size: 9pt;">
                          ${item.recomendacoes && item.recomendacoes.length > 0 ? item.recomendacoes.map((rec: string) => `<li>${rec}</li>`).join('') : '<li>Recomendação não cadastrada para este controle.</li>'}
                        </ul>
                      </div>
                      ${item.solucoesTecnicas && item.solucoesTecnicas.length > 0 ? `
                        <div>
                          <p style="font-weight: 600; font-size: 9pt; margin-bottom: 2pt;">Soluções técnicas de apoio</p>
                          <ul style="font-size: 9pt;">
                            ${item.solucoesTecnicas.map((sol: string) => `<li>${sol}</li>`).join('')}
                          </ul>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; padding: 8pt 12pt; margin-top: 6pt;">
            <p style="font-size: 9pt;"><strong>Legenda:</strong> Os controles listados acima são aqueles que foram avaliados como <strong>Parcialmente implementados</strong> ou <strong>Não implementados</strong>.</p>
          </div>
        ` : `
          <p style="text-align: center; color: #6b7280; padding: 20pt 0;">Nenhum controle com necessidade de atenção identificado.</p>
        `}
      </div>

      <!-- MATRIZ DE PRIORIZAÇÃO -->
      <div class="page print-section landscape-page">
        <h2>9. Matriz de Priorização</h2>
        <p style="font-size: 10pt;">Eventual plano de ação para adequação, em razão do resultado deste assessment, deve considerar estratégias de SI e esforços. Para subsidiar as decisões inerentes, elaboramos a <strong>${companyName}</strong> - Matriz de Priorização 27001:2022, documento anexo que contém sugestão de priorização, analisando-se probabilidade e impacto de riscos se materializarem perante das vulnerabilidades identificadas no ambiente da organização.</p>

        ${renderMatrix()}

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; padding: 8pt 12pt; margin-top: 8pt;">
          <p style="font-weight: 600; font-size: 9pt; margin-bottom: 4pt;">Nível de Priorização</p>
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4pt; font-size: 8pt;">
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 10pt; height: 10pt; background-color: #dc2626; border-radius: 2pt;"></span>
              <span>Crítico (9)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 10pt; height: 10pt; background-color: #f97316; border-radius: 2pt;"></span>
              <span>Muito Alto (8)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 10pt; height: 10pt; background-color: #eab308; border-radius: 2pt;"></span>
              <span>Alto (7)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 10pt; height: 10pt; background-color: #3b82f6; border-radius: 2pt;"></span>
              <span>Médio (6,5,4)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 10pt; height: 10pt; background-color: #22c55e; border-radius: 2pt;"></span>
              <span>Baixo (3,2,1)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 10pt; height: 10pt; background-color: #9ca3af; border-radius: 2pt;"></span>
              <span>Muito Baixo (0)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ROADMAP DE IMPLEMENTAÇÃO -->
      <div class="page print-section landscape-page">
        <h2>10. Roadmap de Implementação</h2>

        ${roadmap ? `
          <p style="font-size: 10pt;">O Roadmap de Implementação apresenta um conjunto estruturado de recomendações organizadas em três categorias principais: <strong>Medidas Processuais</strong>, <strong>Políticas</strong> e <strong>Soluções Técnicas</strong>, todas alinhadas com os controles da ISO 27001:2022 e organizadas por nível de priorização.</p>

          <p style="font-size: 9pt; color: #4b5563; margin-bottom: 8pt;"><strong>Resumo:</strong> Total de ${roadmap.summary?.totalItems || 0} itens distribuídos entre Crítico (${roadmap.summary?.byPriority?.critico || 0}), Muito Alto (${roadmap.summary?.byPriority?.muitoAlto || 0}), Alto (${roadmap.summary?.byPriority?.alto || 0}) e Médio (${roadmap.summary?.byPriority?.medio || 0}).</p>

          ${roadmap.sections?.processuais ? `
            <h3>10.1 ${roadmap.sections.processuais.title}</h3>
            <p style="font-size: 9pt; color: #4b5563; margin-bottom: 4pt;">${roadmap.sections.processuais.description}</p>
            <table style="font-size: 7.5pt;">
              <thead>
                <tr style="background-color: #eff6ff;">
                  <th style="font-size: 7pt;">#</th>
                  <th style="font-size: 7pt;">Medida Processual</th>
                  <th style="font-size: 7pt;">Descrição</th>
                  <th style="text-align: center; font-size: 7pt;">Prioridade</th>
                  <th style="text-align: center; font-size: 7pt;">Controles</th>
                </tr>
              </thead>
              <tbody>
                ${roadmap.sections.processuais.items.map((item: any, idx: number) => `
                  <tr>
                    <td style="text-align: center; font-size: 7pt;">${idx + 1}</td>
                    <td style="font-size: 7pt;">${item.name}</td>
                    <td style="font-size: 6.5pt;">${item.description || '-'}</td>
                    <td style="text-align: center; font-size: 7pt; font-weight: ${item.priority === 'Crítico' ? 'bold' : ''}; color: ${item.priority === 'Crítico' ? '#dc2626' : item.priority === 'Muito Alto' ? '#f97316' : item.priority === 'Alto' ? '#d97706' : '#3b82f6'};">${item.priority}</td>
                    <td style="text-align: center; font-size: 6.5pt;">${item.relatedControls?.length ? item.relatedControls.join(', ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${roadmap.sections?.politicas ? `
            <h3 style="margin-top: 10pt;">10.2 ${roadmap.sections.politicas.title}</h3>
            <p style="font-size: 9pt; color: #4b5563; margin-bottom: 4pt;">${roadmap.sections.politicas.description}</p>
            <table style="font-size: 7.5pt;">
              <thead>
                <tr style="background-color: #eff6ff;">
                  <th style="font-size: 7pt;">#</th>
                  <th style="font-size: 7pt;">Política</th>
                  <th style="font-size: 7pt;">Descrição</th>
                  <th style="text-align: center; font-size: 7pt;">Prioridade</th>
                  <th style="text-align: center; font-size: 7pt;">Controles</th>
                </tr>
              </thead>
              <tbody>
                ${roadmap.sections.politicas.items.map((item: any, idx: number) => `
                  <tr>
                    <td style="text-align: center; font-size: 7pt;">${idx + 1}</td>
                    <td style="font-size: 7pt;">${item.name}</td>
                    <td style="font-size: 6.5pt;">${item.description || '-'}</td>
                    <td style="text-align: center; font-size: 7pt; font-weight: ${item.priority === 'Crítico' ? 'bold' : ''}; color: ${item.priority === 'Crítico' ? '#dc2626' : item.priority === 'Muito Alto' ? '#f97316' : item.priority === 'Alto' ? '#d97706' : '#3b82f6'};">${item.priority}</td>
                    <td style="text-align: center; font-size: 6.5pt;">${item.relatedControls?.length ? item.relatedControls.join(', ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${roadmap.sections?.tecnicas ? `
            <h3 style="margin-top: 10pt;">10.3 ${roadmap.sections.tecnicas.title}</h3>
            <p style="font-size: 9pt; color: #4b5563; margin-bottom: 4pt;">${roadmap.sections.tecnicas.description}</p>
            <table style="font-size: 7.5pt;">
              <thead>
                <tr style="background-color: #eff6ff;">
                  <th style="font-size: 7pt;">#</th>
                  <th style="font-size: 7pt;">Solução Técnica</th>
                  <th style="font-size: 7pt;">Descrição</th>
                  <th style="text-align: center; font-size: 7pt;">Prioridade</th>
                  <th style="text-align: center; font-size: 7pt;">Controles</th>
                </tr>
              </thead>
              <tbody>
                ${roadmap.sections.tecnicas.items.map((item: any, idx: number) => `
                  <tr>
                    <td style="text-align: center; font-size: 7pt;">${idx + 1}</td>
                    <td style="font-size: 7pt;">${item.name}</td>
                    <td style="font-size: 6.5pt;">${item.description || '-'}</td>
                    <td style="text-align: center; font-size: 7pt; font-weight: ${item.priority === 'Crítico' ? 'bold' : ''}; color: ${item.priority === 'Crítico' ? '#dc2626' : item.priority === 'Muito Alto' ? '#f97316' : item.priority === 'Alto' ? '#d97706' : '#3b82f6'};">${item.priority}</td>
                    <td style="text-align: center; font-size: 6.5pt;">${item.relatedControls?.length ? item.relatedControls.join(', ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4pt; padding: 8pt 12pt; margin-top: 8pt;">
            <p style="font-size: 9pt;"><strong>Legenda:</strong> Os itens listados acima representam um conjunto de recomendações organizadas por nível de priorização, baseadas nos controles da ISO/IEC 27001:2022. A implementação deve seguir a ordem de criticidade para garantir a conformidade e a melhoria contínua da segurança da informação.</p>
          </div>
        ` : `
          <p style="text-align: center; color: #6b7280; padding: 20pt 0;">Carregando roadmap...</p>
        `}
      </div>

    </body>
    </html>
    `;
  }
}
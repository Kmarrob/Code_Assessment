// backend/src/services/DashboardPDFService.ts
// 🔴 CORRIGIDO: Ajusta CSS do PDF para centralizar gráficos e evitar corte

import { logger } from '../utils/logger.js';
import { ChartService } from './ChartService.js';

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

export class DashboardPDFService {
  /**
   * Gera o PDF do Dashboard de Maturidade usando imagens PNG
   */
  static async generateDashboardPDF(data: DashboardPDFData): Promise<Buffer> {
    const startTime = Date.now();
    let browser = null;

    try {
      const isProduction = process.env.NODE_ENV === 'production';
      let puppeteer;
      let browserOptions: any;

      logger.info('🔄 DashboardPDF: Gerando gráficos como imagens...');
      
      const pieChartImage = ChartService.generatePieChart([
        { name: 'Implementado', value: data.summary.Implementado || 0, color: '#10b981' },
        { name: 'Parcialmente implementado', value: data.summary.Parcialmente || 0, color: '#f59e0b' },
        { name: 'Não implementado', value: data.summary.NaoImplementado || 0, color: '#ef4444' },
        { name: 'Não se aplica', value: data.summary.NaoSeAplica || 0, color: '#94a3b8' },
      ] as Array<{ name: string; value: number; color: string }>);

      const barChartImage = ChartService.generateBarChart([
        { name: 'Implementados', value: data.summary.Implementado || 0, color: '#10b981' },
        { name: 'Parciais', value: data.summary.Parcialmente || 0, color: '#f59e0b' },
        { name: 'Não Implementados', value: data.summary.NaoImplementado || 0, color: '#ef4444' },
      ] as Array<{ name: string; value: number; color: string }>);

      const conceptBarData = Object.entries(data.byCyberConcept || {}).map(([key, value]: [string, any]) => ({
        name: key,
        value: value.total || 0,
        color: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][
          ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'].indexOf(key) % 5
        ] || '#6366f1',
      })).filter(d => d.value > 0) as Array<{ name: string; value: number; color: string }>;
      
      const conceptBarImage = ChartService.generateBarChart(conceptBarData);

      const domainBarData = Object.entries(data.byDomain || {}).map(([key, value]: [string, any]) => ({
        name: key,
        value: value.total || 0,
        color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'][
          ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'].indexOf(key) % 4
        ] || '#3b82f6',
      })).filter(d => d.value > 0) as Array<{ name: string; value: number; color: string }>;
      
      const domainBarImage = ChartService.generateBarChart(domainBarData);

      const radarData = Object.entries(data.byCapability || {}).map(([key, value]: [string, any]) => ({
        subject: key.length > 20 ? key.substring(0, 20) + '…' : key,
        Implementado: value.aderente || 0,
        Recomendado: 100,
      }));
      const radarChartImage = ChartService.generateRadarChart(radarData);

      const typePieImages: Record<string, string> = {};
      for (const type of ['Preventivo', 'Detectivo', 'Corretivo']) {
        const typeData = data.byType?.[type];
        if (typeData) {
          const detailData = [
            { name: 'Implementado', value: typeData.implemented || 0, color: '#10b981' },
            { name: 'Parcial', value: typeData.partial || 0, color: '#f59e0b' },
            { name: 'Não Implementado', value: typeData.notImpl || 0, color: '#ef4444' },
            { name: 'Não se aplica', value: typeData.na || 0, color: '#94a3b8' },
          ].filter(d => d.value > 0) as Array<{ name: string; value: number; color: string }>;
          
          if (detailData.length > 0) {
            const img = ChartService.generatePieChart(detailData);
            typePieImages[type] = img.toString('base64');
          }
        }
      }

      const conceptPieImages: Record<string, string> = {};
      for (const concept of ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar']) {
        const conceptData = data.byCyberConcept?.[concept];
        if (conceptData) {
          const detailData = [
            { name: 'Implementado', value: conceptData.implemented || 0, color: '#10b981' },
            { name: 'Parcial', value: conceptData.partial || 0, color: '#f59e0b' },
            { name: 'Não Implementado', value: conceptData.notImpl || 0, color: '#ef4444' },
            { name: 'Não se aplica', value: conceptData.na || 0, color: '#94a3b8' },
          ].filter(d => d.value > 0) as Array<{ name: string; value: number; color: string }>;
          
          if (detailData.length > 0) {
            const img = ChartService.generatePieChart(detailData, 300, 250);
            conceptPieImages[concept] = img.toString('base64');
          }
        }
      }

      const domainPieImages: Record<string, string> = {};
      for (const domain of ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção']) {
        const domainData = data.byDomain?.[domain];
        if (domainData) {
          const detailData = [
            { name: 'Implementado', value: domainData.implemented || 0, color: '#10b981' },
            { name: 'Parcial', value: domainData.partial || 0, color: '#f59e0b' },
            { name: 'Não Implementado', value: domainData.notImpl || 0, color: '#ef4444' },
            { name: 'Não se aplica', value: domainData.na || 0, color: '#94a3b8' },
          ].filter(d => d.value > 0) as Array<{ name: string; value: number; color: string }>;
          
          if (detailData.length > 0) {
            const img = ChartService.generatePieChart(detailData, 300, 250);
            domainPieImages[domain] = img.toString('base64');
          }
        }
      }

      const pieBase64 = pieChartImage.toString('base64');
      const barBase64 = barChartImage.toString('base64');
      const conceptBarBase64 = conceptBarImage.toString('base64');
      const domainBarBase64 = domainBarImage.toString('base64');
      const radarBase64 = radarChartImage.toString('base64');

      const html = this.generateHTML(
        data,
        pieBase64,
        barBase64,
        conceptBarBase64,
        domainBarBase64,
        radarBase64,
        typePieImages,
        conceptPieImages,
        domainPieImages
      );

      if (isProduction) {
        const chromiumModule = await import('@sparticuz/chromium');
        const chromium = chromiumModule.default || chromiumModule;
        const puppeteerCore = await import('puppeteer-core');
        puppeteer = puppeteerCore.default || puppeteerCore;
        
        browserOptions = {
          args: [
            ...(chromium.args || []),
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
          executablePath: await chromium.executablePath(),
          headless: true,
        };
        logger.info('🔄 DashboardPDF: Usando Chromium do @sparticuz em produção');
      } else {
        const puppeteerModule = await import('puppeteer');
        puppeteer = puppeteerModule.default || puppeteerModule;
        
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        browserOptions = {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
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
        deviceScaleFactor: 1.5,
      });

      await page.setContent(html, {
        waitUntil: ['load', 'domcontentloaded'] as any,
        timeout: 30000,
      });

      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

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
        timeout: 60000,
      });

      const endTime = Date.now();
      logger.info(`✅ DashboardPDF gerado em ${endTime - startTime}ms (${pdf.length} bytes)`);

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
   * Gera HTML COMPLETO (MANTENDO TODA A ESTRUTURA ORIGINAL)
   */
  private static generateHTML(
    data: DashboardPDFData,
    pieBase64: string,
    barBase64: string,
    conceptBarBase64: string,
    domainBarBase64: string,
    radarBase64: string,
    typePieImages: Record<string, string>,
    conceptPieImages: Record<string, string>,
    domainPieImages: Record<string, string>
  ): string {
    const { company, summary, byDomain, byCategory, byType, byCyberConcept, byCapability, user, generatedAt } = data;

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

    const pieData = [
      { name: 'Implementado', value: summary.Implementado || 0, color: '#10b981' },
      { name: 'Parcialmente implementado', value: summary.Parcialmente || 0, color: '#f59e0b' },
      { name: 'Não implementado', value: summary.NaoImplementado || 0, color: '#ef4444' },
      { name: 'Não se aplica', value: summary.NaoSeAplica || 0, color: '#94a3b8' },
    ].filter(d => d.value > 0);

    const barData = [
      { name: 'Implementados', value: summary.Implementado || 0, color: '#10b981' },
      { name: 'Parciais', value: summary.Parcialmente || 0, color: '#f59e0b' },
      { name: 'Não Implementados', value: summary.NaoImplementado || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const typeData = (() => {
      if (!data?.byType) return [];
      const types = ['Preventivo', 'Detectivo', 'Corretivo'];
      const colors = ['#6366f1', '#8b5cf6', '#a855f7'];
      return types.map((type, index) => {
        const typeData = data.byType?.[type];
        return {
          name: type,
          total: typeData?.total || 0,
          implemented: typeData?.implemented || 0,
          partial: typeData?.partial || 0,
          notImpl: typeData?.notImpl || 0,
          na: typeData?.na || 0,
          color: colors[index % colors.length],
          pImpl: typeData?.total > 0 ? Math.round((typeData.implemented / typeData.total) * 100) : 0,
          pPartial: typeData?.total > 0 ? Math.round((typeData.partial / typeData.total) * 100) : 0,
          pNot: typeData?.total > 0 ? Math.round((typeData.notImpl / typeData.total) * 100) : 0,
        };
      });
    })();

    const conceptData = (() => {
      if (!data?.byCyberConcept) return [];
      const concepts = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
      const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
      return concepts.map((concept, index) => {
        const conceptData = data.byCyberConcept?.[concept];
        return {
          name: concept,
          total: conceptData?.total || 0,
          implemented: conceptData?.implemented || 0,
          partial: conceptData?.partial || 0,
          notImpl: conceptData?.notImpl || 0,
          na: conceptData?.na || 0,
          color: colors[index % colors.length],
          pImpl: conceptData?.total > 0 ? Math.round((conceptData.implemented / conceptData.total) * 100) : 0,
          pPartial: conceptData?.total > 0 ? Math.round((conceptData.partial / conceptData.total) * 100) : 0,
          pNot: conceptData?.total > 0 ? Math.round((conceptData.notImpl / conceptData.total) * 100) : 0,
        };
      });
    })();

    const capabilityData = (() => {
      if (!data?.byCapability) return [];
      const capabilities = [
        { key: 'Governança', label: 'Governança' },
        { key: 'Gestão de ativos', label: 'Gestão de ativos' },
        { key: 'Proteção da informação', label: 'Proteção da informação' },
        { key: 'Gestão de identidade e acesso', label: 'Gestão de identidade e acesso' },
        { key: 'Segurança nas relações com fornecedores', label: 'Relações com fornecedores' },
        { key: 'Gestão de evento de segurança da informação', label: 'Eventos de SI' },
        { key: 'Gestão de ameaças e vulnerabilidades', label: 'Ameaças e vulnerabilidades' },
        { key: 'Gestão de continuidade do negócio', label: 'Continuidade' },
        { key: 'Segurança física', label: 'Segurança física' },
        { key: 'Desenvolvimento seguro', label: 'Desenvolvimento seguro' },
        { key: 'Gestão de redes', label: 'Gestão de redes' },
        { key: 'Monitoramento e análise', label: 'Monitoramento e análise' },
        { key: 'Gestão de pessoas', label: 'Gestão de pessoas' },
        { key: 'Gestão de criptografia', label: 'Criptografia' },
        { key: 'Garantia de segurança da informação', label: 'Garantia de SI' },
      ];
      return capabilities.map(cap => {
        const capData = data.byCapability?.[cap.key];
        return {
          name: cap.label,
          key: cap.key,
          total: capData?.total || 0,
          implemented: capData?.implemented || 0,
          partial: capData?.partial || 0,
          notImpl: capData?.notImpl || 0,
          na: capData?.na || 0,
          aderente: capData?.aderente || 0,
        };
      });
    })();

    const domainData = (() => {
      if (!data?.byDomain) return [];
      const domains = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
      return domains.map((domain, index) => {
        const domainData = data.byDomain?.[domain];
        return {
          name: domain,
          total: domainData?.total || 0,
          implemented: domainData?.implemented || 0,
          partial: domainData?.partial || 0,
          notImpl: domainData?.notImpl || 0,
          na: domainData?.na || 0,
          color: colors[index % colors.length],
          pImpl: domainData?.total > 0 ? Math.round((domainData.implemented / domainData.total) * 100) : 0,
          pPartial: domainData?.total > 0 ? Math.round((domainData.partial / domainData.total) * 100) : 0,
          pNot: domainData?.total > 0 ? Math.round((domainData.notImpl / domainData.total) * 100) : 0,
        };
      });
    })();

    const categoryData = (() => {
      if (!data?.byCategory) return [];
      const categories = [
        { key: 'Controles Organizacionais', label: 'Organizacionais' },
        { key: 'Controles de Pessoas', label: 'Pessoas' },
        { key: 'Controles Físicos', label: 'Físicos' },
        { key: 'Controles Tecnológicos', label: 'Tecnológicos' },
      ];
      return categories.map(cat => {
        const catData = data.byCategory?.[cat.key];
        return {
          name: cat.label,
          key: cat.key,
          total: catData?.total || 0,
          implemented: catData?.implemented || 0,
          partial: catData?.partial || 0,
          notImpl: catData?.notImpl || 0,
          na: catData?.na || 0,
        };
      });
    })();

    const typePieData = (() => {
      if (!data?.byType) return [];
      const types = ['Preventivo', 'Detectivo', 'Corretivo'];
      const colors = ['#6366f1', '#8b5cf6', '#a855f7'];
      return types.map((type, index) => {
        const typeData = data.byType?.[type];
        return {
          name: type,
          value: typeData?.total || 0,
          color: colors[index % colors.length],
        };
      }).filter(d => d.value > 0);
    })();

    const conceptBarData = Object.entries(byCyberConcept || {}).map(([key, value]: [string, any]) => ({
      name: key,
      value: value.total || 0,
      color: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][
        ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'].indexOf(key) % 5
      ] || '#6366f1',
    })).filter(d => d.value > 0);

    const domainBarData = Object.entries(byDomain || {}).map(([key, value]: [string, any]) => ({
      name: key,
      value: value.total || 0,
      color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'][
        ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'].indexOf(key) % 4
      ] || '#3b82f6',
    })).filter(d => d.value > 0);

    const radarData = (() => {
      if (!data?.byCapability) return [];
      const capabilities = [
        { key: 'Governança', label: 'Governança' },
        { key: 'Gestão de ativos', label: 'Gestão de ativos' },
        { key: 'Proteção da informação', label: 'Proteção da informação' },
        { key: 'Gestão de identidade e acesso', label: 'Gestão de identidade e acesso' },
        { key: 'Segurança nas relações com fornecedores', label: 'Relações com fornecedores' },
        { key: 'Gestão de evento de segurança da informação', label: 'Eventos de SI' },
        { key: 'Gestão de ameaças e vulnerabilidades', label: 'Ameaças e vulnerabilidades' },
        { key: 'Gestão de continuidade do negócio', label: 'Continuidade' },
        { key: 'Segurança física', label: 'Segurança física' },
        { key: 'Desenvolvimento seguro', label: 'Desenvolvimento seguro' },
        { key: 'Gestão de redes', label: 'Gestão de redes' },
        { key: 'Monitoramento e análise', label: 'Monitoramento e análise' },
        { key: 'Gestão de pessoas', label: 'Gestão de pessoas' },
        { key: 'Gestão de criptografia', label: 'Criptografia' },
        { key: 'Garantia de segurança da informação', label: 'Garantia de SI' },
      ];
      return capabilities.map(cap => {
        const capData = data.byCapability?.[cap.key];
        const aderente = capData?.aderente || 0;
        return {
          subject: cap.label.length > 20 ? cap.label.substring(0, 20) + '…' : cap.label,
          fullLabel: cap.label,
          Implementado: aderente,
          Recomendado: 100,
        };
      });
    })();

    const totalTypes = typeData.reduce((acc, t) => acc + t.total, 0);
    const totalConcepts = conceptData.reduce((acc, c) => acc + c.total, 0);
    const totalDomains = domainData.reduce((acc, d) => acc + d.total, 0);
    const totalCapabilities = capabilityData.reduce((acc, c) => acc + c.total, 0);
    const totalCategories = categoryData.reduce((acc, c) => acc + c.total, 0);

    const capabilityColumns = [
      { key: 'name', label: 'Capacidade' },
      { key: 'implemented', label: '✅ Imp.', align: 'center' as const },
      { key: 'partial', label: '🔄 Parc.', align: 'center' as const },
      { key: 'notImpl', label: '❌ N.I.', align: 'center' as const },
      { key: 'total', label: 'Total', align: 'center' as const },
      { 
        key: 'aderente', 
        label: 'Aderência', 
        align: 'center' as const,
        format: (v: number) => {
          const color = v >= 70 ? '#059669' : v >= 40 ? '#d97706' : '#dc2626';
          return `<span style="font-weight: bold; color: ${color};">${v}%</span>`;
        }
      },
    ];

    const userName = user?.name || 'Usuário não identificado';
    const userEmail = user?.email || 'email@nao.informado';
    const printDate = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard de Maturidade - ${company.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #1e293b; background: #ffffff; padding: 0; margin: 0; }
    .page { width: 100%; min-height: 100vh; padding: 15pt 12pt; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    
    h1 { font-size: 18pt; font-weight: bold; color: #0f172a; text-align: center; margin-bottom: 8pt; }
    h2 { font-size: 14pt; font-weight: bold; color: #1e3a8a; margin-top: 10pt; margin-bottom: 6pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 3pt; }
    h3 { font-size: 11pt; font-weight: bold; color: #0f172a; margin-top: 8pt; margin-bottom: 4pt; }
    p { text-align: justify; margin: 3pt 0; line-height: 1.4; font-size: 9pt; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
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
    
    .border { border: 1px solid #e5e7eb; }
    .border-b { border-bottom: 1px solid #e5e7eb; }
    .border-gray-200 { border-color: #e5e7eb; }
    .rounded-lg { border-radius: 4pt; }
    
    .p-3 { padding: 6pt; }
    .p-4 { padding: 8pt; }
    .p-6 { padding: 12pt; }
    .px-3 { padding-left: 6pt; padding-right: 6pt; }
    .px-4 { padding-left: 8pt; padding-right: 8pt; }
    .py-2 { padding-top: 4pt; padding-bottom: 4pt; }
    .py-3 { padding-top: 6pt; padding-bottom: 6pt; }
    
    .mt-2 { margin-top: 4pt; }
    .mt-3 { margin-top: 6pt; }
    .mt-4 { margin-top: 8pt; }
    .mb-2 { margin-bottom: 4pt; }
    .mb-3 { margin-bottom: 6pt; }
    .mb-4 { margin-bottom: 8pt; }
    
    .w-full { width: 100%; }
    .w-50 { width: 50%; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; align-items: start; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6pt; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6pt; }
    .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4pt; }
    
    table { width: 100%; border-collapse: collapse; font-size: 8pt; margin: 4pt 0; page-break-inside: avoid; }
    th, td { border: 1px solid #cbd5e1; padding: 3pt 4pt; text-align: left; vertical-align: middle; }
    th { font-weight: bold; background-color: #f1f5f9; text-align: center; }
    
    .badge { display: inline-block; padding: 1pt 6pt; border-radius: 8pt; font-size: 7pt; font-weight: bold; color: #ffffff; }
    .badge-green { background-color: #10b981; }
    .badge-yellow { background-color: #f59e0b; }
    .badge-red { background-color: #ef4444; }
    .badge-gray { background-color: #94a3b8; }
    
    .metric-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt 8pt; text-align: center; }
    .metric-card .value { font-size: 18pt; font-weight: bold; }
    .metric-card .label { font-size: 8pt; color: #64748b; }
    
    .progress-bar { width: 100%; height: 6pt; background-color: #e2e8f0; border-radius: 3pt; overflow: hidden; margin-top: 2pt; }
    .progress-bar .fill { height: 100%; border-radius: 3pt; transition: width 0.5s; }
    
    .section-break { page-break-before: always; }
    .page-break-avoid { page-break-inside: avoid; }
    
    .chart-img { 
      max-width: 100%; 
      height: auto; 
      display: block; 
      margin: 0 auto;
    }
    .chart-container { 
      text-align: center; 
      margin: 8pt 0;
      padding: 4pt;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .chart-title { font-size: 9pt; font-weight: bold; color: #475569; margin-bottom: 4pt; }
    .chart-subtitle { font-size: 7pt; color: #94a3b8; margin-bottom: 6pt; }
    
    .radar-container { 
      max-width: 500px; 
      margin: 0 auto;
      padding: 4pt;
    }
    
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    
    .cover-page { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .cover-page h1 { font-size: 24pt; border-bottom: none; }
    .cover-page .subtitle { font-size: 14pt; color: #475569; margin-top: 4pt; }
    .cover-page .company-name { font-size: 20pt; font-weight: 600; color: #2563eb; margin-top: 12pt; padding: 6pt 24pt; border-top: 2px solid #2563eb; border-bottom: 2px solid #2563eb; }
    .cover-page .meta-info { font-size: 10pt; color: #64748b; margin-top: 16pt; line-height: 1.8; }
    .cover-page .footer-text { font-size: 8pt; color: #94a3b8; margin-top: 24pt; border-top: 1px solid #e2e8f0; padding-top: 8pt; width: 60%; }
    
    .print-only { display: block; }
    .screen-only { display: none; }
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
      <div><strong>Responsável:</strong> ${userName}</div>
      <div><strong>E-mail:</strong> ${userEmail}</div>
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
        <div class="value" style="color: #2563eb;">${summary.totalControls}</div>
        <div class="label">Total Controles</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: #10b981;">${summary.Implementado}</div>
        <div class="label">Implementados</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: #f59e0b;">${summary.Parcialmente}</div>
        <div class="label">Parciais</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: #ef4444;">${summary.NaoImplementado}</div>
        <div class="label">Não Implementados</div>
      </div>
      <div class="metric-card">
        <div class="value" style="color: #2563eb;">${completionRate}%</div>
        <div class="label">Taxa de Conclusão</div>
      </div>
    </div>

    <div class="grid-2">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 8pt; text-align: center;">
        <p style="font-size: 9pt; font-weight: bold; color: #475569;">Distribuição de Status</p>
        ${pieData.map(d => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 2pt 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 4pt;">
              <span style="display: inline-block; width: 8pt; height: 8pt; border-radius: 50%; background-color: ${d.color};"></span>
              <span style="font-size: 8pt;">${d.name}</span>
            </div>
            <span style="font-size: 8pt; font-weight: bold;">${d.value}</span>
          </div>
        `).join('')}
        <div style="margin-top: 4pt; padding-top: 4pt; border-top: 1px solid #e2e8f0;">
          <span style="font-size: 8pt; color: #64748b;">Total: ${summary.totalControls} controles</span>
        </div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 8pt;">
        <p style="font-size: 9pt; font-weight: bold; color: #475569; text-align: center;">Taxa de Conclusão</p>
        <div style="text-align: center; margin: 4pt 0;">
          <span style="font-size: 28pt; font-weight: bold; color: ${completionRate >= 67 ? '#10b981' : completionRate >= 34 ? '#f59e0b' : '#ef4444'};">${completionRate}%</span>
        </div>
        <div class="progress-bar">
          <div class="fill" style="width: ${completionRate}%; background-color: ${completionRate >= 67 ? '#10b981' : completionRate >= 34 ? '#f59e0b' : '#ef4444'};"></div>
        </div>
        <p style="font-size: 7pt; color: #94a3b8; text-align: center; margin-top: 2pt;">
          ${summary.Implementado} de ${summary.totalControls} controles implementados
        </p>
      </div>
    </div>

    <!-- GRÁFICOS COMO IMAGENS -->
    <div class="grid-2" style="margin-top: 8pt;">
      <div class="chart-container">
        <p class="chart-title">Distribuição de Status</p>
        <p class="chart-subtitle">${summary.totalControls} controles analisados</p>
        <img src="data:image/png;base64,${pieBase64}" class="chart-img" alt="Distribuição de Status" />
      </div>
      <div class="chart-container">
        <p class="chart-title">Contagem por Status</p>
        <p class="chart-subtitle">Distribuição dos controles por nível de implementação</p>
        <img src="data:image/png;base64,${barBase64}" class="chart-img" alt="Contagem por Status" />
      </div>
    </div>
  </div>

  <!-- SEÇÃO 2: CATEGORIZAÇÃO -->
  ${totalCategories > 0 ? `
  <div class="page section-break">
    <h2>2. Categorização</h2>
    <p class="text-gray-600 text-sm mb-4">Distribuição por categoria</p>
    <div class="grid-4">
      ${categoryData.map((cat) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; color: #1e293b;">${cat.total}</div>
          <div style="font-size: 7pt; color: #64748b;">${cat.name}</div>
          <div style="display: flex; justify-content: center; gap: 4pt; margin-top: 2pt;">
            <span style="font-size: 6pt; color: #10b981;">✅ ${cat.implemented}</span>
            <span style="font-size: 6pt; color: #f59e0b;">🔄 ${cat.partial}</span>
            <span style="font-size: 6pt; color: #ef4444;">❌ ${cat.notImpl}</span>
          </div>
          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0}%; background-color: #8b5cf6;"></div>
          </div>
          <div style="font-size: 6pt; color: #94a3b8; margin-top: 1pt;">${cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0}%</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 3: TIPOS DE CONTROLE -->
  ${totalTypes > 0 ? `
  <div class="page section-break">
    <h2>3. Tipos de Controle</h2>
    <p class="text-gray-600 text-sm mb-4">${totalTypes} controles analisados</p>
    
    <div class="chart-container" style="margin-bottom: 8pt;">
      <p class="chart-title">Distribuição por Tipo de Controle</p>
      <p class="chart-subtitle">Preventivo, Detectivo e Corretivo</p>
      <img src="data:image/png;base64,${ChartService.generatePieChart(typePieData as Array<{ name: string; value: number; color: string }>).toString('base64')}" class="chart-img" alt="Tipos de Controle" />
    </div>

    <div class="grid-3">
      ${typeData.map((type) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; color: #1e293b;">${type.total}</div>
          <div style="font-size: 7pt; color: #64748b;">${type.name}</div>
          <div style="display: flex; justify-content: center; gap: 4pt; margin-top: 2pt;">
            <span style="font-size: 6pt; color: #10b981;">✅ ${type.implemented}</span>
            <span style="font-size: 6pt; color: #f59e0b;">🔄 ${type.partial}</span>
            <span style="font-size: 6pt; color: #ef4444;">❌ ${type.notImpl}</span>
          </div>
          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${type.pImpl}%; background-color: ${type.color};"></div>
          </div>
          <div style="font-size: 6pt; font-weight: bold; margin-top: 1pt; color: ${type.color};">${type.pImpl}%</div>
        </div>
      `).join('')}
    </div>

    <div class="grid-3" style="margin-top: 8pt;">
      ${typeData.map((type) => {
        const img = typePieImages[type.name];
        if (!img) return '';
        return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
            <h4 style="font-size: 9pt; font-weight: bold; color: #1e293b; margin-bottom: 4pt;">${type.name}</h4>
            <p style="font-size: 7pt; color: #64748b; margin-bottom: 4pt;">${type.total} controles</p>
            <img src="data:image/png;base64,${img}" style="width: 100%; max-width: 250px; height: auto; margin: 0 auto; display: block;" alt="${type.name}" />
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 4: CONCEITOS CIBERNÉTICOS -->
  ${totalConcepts > 0 ? `
  <div class="page section-break">
    <h2>4. Conceitos Cibernéticos</h2>
    <p class="text-gray-600 text-sm mb-4">${totalConcepts} controles analisados</p>

    <div class="chart-container" style="margin-bottom: 8pt;">
      <p class="chart-title">Distribuição por Conceito Cibernético</p>
      <p class="chart-subtitle">Identificar, Proteger, Detectar, Responder, Restaurar</p>
      <img src="data:image/png;base64,${conceptBarBase64}" class="chart-img" alt="Conceitos Cibernéticos" />
    </div>

    <div class="grid-5">
      ${conceptData.map((concept) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 8pt; font-weight: 600; color: #475569;">${concept.name}</div>
          <div style="font-size: 14pt; font-weight: bold; color: ${concept.implemented > 0 ? '#10b981' : '#94a3b8'};">${concept.implemented}</div>
          <div style="font-size: 6pt; color: #94a3b8;">de ${concept.total}</div>
          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${concept.pImpl}%; background-color: ${concept.color};"></div>
          </div>
          <div style="font-size: 6pt; font-weight: bold; margin-top: 1pt; color: ${concept.color};">${concept.pImpl}%</div>
        </div>
      `).join('')}
    </div>

    <div class="grid-5" style="margin-top: 8pt;">
      ${conceptData.map((concept) => {
        const img = conceptPieImages[concept.name];
        if (!img) return '';
        return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 4pt; text-align: center;">
            <h4 style="font-size: 7pt; font-weight: bold; color: #1e293b; margin-bottom: 2pt;">${concept.name}</h4>
            <img src="data:image/png;base64,${img}" style="width: 100%; max-width: 180px; height: auto; margin: 0 auto; display: block;" alt="${concept.name}" />
          </div>
        `;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 5: CAPACIDADES OPERACIONAIS -->
  ${totalCapabilities > 0 ? `
  <div class="page section-break">
    <h2>5. Capacidades Operacionais</h2>
    <p class="text-gray-600 text-sm mb-4">${totalCapabilities} controles analisados</p>
    
    <div class="radar-container" style="margin-bottom: 8pt;">
      <div class="chart-container">
        <p class="chart-title">Radar de Capacidades Operacionais</p>
        <p class="chart-subtitle">Comparação entre o nível implementado e o recomendado (100%)</p>
        <img src="data:image/png;base64,${radarBase64}" class="chart-img" alt="Radar de Capacidades" style="max-width: 100%;" />
      </div>
    </div>

    <div class="print-table">
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
              <td style="font-size: 7pt;">${cap.name}</td>
              <td style="text-align: center; font-size: 7pt; color: #10b981;">${cap.implemented}</td>
              <td style="text-align: center; font-size: 7pt; color: #f59e0b;">${cap.partial}</td>
              <td style="text-align: center; font-size: 7pt; color: #ef4444;">${cap.notImpl}</td>
              <td style="text-align: center; font-size: 7pt; font-weight: bold;">${cap.total}</td>
              <td style="text-align: center; font-size: 7pt; font-weight: bold; color: ${cap.aderente >= 70 ? '#10b981' : cap.aderente >= 40 ? '#f59e0b' : '#ef4444'};">${cap.aderente}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 6: DOMÍNIOS DE SI -->
  ${totalDomains > 0 ? `
  <div class="page section-break">
    <h2>6. Domínios de SI</h2>
    <p class="text-gray-600 text-sm mb-4">${totalDomains} controles analisados</p>

    <div class="chart-container" style="margin-bottom: 8pt;">
      <p class="chart-title">Distribuição por Domínio de SI</p>
      <p class="chart-subtitle">Defesa, Resiliência, Governança e ecossistema, Proteção</p>
      <img src="data:image/png;base64,${domainBarBase64}" class="chart-img" alt="Domínios de SI" />
    </div>

    <div class="grid-4">
      ${domainData.map((domain) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 6pt; text-align: center;">
          <div style="font-size: 10pt; font-weight: bold; color: #1e293b;">${domain.total}</div>
          <div style="font-size: 7pt; color: #64748b;">${domain.name}</div>
          <div style="display: flex; justify-content: center; gap: 4pt; margin-top: 2pt;">
            <span style="font-size: 6pt; color: #10b981;">✅ ${domain.implemented}</span>
            <span style="font-size: 6pt; color: #f59e0b;">🔄 ${domain.partial}</span>
            <span style="font-size: 6pt; color: #ef4444;">❌ ${domain.notImpl}</span>
          </div>
          <div class="progress-bar" style="margin-top: 2pt;">
            <div class="fill" style="width: ${domain.pImpl}%; background-color: ${domain.color};"></div>
          </div>
          <div style="font-size: 6pt; font-weight: bold; margin-top: 1pt; color: ${domain.color};">${domain.pImpl}%</div>
        </div>
      `).join('')}
    </div>

    <div class="grid-4" style="margin-top: 8pt;">
      ${domainData.map((domain) => {
        const img = domainPieImages[domain.name];
        if (!img) return '';
        return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 4pt; text-align: center;">
            <h4 style="font-size: 7pt; font-weight: bold; color: #1e293b; margin-bottom: 2pt;">${domain.name}</h4>
            <img src="data:image/png;base64,${img}" style="width: 100%; max-width: 180px; height: auto; margin: 0 auto; display: block;" alt="${domain.name}" />
          </div>
        `;
      }).join('')}
    </div>
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

</body>
</html>`;
  }
}
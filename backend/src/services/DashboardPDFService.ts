// backend/src/services/DashboardPDFService.ts
// 🔵 REFATORADO COMPLETO - VERSÃO FINAL ESTÁVEL (layout em grid)
// - Mantém 100% do código e da lógica original
// - Todos os gráficos preservados
// - Layout em CSS Grid: gráficos lado a lado, igual à tela do sistema
// - Sem quebras de página forçadas por seção (elimina páginas em branco)

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

interface PreparedData {
  categoryData: Array<{ name: string; total: number; implemented: number; partial: number; notImpl: number }>;
  typeData: Array<{ name: string; total: number; implemented: number; partial: number; notImpl: number }>;
  conceptData: Array<{ name: string; total: number; implemented: number; partial: number; notImpl: number }>;
  domainData: Array<{ name: string; total: number; implemented: number; partial: number; notImpl: number }>;
  capabilityData: Array<{ name: string; total: number; implemented: number; partial: number; notImpl: number; aderente: number }>;
  userName: string;
  userEmail: string;
  completionRate: number;
  formattedDate: string;
}

export class DashboardPDFService {

  // =====================================================
  // MÉTODO PRINCIPAL - GERAÇÃO DO PDF
  // =====================================================

  /**
   * Gera PDF completo do Dashboard de Maturidade
   */
  static async generateDashboardPDF(data: DashboardPDFData): Promise<Buffer> {
    const startTime = Date.now();

    let browser: any = null;
    let page: any = null;

    try {
      const isProduction = process.env.NODE_ENV === 'production';

      let puppeteer: any;
      let browserOptions: any;

      logger.info('🔄 DashboardPDF: Iniciando geração otimizada');

      // -----------------------------------------------------
      // GERAÇÃO DOS GRÁFICOS PRINCIPAIS (VISÃO GERAL)
      // -----------------------------------------------------

      const pieChartImage = ChartService.generatePieChart([
        { name: 'Implementado', value: data.summary.Implementado || 0, color: '#10b981' },
        { name: 'Parcialmente implementado', value: data.summary.Parcialmente || 0, color: '#f59e0b' },
        { name: 'Não implementado', value: data.summary.NaoImplementado || 0, color: '#ef4444' },
        { name: 'Não se aplica', value: data.summary.NaoSeAplica || 0, color: '#94a3b8' },
      ] as Array<{ name: string; value: number; color: string }>);

      if (!pieChartImage || pieChartImage.length === 0) {
        throw new Error('PieChart buffer vazio');
      }

      const barChartImage = ChartService.generateBarChart([
        { name: 'Implementados', value: data.summary.Implementado || 0, color: '#10b981' },
        { name: 'Parciais', value: data.summary.Parcialmente || 0, color: '#f59e0b' },
        { name: 'Não Implementados', value: data.summary.NaoImplementado || 0, color: '#ef4444' },
      ] as Array<{ name: string; value: number; color: string }>);

      if (!barChartImage || barChartImage.length === 0) {
        throw new Error('BarChart buffer vazio');
      }

      // -----------------------------------------------------
      // GRÁFICOS DE BARRAS - CONCEITOS E DOMÍNIOS
      // -----------------------------------------------------

      const conceptBarData = Object.entries(data.byCyberConcept || {})
        .map(([key, value]: [string, any]) => ({
          name: key,
          value: value.total || 0,
          color: '#6366f1',
        }))
        .filter((item) => item.value > 0);

      const conceptBarImage = ChartService.generateBarChart(conceptBarData);

      if (!conceptBarImage || conceptBarImage.length === 0) {
        throw new Error('ConceptBar buffer vazio');
      }

      const domainBarData = Object.entries(data.byDomain || {})
        .map(([key, value]: [string, any]) => ({
          name: key,
          value: value.total || 0,
          color: '#3b82f6',
        }))
        .filter((item) => item.value > 0);

      const domainBarImage = ChartService.generateBarChart(domainBarData);

      if (!domainBarImage || domainBarImage.length === 0) {
        throw new Error('DomainBar buffer vazio');
      }

      // -----------------------------------------------------
      // GRÁFICO RADAR - CAPACIDADES
      // -----------------------------------------------------

      const radarData = Object.entries(data.byCapability || {}).map(([key, value]: [string, any]) => ({
        subject: key.length > 20 ? key.substring(0, 20) + '…' : key,
        Implementado: value.aderente || 0,
        Recomendado: 100,
      }));

      const radarChartImage = ChartService.generateRadarChart(radarData);

      if (!radarChartImage || radarChartImage.length === 0) {
        throw new Error('RadarChart buffer vazio');
      }

      const pieBase64 = pieChartImage.toString('base64');
      const barBase64 = barChartImage.toString('base64');
      const conceptBarBase64 = conceptBarImage.toString('base64');
      const domainBarBase64 = domainBarImage.toString('base64');
      const radarBase64 = radarChartImage.toString('base64');

      // -----------------------------------------------------
      // GRÁFICOS PRINCIPAIS POR SEÇÃO (PIZZA GERAL)
      // -----------------------------------------------------

      const typePieGeneralImage = ChartService.generatePieChart(
        Object.entries(data.byType || {})
          .map(([name, value]: [string, any]) => ({
            name,
            value: value.total || 0,
            color: this.getColorForIndex(Object.keys(data.byType || {}).indexOf(name)),
          }))
          .filter((item) => item.value > 0)
      );

      const conceptPieGeneralImage = ChartService.generatePieChart(
        Object.entries(data.byCyberConcept || {})
          .map(([name, value]: [string, any]) => ({
            name,
            value: value.total || 0,
            color: this.getColorForIndex(Object.keys(data.byCyberConcept || {}).indexOf(name)),
          }))
          .filter((item) => item.value > 0)
      );

      const domainPieGeneralImage = ChartService.generatePieChart(
        Object.entries(data.byDomain || {})
          .map(([name, value]: [string, any]) => ({
            name,
            value: value.total || 0,
            color: this.getColorForIndex(Object.keys(data.byDomain || {}).indexOf(name)),
          }))
          .filter((item) => item.value > 0)
      );

      const typePieGeneralBase64 = typePieGeneralImage ? typePieGeneralImage.toString('base64') : '';
      const conceptPieGeneralBase64 = conceptPieGeneralImage ? conceptPieGeneralImage.toString('base64') : '';
      const domainPieGeneralBase64 = domainPieGeneralImage ? domainPieGeneralImage.toString('base64') : '';

      // -----------------------------------------------------
      // GRÁFICOS INDIVIDUAIS POR TIPO
      // -----------------------------------------------------

      const typePieImages: Record<string, string> = {};

      Object.entries(data.byType || {}).forEach(([typeName, typeData]: [string, any]) => {
        if (typeData && typeData.total > 0) {
          const typePie = ChartService.generatePieChart([
            { name: 'Implementado', value: typeData.implemented || 0, color: '#10b981' },
            { name: 'Parcialmente', value: typeData.partial || 0, color: '#f59e0b' },
            { name: 'Não Implementado', value: typeData.notImpl || 0, color: '#ef4444' },
          ]);

          if (typePie && typePie.length > 0) {
            typePieImages[typeName] = typePie.toString('base64');
          }
        }
      });

      // -----------------------------------------------------
      // GRÁFICOS INDIVIDUAIS POR CONCEITO
      // -----------------------------------------------------

      const conceptPieImages: Record<string, string> = {};

      Object.entries(data.byCyberConcept || {}).forEach(([conceptName, conceptData]: [string, any]) => {
        if (conceptData && conceptData.total > 0) {
          const conceptPie = ChartService.generatePieChart([
            { name: 'Implementado', value: conceptData.implemented || 0, color: '#10b981' },
            { name: 'Parcialmente', value: conceptData.partial || 0, color: '#f59e0b' },
            { name: 'Não Implementado', value: conceptData.notImpl || 0, color: '#ef4444' },
          ]);

          if (conceptPie && conceptPie.length > 0) {
            conceptPieImages[conceptName] = conceptPie.toString('base64');
          }
        }
      });

      // -----------------------------------------------------
      // GRÁFICOS INDIVIDUAIS POR DOMÍNIO
      // -----------------------------------------------------

      const domainPieImages: Record<string, string> = {};

      Object.entries(data.byDomain || {}).forEach(([domainName, domainData]: [string, any]) => {
        if (domainData && domainData.total > 0) {
          const domainPie = ChartService.generatePieChart([
            { name: 'Implementado', value: domainData.implemented || 0, color: '#10b981' },
            { name: 'Parcialmente', value: domainData.partial || 0, color: '#f59e0b' },
            { name: 'Não Implementado', value: domainData.notImpl || 0, color: '#ef4444' },
          ]);

          if (domainPie && domainPie.length > 0) {
            domainPieImages[domainName] = domainPie.toString('base64');
          }
        }
      });

      // -----------------------------------------------------
      // LOGS DE DIAGNÓSTICO
      // -----------------------------------------------------

      logger.info(`📊 PieChart: ${pieBase64.length} bytes`);
      logger.info(`📊 BarChart: ${barBase64.length} bytes`);
      logger.info(`📊 ConceptBar: ${conceptBarBase64.length} bytes`);
      logger.info(`📊 DomainBar: ${domainBarBase64.length} bytes`);
      logger.info(`📊 RadarChart: ${radarBase64.length} bytes`);
      logger.info(`📊 TypePies: ${Object.keys(typePieImages).length} gráficos`);
      logger.info(`📊 ConceptPies: ${Object.keys(conceptPieImages).length} gráficos`);
      logger.info(`📊 DomainPies: ${Object.keys(domainPieImages).length} gráficos`);
      logger.info(`📊 TypePieGeneral: ${typePieGeneralBase64.length > 0 ? '✅' : '❌'}`);
      logger.info(`📊 ConceptPieGeneral: ${conceptPieGeneralBase64.length > 0 ? '✅' : '❌'}`);
      logger.info(`📊 DomainPieGeneral: ${domainPieGeneralBase64.length > 0 ? '✅' : '❌'}`);

      // -----------------------------------------------------
      // PREPARAÇÃO DOS DADOS
      // -----------------------------------------------------

      const preparedData = this.prepareData(data);

      // -----------------------------------------------------
      // GERAÇÃO DO HTML
      // -----------------------------------------------------

      const html = this.generateHTML(
        data,
        pieBase64,
        barBase64,
        conceptBarBase64,
        domainBarBase64,
        radarBase64,
        typePieGeneralBase64,
        conceptPieGeneralBase64,
        domainPieGeneralBase64,
        typePieImages,
        conceptPieImages,
        domainPieImages,
        preparedData
      );

      // -----------------------------------------------------
      // CONFIGURAÇÃO DO CHROMIUM
      // -----------------------------------------------------

      if (isProduction) {
        const chromiumModule = await import('@sparticuz/chromium');
        const chromium = chromiumModule.default || chromiumModule;

        const puppeteerCore = await import('puppeteer-core');
        puppeteer = puppeteerCore.default || puppeteerCore;

        // @ts-ignore - Ignorar erros de tipo do chromium em produção
        const chromiumArgs = (chromium as any).args || [];
        // @ts-ignore - Ignorar erros de tipo do chromium em produção
        const chromiumPath = await (chromium as any).executablePath();

        browserOptions = {
          args: [
            ...chromiumArgs,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
          ],
          executablePath: chromiumPath,
          headless: true,
        };

        logger.info('🔄 DashboardPDF: Chromium produção');
      } else {
        const puppeteerModule = await import('puppeteer');
        puppeteer = puppeteerModule.default || puppeteerModule;

        browserOptions = {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        };

        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
          browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        logger.info('🔄 DashboardPDF: Puppeteer local');
      }

      browser = await puppeteer.launch(browserOptions);
      page = await browser.newPage();

      // -----------------------------------------------------
      // VIEWPORT OTIMIZADO (proporção A4 paisagem)
      // -----------------------------------------------------

      await page.setViewport({
        width: 1123,
        height: 794,
        deviceScaleFactor: 2,
      });

      await page.emulateMediaType('print');

      await page.setContent(html, {
        waitUntil: ['load', 'domcontentloaded'] as any,
        timeout: 30000,
      });

      // Aguarda todas as imagens carregarem
      await page.waitForFunction(
        () => Array.from(document.images).every((img) => img.complete),
        { timeout: 30000 }
      );

      // Aguarda fontes
      await page.evaluate(async () => {
        if (document.fonts) {
          await document.fonts.ready;
        }
      });

      // -----------------------------------------------------
      // GERAÇÃO DO PDF
      // -----------------------------------------------------

      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '10mm',
          bottom: '10mm',
          left: '10mm',
          right: '10mm',
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false,
        scale: 0.9,
        timeout: 60000,
      });

      logger.info(`✅ DashboardPDF gerado em ${Date.now() - startTime}ms (${pdf.length} bytes)`);

      return Buffer.from(pdf);
    } catch (error) {
      logger.error('❌ DashboardPDF erro:', error);
      throw error;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          logger.debug('⚠️ Erro ao fechar página:', error);
        }
      }

      if (browser) {
        try {
          await browser.close();
          logger.debug('🔒 DashboardPDF Browser fechado');
        } catch (error) {
          logger.debug('⚠️ Erro ao fechar browser:', error);
        }
      }
    }
  }

  // =====================================================
  // MÉTODOS PRIVADOS - AUXILIARES
  // =====================================================

  private static getColorForIndex(index: number): string {
    const colors: string[] = [
      '#3b82f6', // azul
      '#10b981', // verde
      '#f59e0b', // amarelo
      '#ef4444', // vermelho
      '#8b5cf6', // roxo
      '#ec4899', // rosa
      '#06b6d4', // ciano
      '#f97316', // laranja
      '#14b8a6', // teal
      '#6366f1', // índigo
      '#d946ef', // magenta
      '#84cc16', // lima
    ];
    const safeIndex = Math.abs(index) % colors.length;
    return colors[safeIndex] || '#64748b'; // fallback seguro
  }

  private static escapeHtml(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // =====================================================
  // MÉTODOS PRIVADOS - PREPARAÇÃO DE DADOS
  // =====================================================

  private static prepareData(data: DashboardPDFData): PreparedData {
    const formatDate = (date: string) =>
      new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    const completionRate =
      data.summary.totalControls > 0
        ? Math.round((data.summary.Implementado / data.summary.totalControls) * 100)
        : 0;

    const categoryData = Object.entries(data.byCategory || {}).map(([name, value]: [string, any]) => ({
      name,
      total: value.total || 0,
      implemented: value.implemented || 0,
      partial: value.partial || 0,
      notImpl: value.notImpl || 0,
    }));

    const typeData = Object.entries(data.byType || {}).map(([name, value]: [string, any]) => ({
      name,
      total: value.total || 0,
      implemented: value.implemented || 0,
      partial: value.partial || 0,
      notImpl: value.notImpl || 0,
    }));

    const conceptData = Object.entries(data.byCyberConcept || {}).map(([name, value]: [string, any]) => ({
      name,
      total: value.total || 0,
      implemented: value.implemented || 0,
      partial: value.partial || 0,
      notImpl: value.notImpl || 0,
    }));

    const domainData = Object.entries(data.byDomain || {}).map(([name, value]: [string, any]) => ({
      name,
      total: value.total || 0,
      implemented: value.implemented || 0,
      partial: value.partial || 0,
      notImpl: value.notImpl || 0,
    }));

    const capabilityData = Object.entries(data.byCapability || {}).map(([name, value]: [string, any]) => ({
      name,
      total: value.total || 0,
      implemented: value.implemented || 0,
      partial: value.partial || 0,
      notImpl: value.notImpl || 0,
      aderente: value.aderente || 0,
    }));

    const userName = data.user?.name || 'Usuário não identificado';
    const userEmail = data.user?.email || 'email não informado';

    return {
      categoryData,
      typeData,
      conceptData,
      domainData,
      capabilityData,
      userName,
      userEmail,
      completionRate,
      formattedDate: formatDate(data.generatedAt),
    };
  }

  // =====================================================
  // MÉTODO PRINCIPAL - GERAÇÃO DO HTML
  // =====================================================

  private static generateHTML(
    data: DashboardPDFData,
    pieBase64: string,
    barBase64: string,
    conceptBarBase64: string,
    domainBarBase64: string,
    radarBase64: string,
    typePieGeneralBase64: string,
    conceptPieGeneralBase64: string,
    domainPieGeneralBase64: string,
    typePieImages: Record<string, string>,
    conceptPieImages: Record<string, string>,
    domainPieImages: Record<string, string>,
    prepared: PreparedData
  ): string {
    const { company, summary } = data;
    const esc = this.escapeHtml;

    const {
      categoryData,
      typeData,
      conceptData,
      domainData,
      capabilityData,
      userName,
      userEmail,
      completionRate,
      formattedDate,
    } = prepared;

    // -----------------------------------------------------
    // HELPERS DE MONTAGEM
    // -----------------------------------------------------

    /** Card de métrica padrão (número + rótulo + mini legenda) */
    const statCard = (item: { name: string; total: number; implemented: number; partial: number; notImpl: number }) => `
      <div class="stat-card">
        <div class="stat-value">${item.total}</div>
        <div class="stat-label">${esc(item.name)}</div>
        <div class="stat-legend">
          <span class="ok">✔ ${item.implemented}</span>
          <span class="warn">◐ ${item.partial}</span>
          <span class="bad">✖ ${item.notImpl}</span>
        </div>
      </div>`;

    /** Card de gráfico (título + imagem) */
    const chartCard = (title: string, base64: string, extraClass = '') => `
      <div class="chart-card ${extraClass}">
        <div class="chart-title">${esc(title)}</div>
        <div class="chart-body">
          <img src="data:image/png;base64,${base64}" alt="${esc(title)}" />
        </div>
      </div>`;

    /** Grid de gráficos lado a lado — 3 colunas por padrão */
    const buildChartGrid = (chartEntries: [string, string][], columns = 3) => {
      if (!chartEntries.length) return '';
      return `
      <div class="grid grid-${columns} avoid-break">
        ${chartEntries.map(([name, base64]) => chartCard(name, base64, 'chart-card--sm')).join('')}
      </div>`;
    };

    /** Grid de cards lado a lado */
    const buildCardGrid = (items: string[], columns = 5) => {
      if (!items.length) return '';
      return `
      <div class="grid grid-${columns} avoid-break">
        ${items.join('')}
      </div>`;
    };

    // -----------------------------------------------------
    // BLOCOS DE CONTEÚDO
    // -----------------------------------------------------

    const categoryHtml = categoryData.map(statCard).join('');

    // Preservado do original: variação tabular de Tipos de Controle
    const typeHtml = typeData.map(statCard).join('');
    void typeHtml; // preservado do código original (não renderizado)

    const typeCardItems = typeData.map(statCard);
    const conceptCardItems = conceptData.map(statCard);
    const domainCardItems = domainData.map(statCard);

    const typePieEntries = Object.entries(typePieImages);
    const conceptPieEntries = Object.entries(conceptPieImages);
    const domainPieEntries = Object.entries(domainPieImages);

    const typePiesHtml = buildChartGrid(typePieEntries, 3);
    const conceptPiesHtml = buildChartGrid(conceptPieEntries, 3);
    const domainPiesHtml = buildChartGrid(domainPieEntries, 3);

    const capabilityHtml = capabilityData
      .map(
        (cap) => `
        <tr>
          <td class="td-name">${esc(cap.name)}</td>
          <td class="ok">${cap.implemented}</td>
          <td class="warn">${cap.partial}</td>
          <td class="bad">${cap.notImpl}</td>
          <td>${cap.total}</td>
          <td class="td-strong">${cap.aderente}%</td>
        </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Dashboard de Maturidade - ${esc(company.name)}</title>
<style>
@page {
  size: A4 landscape;
  margin: 10mm;
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
  background: #ffffff;
  font-size: 11px;
}

/* ==================================================
   ESTRUTURA
   ================================================== */
.page { width: 100%; }

.section {
  margin: 0 0 14px 0;
  page-break-inside: auto;
  break-inside: auto;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  padding-bottom: 5px;
  border-bottom: 2px solid #e2e8f0;
  page-break-after: avoid;
  break-after: avoid;
}

.subsection-title {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin: 10px 0 6px 0;
  page-break-after: avoid;
  break-after: avoid;
}

/* ==================================================
   GRID — GRÁFICOS E CARDS LADO A LADO
   ================================================== */
.grid {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
  align-items: stretch;
}

.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }

.avoid-break {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* ==================================================
   CARDS
   ================================================== */
.stat-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 8px 6px;
  text-align: center;
  page-break-inside: avoid;
  break-inside: avoid;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1d4ed8;
  line-height: 1.1;
}

.stat-label {
  font-size: 9px;
  color: #475569;
  margin-top: 2px;
  line-height: 1.25;
}

.stat-legend {
  margin-top: 4px;
  font-size: 8.5px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.ok   { color: #059669; font-weight: 600; }
.warn { color: #d97706; font-weight: 600; }
.bad  { color: #dc2626; font-weight: 600; }

/* ==================================================
   GRÁFICOS
   ================================================== */
.chart-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
  display: flex;
  flex-direction: column;
  page-break-inside: avoid;
  break-inside: avoid;
}

.chart-title {
  font-size: 10.5px;
  font-weight: 600;
  color: #334155;
  text-align: center;
  margin-bottom: 4px;
}

.chart-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.chart-card img {
  width: 100%;
  height: auto;
  max-height: 210px;
  object-fit: contain;
  display: block;
}

.chart-card--sm img { max-height: 150px; }
.chart-card--lg img { max-height: 250px; }

/* ==================================================
   TABELA DE CAPACIDADES
   ================================================== */
.table-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  page-break-inside: avoid;
  break-inside: avoid;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.5px;
}

thead th {
  background: #1e293b;
  color: #ffffff;
  font-weight: 600;
  padding: 6px 6px;
  text-align: center;
}

thead th:first-child { text-align: left; }

tbody td {
  padding: 5px 6px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr:nth-child(even) { background: #f8fafc; }

.td-name { text-align: left; font-weight: 500; color: #334155; }
.td-strong { font-weight: 700; color: #1d4ed8; }

/* ==================================================
   CABEÇALHO E RODAPÉ
   ================================================== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 3px solid #1d4ed8;
  padding-bottom: 10px;
  margin-bottom: 14px;
}

.brand {
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  letter-spacing: 0.5px;
}

.header h1 {
  font-size: 20px;
  margin: 4px 0 2px 0;
  color: #0f172a;
}

.header h2 {
  font-size: 11px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #64748b;
}

.company {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.meta {
  text-align: right;
  font-size: 9.5px;
  color: #475569;
  line-height: 1.5;
}

.footer {
  margin-top: 14px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  font-size: 9px;
  color: #64748b;
  line-height: 1.5;
  page-break-inside: avoid;
  break-inside: avoid;
}
</style>
</head>
<body>
<div class="page">

  <!-- ============ CABEÇALHO ============ -->
  <div class="header">
    <div>
      <div class="brand">Code_Assessment</div>
      <h1>Dashboard de Maturidade</h1>
      <h2>Avaliação ISO 27001:2022</h2>
      <div class="company">${esc(company.name)}</div>
    </div>
    <div class="meta">
      <div>Responsável: ${esc(userName)}</div>
      <div>E-mail: ${esc(userEmail)}</div>
      <div>Data: ${formattedDate}</div>
    </div>
  </div>

  <!-- ============ 1. VISÃO GERAL ============ -->
  <div class="section">
    <div class="section-title">1. Visão Geral</div>

    <div class="grid grid-5 avoid-break">
      <div class="stat-card"><div class="stat-value">${summary.totalControls}</div><div class="stat-label">Total de controles</div></div>
      <div class="stat-card"><div class="stat-value ok">${summary.Implementado}</div><div class="stat-label">Implementados</div></div>
      <div class="stat-card"><div class="stat-value warn">${summary.Parcialmente}</div><div class="stat-label">Parciais</div></div>
      <div class="stat-card"><div class="stat-value bad">${summary.NaoImplementado}</div><div class="stat-label">Não implementados</div></div>
      <div class="stat-card"><div class="stat-value">${completionRate}%</div><div class="stat-label">Taxa conclusão</div></div>
    </div>

    <div class="grid grid-2 avoid-break">
      ${chartCard('Distribuição de Status', pieBase64, 'chart-card--lg')}
      ${chartCard('Quantidade por Status', barBase64, 'chart-card--lg')}
    </div>
  </div>

  <!-- ============ 2. CATEGORIAS ============ -->
  <div class="section">
    <div class="section-title">2. Categorias de Controle</div>
    <div class="grid grid-4 avoid-break">
      ${categoryHtml}
    </div>
  </div>

  <!-- ============ 3. TIPOS DE CONTROLE ============ -->
  <div class="section">
    <div class="section-title">3. Tipos de Controle</div>

    ${
      typePieGeneralBase64
        ? `<div class="grid grid-2 avoid-break">
             ${chartCard('Distribuição Geral por Tipo', typePieGeneralBase64)}
             ${chartCard('Quantidade por Status', barBase64)}
           </div>`
        : ''
    }

    ${buildCardGrid(typeCardItems, 5)}

    <div class="subsection-title">Detalhamento por Tipo</div>
    ${typePiesHtml}
  </div>

  <!-- ============ 4. CONCEITOS CIBERNÉTICOS ============ -->
  <div class="section">
    <div class="section-title">4. Conceitos Cibernéticos</div>

    <div class="grid grid-2 avoid-break">
      ${conceptPieGeneralBase64 ? chartCard('Distribuição Geral por Conceito', conceptPieGeneralBase64) : ''}
      ${chartCard('Quantidade por Conceito', conceptBarBase64)}
    </div>

    ${buildCardGrid(conceptCardItems, 5)}

    <div class="subsection-title">Detalhamento por Conceito</div>
    ${conceptPiesHtml}
  </div>

  <!-- ============ 5. CAPACIDADES OPERACIONAIS ============ -->
  <div class="section">
    <div class="section-title">5. Capacidades Operacionais</div>

    <div class="grid grid-2 avoid-break">
      ${chartCard('Radar de Capacidades', radarBase64, 'chart-card--lg')}
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Capacidade</th>
              <th>Implementado</th>
              <th>Parcial</th>
              <th>Não Implementado</th>
              <th>Total</th>
              <th>Aderência</th>
            </tr>
          </thead>
          <tbody>
            ${capabilityHtml}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ============ 6. DOMÍNIOS ============ -->
  <div class="section">
    <div class="section-title">6. Domínios de Segurança da Informação</div>

    <div class="grid grid-2 avoid-break">
      ${domainPieGeneralBase64 ? chartCard('Distribuição Geral por Domínio', domainPieGeneralBase64) : ''}
      ${chartCard('Distribuição por Domínio', domainBarBase64)}
    </div>

    ${buildCardGrid(domainCardItems, 5)}

    <div class="subsection-title">Detalhamento por Domínio</div>
    ${domainPiesHtml}
  </div>

  <!-- ============ RODAPÉ ============ -->
  <div class="footer">
    <div><strong>Code_Assessment</strong> — Sistema de Avaliação de Maturidade ISO 27001:2022</div>
    <div>Relatório gerado em ${formattedDate} • Empresa: ${esc(company.name)}</div>
  </div>

</div>
</body>
</html>`;
  }
}

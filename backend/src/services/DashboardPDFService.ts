// backend/src/services/DashboardPDFService.ts
// 🔵 REFATORADO COMPLETO - VERSÃO FINAL ESTÁVEL (organizado)
// - Mantém 100% do código e da lógica original
// - Restaura todos os gráficos faltantes
// - Estrutura em linhas independentes (sem flex-wrap)
// - Layout idêntico ao dashboard
// - Formatação e organização revisadas para leitura e manutenção

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
   *
   * Otimizações aplicadas:
   * - Menos processamento no Chromium
   * - Menos escala de renderização
   * - Remove espera fixa
   * - Mantém compatibilidade Render/Vercel/Linux
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

      // Gráfico principal de pizza para Tipos de Controle
      const typePieGeneralImage = ChartService.generatePieChart(
        Object.entries(data.byType || {})
          .map(([name, value]: [string, any]) => ({
            name,
            value: value.total || 0,
            color: this.getColorForIndex(Object.keys(data.byType || {}).indexOf(name)),
          }))
          .filter((item) => item.value > 0)
      );

      // Gráfico principal de pizza para Conceitos Cibernéticos
      const conceptPieGeneralImage = ChartService.generatePieChart(
        Object.entries(data.byCyberConcept || {})
          .map(([name, value]: [string, any]) => ({
            name,
            value: value.total || 0,
            color: this.getColorForIndex(Object.keys(data.byCyberConcept || {}).indexOf(name)),
          }))
          .filter((item) => item.value > 0)
      );

      // Gráfico principal de pizza para Domínios
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
      // VIEWPORT OTIMIZADO
      // -----------------------------------------------------

      await page.setViewport({
        width: 1280,
        height: 1600,
        deviceScaleFactor: 1,
      });

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
          top: '15mm',
          bottom: '15mm',
          left: '10mm',
          right: '10mm',
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false,
        scale: 0.95,
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
    // PREPARAÇÃO DOS HTMLs PARCIAIS
    // -----------------------------------------------------

    const categoryHtml = categoryData
      .map(
        (cat) => `
<div class="card flex-item">
  <div class="metric">
    ${cat.total}
  </div>
  <div class="label">
    ${cat.name}
  </div>
  <div style="margin-top:8px;font-size:8pt;">
    <span style="color:#10b981">✔ ${cat.implemented}</span>
    &nbsp;
    <span style="color:#f59e0b">◐ ${cat.partial}</span>
    &nbsp;
    <span style="color:#ef4444">✖ ${cat.notImpl}</span>
  </div>
</div>
`
      )
      .join('');

    // Mantido conforme original: HTML tabular alternativo para Tipos de Controle
    // (não utilizado na renderização final, que usa `typeCardItems` mais abaixo,
    // mas preservado a pedido para não remover nenhum trecho de código).
    const typeHtml = typeData
      .map(
        (type) => `
<div class="card flex-item">
  <div class="metric">
    ${type.total}
  </div>
  <div class="label">
    ${type.name}
  </div>
  <div style="margin-top:8px">
    <span style="color:#10b981">✔ ${type.implemented}</span>
    &nbsp;
    <span style="color:#f59e0b">◐ ${type.partial}</span>
    &nbsp;
    <span style="color:#ef4444">✖ ${type.notImpl}</span>
  </div>
</div>
`
      )
      .join('');

    // Função para criar linhas de gráficos (3 por linha)
    const buildChartRows = (chartEntries: [string, string][], baseClass: string = '') => {
      const rows = [];
      for (let i = 0; i < chartEntries.length; i += 3) {
        const rowItems = chartEntries.slice(i, i + 3);
        const rowHtml = rowItems
          .map(
            ([name, base64]) => `
<div class="flex-item chart-container">
  <div class="chart-title">${name}</div>
  <div class="chart-wrapper">
    <img class="chart-img" src="data:image/png;base64,${base64}" />
  </div>
</div>
`
          )
          .join('');

        rows.push(`
<div class="flex-row pdf-section chart-row ${baseClass}">
  ${rowHtml}
</div>
`);
      }
      return rows.join('');
    };

    // Função para criar linhas de cards (5 por linha)
    const buildCardRows = (items: string[], itemsPerRow: number = 5) => {
      const rows = [];
      for (let i = 0; i < items.length; i += itemsPerRow) {
        const rowItems = items.slice(i, i + itemsPerRow);
        rows.push(`
<div class="flex-row card-row">
  ${rowItems.join('')}
</div>
`);
      }
      return rows.join('');
    };

    // Preparar itens de tipos para cards
    const typeCardItems = typeData.map(
      (type) => `
<div class="card flex-item">
  <div class="metric">${type.total}</div>
  <div class="label">${type.name}</div>
  <div style="margin-top:8px;font-size:8pt;">
    <span style="color:#10b981">✔ ${type.implemented}</span>
    &nbsp;
    <span style="color:#f59e0b">◐ ${type.partial}</span>
    &nbsp;
    <span style="color:#ef4444">✖ ${type.notImpl}</span>
  </div>
</div>
`
    );

    // Preparar itens de conceitos para cards
    const conceptCardItems = conceptData.map(
      (concept) => `
<div class="card flex-item">
  <div class="metric">${concept.total}</div>
  <div class="label">${concept.name}</div>
  <div style="margin-top:8px;font-size:8pt;">
    <span style="color:#10b981">✔ ${concept.implemented}</span>
    &nbsp;
    <span style="color:#f59e0b">◐ ${concept.partial}</span>
    &nbsp;
    <span style="color:#ef4444">✖ ${concept.notImpl}</span>
  </div>
</div>
`
    );

    // Preparar itens de domínios para cards
    const domainCardItems = domainData.map(
      (domain) => `
<div class="card flex-item">
  <div class="metric">${domain.total}</div>
  <div class="label">${domain.name}</div>
</div>
`
    );

    // Preparar gráficos de pizza por tipo
    const typePieEntries = Object.entries(typePieImages);
    const typePiesHtml = typePieEntries.length > 0 ? buildChartRows(typePieEntries) : '';

    // Preparar gráficos de pizza por conceito
    const conceptPieEntries = Object.entries(conceptPieImages);
    const conceptPiesHtml = conceptPieEntries.length > 0 ? buildChartRows(conceptPieEntries) : '';

    // Preparar gráficos de pizza por domínio
    const domainPieEntries = Object.entries(domainPieImages);
    const domainPiesHtml = domainPieEntries.length > 0 ? buildChartRows(domainPieEntries) : '';

    const capabilityHtml = capabilityData
      .map(
        (cap) => `
<tr>
  <td>
    ${cap.name}
  </td>
  <td style="color:#10b981">
    ${cap.implemented}
  </td>
  <td style="color:#f59e0b">
    ${cap.partial}
  </td>
  <td style="color:#ef4444">
    ${cap.notImpl}
  </td>
  <td>
    ${cap.total}
  </td>
  <td>
    ${cap.aderente}%
  </td>
</tr>
`
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
/*
======================================================
CONFIGURAÇÃO BASE
======================================================
*/
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  zoom: 1;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  color: #1e293b;
  font-size: 10pt;
  background: #ffffff;
  zoom: 1;
}

.page {
  width: 100%;
  padding: 15pt;
  page-break-after: always;
  break-after: page;
}

.page:last-child {
  page-break-after: auto;
  break-after: auto;
}

/*
======================================================
LAYOUT - SEM FLEX-WRAP
======================================================
*/
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12pt;
  width: 100%;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-item {
  flex: 1;
  min-width: 0;
}

/*
======================================================
CARDS - LINHAS INDEPENDENTES
======================================================
*/
.card-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12pt;
  width: 100%;
  margin-bottom: 12pt;
}

.card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 5pt;
  padding: 8pt;
  text-align: center;
  page-break-inside: avoid;
  break-inside: avoid;
  flex: 1;
}

.metric {
  font-size: 18pt;
  font-weight: bold;
}

.label {
  font-size: 8pt;
  color: #64748b;
}

/*
======================================================
GRÁFICOS - LINHAS INDEPENDENTES
======================================================
*/
.chart-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12pt;
  width: 100%;
  margin-bottom: 12pt;
}

.chart-container {
  page-break-inside: avoid;
  break-inside: avoid;
  flex: 1;
  text-align: center;
}

.chart-title {
  font-size: 10pt;
  font-weight: bold;
  color: #475569;
  margin-bottom: 4pt;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.chart-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/*
======================================================
CONTROLE DE QUEBRA
======================================================
*/
.pdf-section {
  page-break-inside: avoid;
  break-inside: avoid;
  display: block;
  width: 100%;
}

/*
======================================================
TABELAS
======================================================
*/
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  page-break-inside: avoid;
}

th {
  background: #f1f5f9;
  font-weight: bold;
}

td,
th {
  border: 1px solid #cbd5e1;
  padding: 4pt;
  text-align: center;
}

/*
======================================================
RADAR
======================================================
*/
.radar-container {
  width: 100%;
  max-width: 480px;
  height: 320px;
  margin: auto;
  overflow: hidden;
  page-break-inside: avoid;
  break-inside: avoid;
}

/*
======================================================
SEÇÃO DE GRÁFICOS PRINCIPAIS
======================================================
*/
.main-chart-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: flex-start;
  gap: 12pt;
  width: 100%;
  margin-bottom: 12pt;
}

.main-chart {
  flex: 1;
  text-align: center;
  page-break-inside: avoid;
  break-inside: avoid;
}

/*
======================================================
IMPRESSÃO
======================================================
*/
@page {
  size: A4 landscape;
  margin: 15mm;
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/*
======================================================
RESPONSIVIDADE PARA PDF
======================================================
*/
@media print {
  .flex-row,
  .card-row,
  .chart-row,
  .main-chart-row {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
</head>
<body>
<!-- =====================================================
     CAPA
====================================================== -->
<div class="page pdf-section">
  <div style="text-align:center;padding-top:120px;">
    <div style="font-size:34pt;font-weight:900;color:#0f172a;">
      Code<span style="color:#2563eb;">_Assessment</span>
    </div>
    <h1 style="margin-top:30px;font-size:24pt;">Dashboard de Maturidade</h1>
    <p style="font-size:14pt;color:#475569;">Avaliação ISO 27001:2022</p>
    <div style="margin:30px auto;font-size:20pt;font-weight:bold;color:#2563eb;border-top:2px solid #2563eb;border-bottom:2px solid #2563eb;padding:12px 30px;max-width:70%;">
      ${company.name}
    </div>
    <div style="margin-top:30px;font-size:10pt;color:#64748b;line-height:1.8;">
      <strong>Responsável:</strong> ${userName}
      <br/>
      <strong>E-mail:</strong> ${userEmail}
      <br/>
      <strong>Data:</strong> ${formattedDate}
    </div>
  </div>
</div>

<!-- =====================================================
     VISÃO GERAL
====================================================== -->
<div class="page">
  <h2>1. Visão Geral</h2>
  <div class="flex-row pdf-section">
    <div class="card flex-item">
      <div class="metric">${summary.totalControls}</div>
      <div class="label">Total de controles</div>
    </div>
    <div class="card flex-item">
      <div class="metric" style="color:#10b981">${summary.Implementado}</div>
      <div class="label">Implementados</div>
    </div>
    <div class="card flex-item">
      <div class="metric" style="color:#f59e0b">${summary.Parcialmente}</div>
      <div class="label">Parciais</div>
    </div>
    <div class="card flex-item">
      <div class="metric" style="color:#ef4444">${summary.NaoImplementado}</div>
      <div class="label">Não implementados</div>
    </div>
    <div class="card flex-item">
      <div class="metric" style="color:#2563eb">${completionRate}%</div>
      <div class="label">Taxa conclusão</div>
    </div>
  </div>
  <br/>
  <div class="flex-row pdf-section">
    <div class="chart-container flex-item">
      <div class="chart-title">Distribuição de Status</div>
      <div class="chart-wrapper">
        <img class="chart-img" src="data:image/png;base64,${pieBase64}" />
      </div>
    </div>
    <div class="chart-container flex-item">
      <div class="chart-title">Quantidade por Status</div>
      <div class="chart-wrapper">
        <img class="chart-img" src="data:image/png;base64,${barBase64}" />
      </div>
    </div>
  </div>
</div>

<!-- =====================================================
     CATEGORIAS
====================================================== -->
<div class="page">
  <h2>2. Categorias de Controle</h2>
  <div class="flex-row pdf-section">
    ${categoryHtml}
  </div>
</div>

<!-- =====================================================
     TIPOS DE CONTROLE
====================================================== -->
<div class="page">
  <h2>3. Tipos de Controle</h2>

  <!-- GRÁFICO PRINCIPAL - PIZZA GERAL -->
  ${
    typePieGeneralBase64
      ? `
  <div class="main-chart-row pdf-section">
    <div class="main-chart">
      <div class="chart-title">Distribuição Geral por Tipo</div>
      <div class="chart-wrapper" style="height:250px;">
        <img class="chart-img" src="data:image/png;base64,${typePieGeneralBase64}" />
      </div>
    </div>
  </div>
  <br/>
  `
      : ''
  }

  <!-- CARDS -->
  ${buildCardRows(typeCardItems)}
  <br/>

  <!-- GRÁFICOS INDIVIDUAIS (3 por linha) -->
  ${typePiesHtml}
</div>

<!-- =====================================================
     CONCEITOS CIBERNÉTICOS
====================================================== -->
<div class="page">
  <h2>4. Conceitos Cibernéticos</h2>

  <!-- GRÁFICO PRINCIPAL - PIZZA GERAL -->
  ${
    conceptPieGeneralBase64
      ? `
  <div class="main-chart-row pdf-section">
    <div class="main-chart">
      <div class="chart-title">Distribuição Geral por Conceito</div>
      <div class="chart-wrapper" style="height:250px;">
        <img class="chart-img" src="data:image/png;base64,${conceptPieGeneralBase64}" />
      </div>
    </div>
  </div>
  <br/>
  `
      : ''
  }

  <!-- BAR CHART -->
  <div class="chart-container pdf-section">
    <div class="chart-title">Quantidade por Conceito</div>
    <div class="chart-wrapper" style="height:220px;">
      <img class="chart-img" src="data:image/png;base64,${conceptBarBase64}" />
    </div>
  </div>
  <br/>

  <!-- CARDS -->
  ${buildCardRows(conceptCardItems)}
  <br/>

  <!-- GRÁFICOS INDIVIDUAIS (3 por linha) -->
  ${conceptPiesHtml}
</div>

<!-- =====================================================
     CAPACIDADES OPERACIONAIS
====================================================== -->
<div class="page">
  <h2>5. Capacidades Operacionais</h2>
  <div class="radar-container pdf-section">
    <div class="chart-title">Radar de Capacidades</div>
    <img class="chart-img" src="data:image/png;base64,${radarBase64}" />
  </div>
  <br/>
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

<!-- =====================================================
     DOMÍNIOS
====================================================== -->
<div class="page">
  <h2>6. Domínios de Segurança da Informação</h2>

  <!-- GRÁFICO PRINCIPAL - PIZZA GERAL -->
  ${
    domainPieGeneralBase64
      ? `
  <div class="main-chart-row pdf-section">
    <div class="main-chart">
      <div class="chart-title">Distribuição Geral por Domínio</div>
      <div class="chart-wrapper" style="height:250px;">
        <img class="chart-img" src="data:image/png;base64,${domainPieGeneralBase64}" />
      </div>
    </div>
  </div>
  <br/>
  `
      : ''
  }

  <!-- BAR CHART -->
  <div class="chart-container pdf-section">
    <div class="chart-title">Distribuição por Domínio</div>
    <div class="chart-wrapper" style="height:220px;">
      <img class="chart-img" src="data:image/png;base64,${domainBarBase64}" />
    </div>
  </div>
  <br/>

  <!-- CARDS -->
  ${buildCardRows(domainCardItems)}
  <br/>

  <!-- GRÁFICOS INDIVIDUAIS (3 por linha) -->
  ${domainPiesHtml}
</div>

<!-- =====================================================
     FINAL
====================================================== -->
<div class="page">
  <div style="text-align:center;margin-top:150px;color:#64748b;font-size:9pt;">
    <strong>Code_Assessment</strong>
    <br/>
    Sistema de Avaliação de Maturidade ISO 27001:2022
    <br/><br/>
    Relatório gerado em ${formattedDate}
    <br/>
    Empresa: ${company.name}
  </div>
</div>

</body>
</html>
`;
  }
}
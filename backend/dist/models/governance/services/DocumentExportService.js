"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentExportService = void 0;
const PDFService_1 = require("../../../services/PDFService");
class DocumentExportService {
    /**
     * Substitui placeholders no conteúdo do documento
     * 🆕 TORNADO PÚBLICO (v41) para ser usado pelo GovernanceController
     * 🆕 CORREÇÃO v41.2: Adicionado suporte para <NOME DO CLIENTE> e [NOME DO CLIENTE]
     * 🆕 CORREÇÃO v41.4: Adicionado suporte para HTML Entities e variações adicionais
     */
    replacePlaceholders(content, companyName) {
        if (!content)
            return content;
        const nameToUse = companyName || 'Empresa';
        return content
            .replace(/\[NOME DA EMPRESA\]/g, nameToUse)
            .replace(/\[NOME_DA_EMPRESA\]/g, nameToUse)
            .replace(/{{company_name}}/g, nameToUse)
            .replace(/{{COMPANY_NAME}}/g, nameToUse)
            // 🆕 ADICIONADO: Suporte para placeholder usado no conteúdo da política
            .replace(/<NOME DO CLIENTE>/g, nameToUse)
            .replace(/&lt;NOME DO CLIENTE&gt;/g, nameToUse)
            .replace(/\[NOME DO CLIENTE\]/g, nameToUse)
            .replace(/{{NOME_DO_CLIENTE}}/g, nameToUse)
            .replace(/NOME_DO_CLIENTE/g, nameToUse);
    }
    /**
     * Gera conteúdo para download em formato DOC
     */
    async generateDocContent(document, companyName) {
        let content = document.content;
        // Substituir placeholders
        content = this.replacePlaceholders(content, companyName);
        // Adicionar cabeçalho padrão
        const header = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; }
            h1 { font-size: 18pt; color: #1a1a2e; }
            h2 { font-size: 16pt; color: #16213e; }
            h3 { font-size: 14pt; color: #0f3460; }
            .header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 20px; }
            .footer { text-align: center; border-top: 1px solid #ccc; padding-top: 20px; margin-top: 20px; font-size: 10pt; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
    `;
        const footer = `
          <div class="footer">
            <p>${companyName} - Documento Oficial</p>
            <p>Código: ${document.code} | Versão: ${document.version}</p>
            <p>Data de emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;
        return header + content + footer;
    }
    /**
     * Gera conteúdo para download em formato PDF (HTML string formatado)
     */
    async generatePdfContent(document, companyName) {
        // Similar ao DOC, mas com estilos otimizados para PDF
        let content = document.content;
        content = this.replacePlaceholders(content, companyName);
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${document.code} - ${document.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              font-size: 11pt; 
              line-height: 1.5; 
              padding: 40px;
              color: #333;
            }
            .page-header {
              text-align: center;
              border-bottom: 3px solid #1a1a2e;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .page-header h1 { 
              font-size: 20pt; 
              color: #1a1a2e; 
              margin-bottom: 5px;
            }
            .page-header .subtitle {
              font-size: 12pt;
              color: #666;
            }
            .document-meta {
              display: flex;
              justify-content: space-between;
              background: #f8f9fa;
              padding: 10px 15px;
              border-radius: 5px;
              margin-bottom: 25px;
              font-size: 10pt;
            }
            h2 { 
              font-size: 16pt; 
              color: #16213e; 
              margin: 25px 0 15px 0;
              border-bottom: 2px solid #e9ecef;
              padding-bottom: 8px;
            }
            h3 { 
              font-size: 13pt; 
              color: #0f3460; 
              margin: 20px 0 10px 0;
            }
            h4 { 
              font-size: 11pt; 
              color: #1a1a2e; 
              margin: 15px 0 8px 0;
            }
            p { margin: 8px 0; text-align: justify; }
            ul, ol { margin: 10px 0 10px 20px; }
            li { margin: 5px 0; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0;
              font-size: 10pt;
            }
            th, td { 
              border: 1px solid #dee2e6; 
              padding: 8px 10px; 
              text-align: left; 
            }
            th { 
              background-color: #f1f3f5; 
              font-weight: bold;
            }
            .page-footer {
              text-align: center;
              border-top: 1px solid #dee2e6;
              padding-top: 15px;
              margin-top: 30px;
              font-size: 9pt;
              color: #6c757d;
            }
            .company-name {
              font-weight: bold;
              color: #1a1a2e;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 9pt;
              font-weight: bold;
            }
            .status-approved { background: #d4edda; color: #155724; }
            .status-draft { background: #fff3cd; color: #856404; }
            .status-review { background: #cce5ff; color: #004085; }
            .status-archived { background: #e2e3e5; color: #383d41; }
          </style>
        </head>
        <body>
          <div class="page-header">
            <h1>${document.code} - ${document.title}</h1>
            <div class="subtitle">${companyName}</div>
          </div>
          
          <div class="document-meta">
            <span><strong>Versão:</strong> ${document.version}</span>
            <span><strong>Status:</strong> <span class="status-badge status-${document.status}">${document.status.toUpperCase()}</span></span>
            <span><strong>Categoria:</strong> ${document.category}</span>
          </div>

          ${content}

          <div class="page-footer">
            <p>${companyName} - Documento Oficial</p>
            <p>Código: ${document.code} | Versão: ${document.version}</p>
            <p>Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * 🆕 MÉTODOS AUXILIARES DE EXPORTAÇÃO COMPATÍVEIS COM O GERADOR DE PDF REAL
     */
    async exportToPdfBuffer(document, companyName) {
        const htmlContent = await this.generatePdfContent(document, companyName);
        return await PDFService_1.PDFService.generateFromHtml(htmlContent);
    }
}
exports.DocumentExportService = DocumentExportService;
//# sourceMappingURL=DocumentExportService.js.map
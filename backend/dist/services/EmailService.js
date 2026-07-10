"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
// backend/src/services/EmailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_js_1 = require("../utils/logger.js");
const env_js_1 = require("../config/env.js");
class EmailService {
    transporter = null;
    constructor() {
        this.initTransporter();
    }
    initTransporter() {
        try {
            // Verificar se as variáveis OAuth2 estão configuradas
            if (!env_js_1.config.GOOGLE_CLIENT_ID || !env_js_1.config.GOOGLE_CLIENT_SECRET || !env_js_1.config.GOOGLE_REFRESH_TOKEN) {
                logger_js_1.logger.warn('⚠️ Variáveis OAuth2 do Google não configuradas. E-mails não serão enviados.');
                return;
            }
            this.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: env_js_1.config.SMTP_USER || 'codeassessment@gmail.com',
                    clientId: env_js_1.config.GOOGLE_CLIENT_ID,
                    clientSecret: env_js_1.config.GOOGLE_CLIENT_SECRET,
                    refreshToken: env_js_1.config.GOOGLE_REFRESH_TOKEN,
                },
            });
            logger_js_1.logger.info('📧 Serviço de e-mail OAuth2 inicializado com sucesso');
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao inicializar serviço de e-mail:', error);
        }
    }
    async sendEmail(options) {
        try {
            if (!this.transporter) {
                logger_js_1.logger.warn('⚠️ Transporter não inicializado. E-mail não enviado.');
                return false;
            }
            const mailOptions = {
                from: env_js_1.config.SMTP_FROM || 'Code_Assessment <codeassessment@gmail.com>',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || '',
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_js_1.logger.info(`📧 E-mail enviado para ${options.to}: ${info.messageId}`);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error(`❌ Erro ao enviar e-mail para ${options.to}:`, error);
            return false;
        }
    }
    /**
     * Envia e-mail para o usuário sobre solicitação de revisão
     */
    async sendReviewRequestEmail(params) {
        const { to, userName, controlName, controlId, repName, justification, companyName, loginLink } = params;
        const subject = `📋 Solicitação de Revisão - Controle ${controlId}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .header { background: #1a56db; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .highlight { background: #f0f4ff; padding: 15px; border-left: 4px solid #1a56db; margin: 15px 0; border-radius: 4px; }
          .button { display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 Solicitação de Revisão</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>O preposto <strong>${repName}</strong> da empresa <strong>${companyName}</strong> solicitou uma revisão da sua resposta para o controle:</p>
            
            <div class="highlight">
              <p><strong>Controle:</strong> ${controlId} - ${controlName}</p>
              <p><strong>Justificativa:</strong> ${justification}</p>
            </div>
            
            <p>Por favor, acesse o sistema para visualizar a solicitação e, se necessário, ajustar sua resposta.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" class="button">🔐 Acessar o Sistema</a>
            </p>
            
            <p><strong>Link alternativo:</strong> ${loginLink}</p>
            
            <p>Atenciosamente,<br><strong>Equipe Code_Assessment</strong></p>
          </div>
          <div class="footer">
            <p>Este é um e-mail automático. Por favor, não responda.</p>
            <p>© ${new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
Solicitação de Revisão - Controle ${controlId}

Olá ${userName},

O preposto ${repName} da empresa ${companyName} solicitou uma revisão da sua resposta para o controle:

Controle: ${controlId} - ${controlName}
Justificativa: ${justification}

Acesse o sistema para visualizar e ajustar sua resposta:
${loginLink}

Atenciosamente,
Equipe Code_Assessment
    `;
        return this.sendEmail({ to, subject, html, text });
    }
    /**
     * Envia e-mail para o preposto sobre conclusão da revisão
     */
    async sendReviewCompletedEmail(params) {
        const { to, repName, userName, controlName, controlId, status, statusLabel, reviewNotes, companyName, loginLink } = params;
        const statusColor = status === 'approved' ? '#16a34a' : '#dc2626';
        const statusEmoji = status === 'approved' ? '✅' : '❌';
        const subject = `${statusEmoji} Revisão Concluída - Controle ${controlId}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .header { background: #1a56db; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; color: white; background: ${statusColor}; }
          .highlight { background: #f0f4ff; padding: 15px; border-left: 4px solid #1a56db; margin: 15px 0; border-radius: 4px; }
          .button { display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${statusEmoji} Revisão Concluída</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${repName}</strong>,</p>
            <p>A revisão da resposta do usuário <strong>${userName}</strong> para o controle foi concluída:</p>
            
            <div class="highlight">
              <p><strong>Controle:</strong> ${controlId} - ${controlName}</p>
              <p><strong>Empresa:</strong> ${companyName}</p>
              <p><strong>Status:</strong> <span class="status-badge">${statusLabel}</span></p>
              ${reviewNotes ? `<p><strong>Observações:</strong> ${reviewNotes}</p>` : ''}
            </div>
            
            <p>Para mais detalhes, acesse o sistema:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" class="button">🔐 Acessar o Sistema</a>
            </p>
            
            <p><strong>Link alternativo:</strong> ${loginLink}</p>
            
            <p>Atenciosamente,<br><strong>Equipe Code_Assessment</strong></p>
          </div>
          <div class="footer">
            <p>Este é um e-mail automático. Por favor, não responda.</p>
            <p>© ${new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
${statusEmoji} Revisão Concluída - Controle ${controlId}

Olá ${repName},

A revisão da resposta do usuário ${userName} foi concluída:

Controle: ${controlId} - ${controlName}
Empresa: ${companyName}
Status: ${statusLabel}
${reviewNotes ? `Observações: ${reviewNotes}` : ''}

Acesse o sistema para mais detalhes:
${loginLink}

Atenciosamente,
Equipe Code_Assessment
    `;
        return this.sendEmail({ to, subject, html, text });
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=EmailService.js.map
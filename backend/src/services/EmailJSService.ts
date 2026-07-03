// backend/src/services/EmailJSService.ts
// 🔴 CORRIGIDO: Usando require para compatibilidade com tipos
const emailjs = require('@emailjs/nodejs');
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateParams?: Record<string, any>;
}

export class EmailJSService {
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const publicKey = process.env.EMAILJS_PUBLIC_KEY;
      const privateKey = process.env.EMAILJS_PRIVATE_KEY;

      if (!publicKey || !privateKey) {
        logger.warn('⚠️ EmailJS credenciais não configuradas. E-mails não serão enviados.');
        return;
      }

      emailjs.init({
        publicKey: publicKey,
        privateKey: privateKey,
      });

      this.initialized = true;
      logger.info('📧 Serviço de e-mail EmailJS inicializado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao inicializar EmailJS:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.initialized) {
        logger.warn('⚠️ EmailJS não inicializado. E-mail não enviado.');
        return false;
      }

      const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_1rgfisk';
      const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_Sygc3ia';

      const userName = options.templateParams?.user_name || 
                       options.to.split('@')[0] || 
                       'Usuário';

      const templateParams = {
        to_email: options.to,
        subject: options.subject,
        user_name: userName,
        title: options.subject,
        message: options.text || options.html.replace(/<[^>]*>/g, '').substring(0, 500),
        link: options.templateParams?.link || process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com',
        ...options.templateParams,
      };

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      logger.info(`📧 E-mail enviado para ${options.to} via EmailJS: ${response.status}`);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao enviar e-mail para ${options.to} via EmailJS:`, error);
      return false;
    }
  }

  /**
   * Envia e-mail de notificação para o usuário
   */
  async sendNotificationEmail(params: {
    to: string;
    userName: string;
    title: string;
    message: string;
    link: string;
  }): Promise<boolean> {
    const { to, userName, title, message, link } = params;

    return this.sendEmail({
      to,
      subject: title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .header { background: #1a56db; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .notification-box { background: #f0f4ff; padding: 15px; border-left: 4px solid #1a56db; margin: 15px 0; border-radius: 4px; }
            .button { display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${title}</h2>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <div class="notification-box">
                <p>${message}</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${link}" class="button">🔐 Acessar o Sistema</a>
              </p>
              <p><strong>Link alternativo:</strong> ${link}</p>
              <p>Atenciosamente,<br><strong>Equipe Code_Assessment</strong></p>
            </div>
            <div class="footer">
              <p>Este é um e-mail automático. Por favor, não responda.</p>
              <p>© ${new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${title}\n\nOlá ${userName},\n\n${message}\n\nAcesse o sistema: ${link}\n\nAtenciosamente,\nEquipe Code_Assessment`,
      templateParams: {
        user_name: userName,
        link,
      },
    });
  }
}

export const emailjsService = new EmailJSService();
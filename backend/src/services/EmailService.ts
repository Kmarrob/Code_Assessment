// backend/src/services/EmailService.ts
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    try {
      // Verificar se as variáveis OAuth2 estão configuradas
      if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_REFRESH_TOKEN) {
        logger.warn('⚠️ Variáveis OAuth2 do Google não configuradas. E-mails não serão enviados.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: config.SMTP_USER || 'codeassessment@gmail.com',
          clientId: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          refreshToken: config.GOOGLE_REFRESH_TOKEN,
        },
      });

      logger.info('📧 Serviço de e-mail OAuth2 inicializado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao inicializar serviço de e-mail:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('⚠️ Transporter não inicializado. E-mail não enviado.');
        return false;
      }

      const mailOptions = {
        from: config.SMTP_FROM || 'Code_Assessment <codeassessment@gmail.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 E-mail enviado para ${options.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao enviar e-mail para ${options.to}:`, error);
      return false;
    }
  }
}

export const emailService = new EmailService();
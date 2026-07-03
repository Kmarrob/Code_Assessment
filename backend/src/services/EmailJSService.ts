// backend/src/services/EmailJSService.ts
// 🔴 CORRIGIDO: Usando fetch diretamente para a API REST do EmailJS
import { logger } from '../utils/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  message?: string; // 🔴 ADICIONADO
  templateParams?: Record<string, any>;
}

export class EmailJSService {
  private initialized: boolean = false;
  private publicKey: string = '';
  private privateKey: string = '';
  private serviceId: string = '';
  private templateId: string = '';

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
      this.privateKey = process.env.EMAILJS_PRIVATE_KEY || '';
      this.serviceId = process.env.EMAILJS_SERVICE_ID || 'service_1rgfisk';
      this.templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_5ygc3ia';

      if (!this.publicKey || !this.privateKey) {
        logger.warn('⚠️ EmailJS credenciais não configuradas. E-mails não serão enviados.');
        return;
      }

      this.initialized = true;
      logger.info('📧 Serviço de e-mail EmailJS inicializado com sucesso (modo API REST)');
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

      const userName = options.templateParams?.user_name || 
                       options.to.split('@')[0] || 
                       'Usuário';

      // 🔴 CORRIGIDO: Extrair apenas a mensagem pura, sem HTML
      let plainMessage = options.message || options.text || '';
      if (!plainMessage && options.html) {
        // Remover tags HTML para obter texto puro
        plainMessage = options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        // Limitar tamanho
        if (plainMessage.length > 500) {
          plainMessage = plainMessage.substring(0, 497) + '...';
        }
      }

      const templateParams = {
        to_email: options.to,
        subject: options.subject,
        user_name: userName,
        title: options.subject,
message: options.templateParams?.message || options.text || options.message || 'Nova notificação do sistema',
        link: options.templateParams?.link || process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com',
        ...options.templateParams,
      };

      // Chamada direta para a API REST do EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: this.templateId,
          user_id: this.publicKey,
          accessToken: this.privateKey,
          template_params: templateParams,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
      }

      logger.info(`📧 E-mail enviado para ${options.to} via EmailJS API`);
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
      html: '', // Não usado diretamente, mas mantido para compatibilidade
      text: message,
      message: message, // 🔴 ADICIONADO
      templateParams: {
        user_name: userName,
        message: message,
        link: link,
      },
    });
  }
}

export const emailjsService = new EmailJSService();
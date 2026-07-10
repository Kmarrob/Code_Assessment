"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailjsService = exports.EmailJSService = void 0;
// backend/src/services/EmailJSService.ts
// 🔴 CORRIGIDO: Usando fetch diretamente para a API REST do EmailJS
const logger_js_1 = require("../utils/logger.js");
class EmailJSService {
    initialized = false;
    publicKey = '';
    privateKey = '';
    serviceId = '';
    templateId = '';
    // 🔴 NOVO: Mapeamento de templates por tipo
    TEMPLATES = {
        passwordReset: 'template_gtiajs9',
        notification: 'template_z5s5xnf',
    };
    constructor() {
        this.init();
    }
    init() {
        try {
            this.publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
            this.privateKey = process.env.EMAILJS_PRIVATE_KEY || '';
            this.serviceId = process.env.EMAILJS_SERVICE_ID || 'service_1rgfisk';
            if (!this.publicKey || !this.privateKey) {
                logger_js_1.logger.warn('⚠️ EmailJS credenciais não configuradas. E-mails não serão enviados.');
                return;
            }
            this.initialized = true;
            logger_js_1.logger.info('📧 Serviço de e-mail EmailJS inicializado com sucesso (modo API REST)');
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao inicializar EmailJS:', error);
        }
    }
    async sendEmail(options) {
        try {
            if (!this.initialized) {
                logger_js_1.logger.warn('⚠️ EmailJS não inicializado. E-mail não enviado.');
                return false;
            }
            // 🔴 CORRIGIDO: Usar templateId do options ou o padrão
            const templateId = options.templateParams?.templateId || this.templateId || this.TEMPLATES.notification;
            const userName = options.templateParams?.user_name ||
                options.to.split('@')[0] ||
                'Usuário';
            const templateParams = {
                to_email: options.to,
                subject: options.templateParams?.subject || options.subject,
                user_name: userName,
                title: options.templateParams?.title || options.subject,
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
                    template_id: templateId,
                    user_id: this.publicKey,
                    accessToken: this.privateKey,
                    template_params: templateParams,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
            }
            logger_js_1.logger.info(`📧 E-mail enviado para ${options.to} via EmailJS API (template: ${templateId})`);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error(`❌ Erro ao enviar e-mail para ${options.to} via EmailJS:`, error);
            return false;
        }
    }
    /**
     * Envia e-mail de redefinição de senha / primeiro acesso
     */
    async sendPasswordResetEmail(params) {
        const { to, userName, userEmail, resetLink, expiryTime = '24 horas' } = params;
        return this.sendEmail({
            to,
            subject: '🔐 Redefina sua senha - Code_Assessment',
            html: '',
            text: `Olá ${userName},\n\nSua conta foi criada no Code_Assessment. Acesse o link para definir sua senha:\n${resetLink}`,
            message: `Sua conta foi criada no Code_Assessment. Clique no botão para definir sua senha.`,
            templateParams: {
                templateId: this.TEMPLATES.passwordReset,
                user_name: userName,
                user_email: userEmail,
                reset_link: resetLink,
                expiry_time: expiryTime,
                subject: '🔐 Redefina sua senha - Code_Assessment',
            },
        });
    }
    /**
     * Envia e-mail de notificação geral
     */
    async sendNotificationEmail(params) {
        const { to, userName, title, message, link, emoji = '📬', detailLabel, detailValue, badgeLabel = '🔔 Notificação', badgeClass = 'badge-info' } = params;
        return this.sendEmail({
            to,
            subject: title,
            html: '',
            text: message,
            message: message,
            templateParams: {
                templateId: this.TEMPLATES.notification,
                user_name: userName,
                header_title: title,
                emoji: emoji,
                message: message,
                link: link,
                subject: title,
                detail_label: detailLabel || '',
                detail_value: detailValue || '',
                badge_label: badgeLabel,
                badge_class: badgeClass,
            },
        });
    }
}
exports.EmailJSService = EmailJSService;
exports.emailjsService = new EmailJSService();
//# sourceMappingURL=EmailJSService.js.map
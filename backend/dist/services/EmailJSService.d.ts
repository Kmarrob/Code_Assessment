interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    message?: string;
    templateParams?: Record<string, any>;
}
export declare class EmailJSService {
    private initialized;
    private publicKey;
    private privateKey;
    private serviceId;
    private templateId;
    private readonly TEMPLATES;
    constructor();
    private init;
    sendEmail(options: EmailOptions): Promise<boolean>;
    /**
     * Envia e-mail de redefinição de senha / primeiro acesso
     */
    sendPasswordResetEmail(params: {
        to: string;
        userName: string;
        userEmail: string;
        resetLink: string;
        expiryTime?: string;
    }): Promise<boolean>;
    /**
     * Envia e-mail de notificação geral
     */
    sendNotificationEmail(params: {
        to: string;
        userName: string;
        title: string;
        message: string;
        link: string;
        emoji?: string;
        detailLabel?: string;
        detailValue?: string;
        badgeLabel?: string;
        badgeClass?: string;
    }): Promise<boolean>;
}
export declare const emailjsService: EmailJSService;
export {};
//# sourceMappingURL=EmailJSService.d.ts.map
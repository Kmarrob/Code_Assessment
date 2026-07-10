interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    constructor();
    private initTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
    /**
     * Envia e-mail para o usuário sobre solicitação de revisão
     */
    sendReviewRequestEmail(params: {
        to: string;
        userName: string;
        controlName: string;
        controlId: string;
        repName: string;
        justification: string;
        companyName: string;
        loginLink: string;
    }): Promise<boolean>;
    /**
     * Envia e-mail para o preposto sobre conclusão da revisão
     */
    sendReviewCompletedEmail(params: {
        to: string;
        repName: string;
        userName: string;
        controlName: string;
        controlId: string;
        status: 'approved' | 'rejected';
        statusLabel: string;
        reviewNotes?: string;
        companyName: string;
        loginLink: string;
    }): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=EmailService.d.ts.map
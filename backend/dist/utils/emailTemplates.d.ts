interface ReviewRequestEmailData {
    userName: string;
    controlName: string;
    controlId: string;
    justification: string;
    repName: string;
    reviewId: string;
    link: string;
}
interface ReviewStatusEmailData {
    userName: string;
    controlName: string;
    controlId: string;
    status: 'approved' | 'rejected';
    repName: string;
    justification?: string;
    link: string;
}
export declare const emailTemplates: {
    /**
     * Template para notificar o usuário sobre uma solicitação de revisão
     */
    reviewRequested: (data: ReviewRequestEmailData) => string;
    /**
     * Template para notificar o preposto sobre a conclusão da revisão
     */
    reviewCompleted: (data: ReviewStatusEmailData) => string;
};
export {};
//# sourceMappingURL=emailTemplates.d.ts.map
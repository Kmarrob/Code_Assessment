interface PDFData {
    report: any;
    resultados: any;
    matrix: any[];
    roadmap: any;
    recomendacoes: any[];
    branding: any;
    user: {
        name: string;
        email: string;
    };
    companyName: string;
    generatedAt: string;
}
export declare class PDFService {
    /**
     * Gera o PDF do relatório usando Puppeteer
     */
    static generateReportPDF(data: PDFData): Promise<Buffer>;
    /**
     * Gera o HTML do relatório para o PDF
     */
    private static generateReportHTML;
    /**
     * Gera um PDF a partir de conteúdo HTML genérico
     * @param html - Conteúdo HTML para renderizar
     * @param options - Opções adicionais (formato, margens, etc.)
     * @returns Buffer do PDF
     */
    static generateFromHtml(html: string, options?: {
        format?: 'A4' | 'A3' | 'Letter';
        landscape?: boolean;
        margin?: {
            top: string;
            bottom: string;
            left: string;
            right: string;
        };
        headerTemplate?: string;
        footerTemplate?: string;
        displayHeaderFooter?: boolean;
    }): Promise<Buffer>;
}
export {};
//# sourceMappingURL=PDFService.d.ts.map
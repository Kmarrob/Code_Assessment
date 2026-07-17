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
}
export {};
//# sourceMappingURL=PDFService.d.ts.map
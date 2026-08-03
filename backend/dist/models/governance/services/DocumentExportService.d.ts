import { IGovernanceDocument } from '../models/GovernanceDocument';
export declare class DocumentExportService {
    /**
     * Substitui placeholders no conteúdo do documento
     * 🆕 TORNADO PÚBLICO (v41) para ser usado pelo GovernanceController
     */
    replacePlaceholders(content: string, companyName: string): string;
    /**
     * Gera conteúdo para download em formato DOC
     */
    generateDocContent(document: IGovernanceDocument, companyName: string): Promise<string>;
    /**
     * Gera conteúdo para download em formato PDF
     */
    generatePdfContent(document: IGovernanceDocument, companyName: string): Promise<string>;
}
//# sourceMappingURL=DocumentExportService.d.ts.map
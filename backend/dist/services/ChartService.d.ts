export declare class ChartService {
    /**
     * Gera um gráfico de pizza como imagem PNG
     * 🔴 Tamanho ajustado: 450x300 (era 500x350)
     */
    static generatePieChart(data: Array<{
        name: string;
        value: number;
        color: string;
    }>, width?: number, height?: number): Buffer;
    /**
     * Gera um gráfico de barras como imagem PNG
     * 🔴 Tamanho ajustado: 450x300 (era 500x350)
     */
    static generateBarChart(data: Array<{
        name: string;
        value: number;
        color: string;
    }>, width?: number, height?: number, title?: string): Buffer;
    /**
     * Gera um gráfico radar como imagem PNG
     * 🔴 Tamanho ajustado: 550x400 (era 600x450)
     */
    static generateRadarChart(data: Array<{
        subject: string;
        Implementado: number;
        Recomendado: number;
    }>, width?: number, height?: number): Buffer;
}
//# sourceMappingURL=ChartService.d.ts.map
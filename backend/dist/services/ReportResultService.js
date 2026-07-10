"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportResultService = void 0;
// backend/src/services/ReportResultService.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Response_js_1 = require("../models/Response.js");
const Assignment_js_1 = require("../models/Assignment.js");
const User_js_1 = require("../models/User.js");
const Company_js_1 = require("../models/Company.js");
const logger_js_1 = require("../utils/logger.js");
// ============================================
// CONSTANTES
// ============================================
// Categorias de controles (4 temas)
const CATEGORIES = [
    { key: 'Controles Organizacionais', label: 'Controles Organizacionais', altKeys: ['Organizacionais'] },
    { key: 'Controles de Pessoas', label: 'Controles de Pessoas', altKeys: ['Pessoas'] },
    { key: 'Controles Físicos', label: 'Controles Físicos', altKeys: ['Físicos'] },
    { key: 'Controles Tecnológicos', label: 'Controles Tecnológicos', altKeys: ['Tecnológicos'] },
];
// Capacidades Operacionais (15 capacidades)
const CAPABILITIES = [
    { key: 'Governança', label: 'Governança', altKeys: ['Governança', 'Governança_e_ecossistema'] },
    { key: 'Gestão de ativos', label: 'Gestão de Ativos', altKeys: ['Gestão de ativos', 'Gestão_de_ativos'] },
    { key: 'Proteção da informação', label: 'Proteção da Informação', altKeys: ['Proteção da informação', 'Proteção_da_informação'] },
    { key: 'Gestão de identidade e acesso', label: 'Gestão de Identidade e Acesso', altKeys: ['Gestão de identidade e acesso', 'Gestão_de_identidade_e_acesso'] },
    { key: 'Segurança nas relações com fornecedores', label: 'Segurança nas Relações com Fornecedores', altKeys: ['Segurança nas relações com fornecedores', 'Segurança_nas_relações_com_fornecedores'] },
    { key: 'Gestão de evento de segurança da informação', label: 'Gestão de Eventos de SI', altKeys: ['Gestão de incidentes', 'Gestão de eventos de SI', 'Gestão_de_evento_de_segurança_da_informação'] },
    { key: 'Gestão de ameaças e vulnerabilidades', label: 'Gestão de Ameaças e Vulnerabilidades', altKeys: ['Gestão de ameaças e vulnerabilidades', 'Gestão_de_ameaças_e_vulnerabilidades'] },
    { key: 'Gestão de continuidade do negócio', label: 'Gestão de Continuidade do Negócio', altKeys: ['Gestão de continuidade', 'Continuidade', 'Gestão_de_continuidade_do_negócio'] },
    { key: 'Segurança física', label: 'Segurança Física', altKeys: ['Segurança física', 'Segurança_física'] },
    { key: 'Desenvolvimento seguro', label: 'Desenvolvimento Seguro', altKeys: ['Desenvolvimento seguro', 'Segurança de aplicações', 'Segurança_de_aplicações'] },
    { key: 'Segurança de redes', label: 'Segurança de Redes', altKeys: ['Gestão de redes', 'Segurança de sistemas e rede', 'Segurança_de_sistemas_e_rede', 'Segurança de sistemas'] },
    { key: 'Monitoramento e análise', label: 'Monitoramento e Análise', altKeys: ['Monitoramento e análise', 'Monitoramento_e_análise'] },
    { key: 'Gestão de pessoas', label: 'Segurança em Recursos Humanos', altKeys: ['Gestão de pessoas', 'Segurança em recursos humanos', 'Segurança_em_recursos_humanos'] },
    { key: 'Gestão de criptografia', label: 'Gestão de Criptografia', altKeys: ['Gestão de criptografia', 'Gestão_de_criptografia'] },
    { key: 'Garantia de segurança da informação', label: 'Garantia de SI', altKeys: ['Garantia de SI', 'Garantia de segurança da informação', 'Garantia_de_segurança_da_informação'] },
];
// ============================================
// SERVIÇO
// ============================================
class ReportResultService {
    /**
     * Obter todos os dados de resultados consolidados
     */
    static async getResultadosData(companyId) {
        try {
            logger_js_1.logger.info(`📊 Buscando dados de resultados para empresa: ${companyId}`);
            // 🔴 CORREÇÃO: Buscar empresa para obter o nome
            const company = await Company_js_1.Company.findById(companyId);
            if (!company) {
                logger_js_1.logger.warn(`⚠️ Empresa não encontrada: ${companyId}`);
                return this.getEmptyResultadosData();
            }
            // 🔴 CORREÇÃO: Buscar usuários usando a mesma lógica do DashboardService
            const userFilter = {
                $or: [
                    { companyId: new mongoose_1.default.Types.ObjectId(companyId) },
                    { company: company.name } // Fallback: busca pelo nome da empresa
                ],
                isActive: true
            };
            const users = await User_js_1.User.find(userFilter).select('_id');
            const userIds = users.map(u => u._id);
            logger_js_1.logger.info(`📊 Usuários encontrados: ${users.length}`);
            if (userIds.length === 0) {
                logger_js_1.logger.warn(`⚠️ Nenhum usuário encontrado para a empresa ${companyId}`);
                return this.getEmptyResultadosData();
            }
            // 🔴 CORREÇÃO: Buscar atribuições por userId (NÃO por companyId)
            const assignments = await Assignment_js_1.Assignment.find({
                userId: { $in: userIds }
            }).populate('controlId').lean();
            logger_js_1.logger.info(`📊 Atribuições encontradas: ${assignments.length}`);
            if (assignments.length === 0) {
                logger_js_1.logger.warn(`⚠️ Nenhuma atribuição encontrada para a empresa ${companyId}`);
                return this.getEmptyResultadosData();
            }
            // 🔴 CORREÇÃO: Buscar respostas por userId
            const responses = await Response_js_1.Response.find({
                userId: { $in: userIds }
            }).lean();
            logger_js_1.logger.info(`📊 Respostas encontradas: ${responses.length}`);
            // Criar mapa de respostas por assignmentId
            const responseMap = new Map();
            responses.forEach(r => {
                responseMap.set(r.assignmentId.toString(), r);
            });
            // Construir dados dos controles com status
            const controlsWithStatus = assignments.map(a => {
                const response = responseMap.get(a._id.toString());
                const control = a.controlId;
                let status = 'Não implementado';
                let maturityLevel = 0;
                if (response) {
                    const level = response.maturityLevel;
                    if (level === 2 || level === '2') {
                        status = 'Implementado';
                        maturityLevel = 2;
                    }
                    else if (level === 1 || level === '1') {
                        status = 'Parcialmente implementado';
                        maturityLevel = 1;
                    }
                    else if (level === 0 || level === '0') {
                        status = 'Não implementado';
                        maturityLevel = 0;
                    }
                    else if (level === -1 || level === '-1' || level === 'N/A') {
                        status = 'Não se aplica';
                        maturityLevel = -1;
                    }
                }
                return {
                    ...control,
                    status,
                    maturityLevel,
                    response,
                    assignment: a,
                };
            });
            // 🔴 CORREÇÃO: Usar apenas os controles que têm atribuições
            const uniqueControls = controlsWithStatus.filter(c => c._id);
            logger_js_1.logger.info(`📊 Controles únicos encontrados: ${uniqueControls.length}`);
            // Calcular categorização
            const categorizacao = await this.calculateCategorization(uniqueControls);
            // Calcular capacidades operacionais
            const capacidades = await this.calculateCapabilities(uniqueControls);
            logger_js_1.logger.info(`✅ Dados de resultados calculados com sucesso`);
            return {
                categorizacao,
                capacidades,
            };
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao buscar dados de resultados:', error);
            throw error;
        }
    }
    /**
     * Retornar dados vazios
     */
    static getEmptyResultadosData() {
        return {
            categorizacao: {
                categories: CATEGORIES.map(cat => ({
                    name: cat.label,
                    total: 0,
                    implemented: 0,
                    partial: 0,
                    notImpl: 0,
                    na: 0,
                    pImpl: 0,
                    pPartial: 0,
                    pNot: 0,
                    pNa: 0,
                })),
                totals: { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 },
            },
            capacidades: {
                capabilities: CAPABILITIES.map(cap => ({
                    name: cap.label,
                    key: cap.key,
                    total: 0,
                    implemented: 0,
                    partial: 0,
                    notImpl: 0,
                    aderente: 0,
                    naoAderente: 0,
                })),
                totals: { implemented: 0, partial: 0, notImpl: 0, total: 0 },
                totalAderente: 0,
                totalNaoAderente: 0,
                radarData: [],
            },
        };
    }
    /**
     * Calcular dados de categorização (4 temas)
     */
    static async calculateCategorization(controls) {
        const categoryData = CATEGORIES.map(cat => {
            // Filtrar controles que pertencem à categoria
            const filtered = controls.filter(c => {
                const tipos = c.tiposDeControles || c.tipoDeControle || [];
                let tiposArray = Array.isArray(tipos) ? tipos : [tipos];
                const allKeys = [cat.key, ...(cat.altKeys || [])];
                return tiposArray.some((t) => allKeys.includes(t));
            });
            const total = filtered.length;
            const implemented = filtered.filter(c => c.status === 'Implementado').length;
            const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
            const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
            const na = filtered.filter(c => c.status === 'Não se aplica').length;
            return {
                name: cat.label,
                total,
                implemented,
                partial,
                notImpl,
                na,
                pImpl: total > 0 ? Math.round((implemented / total) * 100) : 0,
                pPartial: total > 0 ? Math.round((partial / total) * 100) : 0,
                pNot: total > 0 ? Math.round((notImpl / total) * 100) : 0,
                pNa: total > 0 ? Math.round((na / total) * 100) : 0,
            };
        });
        const totals = categoryData.reduce((acc, c) => ({
            implemented: acc.implemented + c.implemented,
            partial: acc.partial + c.partial,
            notImpl: acc.notImpl + c.notImpl,
            na: acc.na + c.na,
            total: acc.total + c.total,
        }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });
        return { categories: categoryData, totals };
    }
    /**
     * Calcular dados de capacidades operacionais (15 capacidades)
     */
    static async calculateCapabilities(controls) {
        const capData = CAPABILITIES.map(cap => {
            // Filtrar controles que pertencem à capacidade
            const filtered = controls.filter(c => {
                const capacidades = c.capacidadesOperacionais || [];
                if (!Array.isArray(capacidades))
                    return false;
                const allKeys = [cap.key, ...(cap.altKeys || [])];
                return capacidades.some((capStr) => {
                    const cleanStr = capStr.replace(/#/g, '').trim();
                    return allKeys.includes(cleanStr) ||
                        allKeys.map(k => k.replace(/ /g, '_')).includes(cleanStr);
                });
            });
            const total = filtered.length;
            const implemented = filtered.filter(c => c.status === 'Implementado').length;
            const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
            const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
            const na = filtered.filter(c => c.status === 'Não se aplica').length;
            const totalValidos = total - na;
            const aderente = totalValidos > 0 ? Math.round((implemented / totalValidos) * 100) : 0;
            const naoAderente = totalValidos > 0 ? Math.round(((partial + notImpl) / totalValidos) * 100) : 0;
            return {
                name: cap.label,
                key: cap.key,
                total: totalValidos,
                implemented,
                partial,
                notImpl,
                aderente,
                naoAderente,
            };
        });
        const totals = capData.reduce((acc, c) => ({
            implemented: acc.implemented + c.implemented,
            partial: acc.partial + c.partial,
            notImpl: acc.notImpl + c.notImpl,
            total: acc.total + c.total,
        }), { implemented: 0, partial: 0, notImpl: 0, total: 0 });
        const totalAderente = totals.total > 0 ? Math.round((totals.implemented / totals.total) * 100) : 0;
        const totalNaoAderente = totals.total > 0 ? Math.round(((totals.partial + totals.notImpl) / totals.total) * 100) : 0;
        // Dados para o gráfico Radar
        const radarData = capData.map(c => ({
            subject: c.name.length > 28 ? c.name.substring(0, 28) + '…' : c.name,
            fullLabel: c.name,
            Implementado: c.aderente,
            Recomendado: 100,
        }));
        return {
            capabilities: capData,
            totals,
            totalAderente,
            totalNaoAderente,
            radarData,
        };
    }
}
exports.ReportResultService = ReportResultService;
exports.default = ReportResultService;
//# sourceMappingURL=ReportResultService.js.map
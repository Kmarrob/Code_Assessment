"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Assignment_js_1 = require("../models/Assignment.js");
const Response_js_1 = require("../models/Response.js");
const Control_js_1 = require("../models/Control.js");
const User_js_1 = require("../models/User.js");
const Company_js_1 = require("../models/Company.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class DashboardService {
    /**
     * Obter dados de maturidade de uma empresa - CORRIGIDO
     */
    static async getCompanyMaturity(companyId, filters) {
        // Verificar se a empresa existe
        const company = await Company_js_1.Company.findById(companyId);
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        // ============================================
        // CORREÇÃO: Buscar usuários por companyId OU pelo nome da empresa
        // ============================================
        const userFilter = {
            $or: [
                { companyId: new mongoose_1.default.Types.ObjectId(companyId) },
                { company: company.name } // Fallback: busca pelo nome da empresa
            ],
            isActive: true
        };
        if (filters?.userId) {
            userFilter._id = new mongoose_1.default.Types.ObjectId(filters.userId);
        }
        const users = await User_js_1.User.find(userFilter).select('_id');
        const userIds = users.map(u => u._id);
        // Logs adicionados estrategicamente após a resolução dos usuários e IDs
        console.log('🔍 DashboardService - companyId:', companyId);
        console.log('🔍 DashboardService - company.name:', company.name);
        console.log('🔍 DashboardService - users encontrados:', users.length);
        console.log('🔍 DashboardService - userIds:', userIds);
        if (userIds.length === 0) {
            return this.getEmptyMaturityData();
        }
        // Buscar todas as atribuições dos usuários
        const assignments = await Assignment_js_1.Assignment.find({
            userId: { $in: userIds }
        }).populate('controlId').lean();
        // Buscar todas as respostas dos usuários
        const responses = await Response_js_1.Response.find({
            userId: { $in: userIds }
        }).lean();
        // Logs adicionados após a busca de assignments e responses
        console.log('🔍 DashboardService - assignments encontrados:', assignments.length);
        console.log('🔍 DashboardService - responses encontrados:', responses.length);
        // Criar mapa de respostas por assignmentId
        const responseMap = new Map();
        responses.forEach(r => {
            responseMap.set(r.assignmentId.toString(), r);
        });
        // Extrair IDs dos controles únicos das atribuições
        const assignedControlIds = new Set();
        assignments.forEach(a => {
            const control = a.controlId;
            if (control?._id) {
                assignedControlIds.add(control._id.toString());
            }
        });
        // Buscar os controles completos que estão atribuídos
        const allControls = await Control_js_1.Control.find({
            _id: { $in: Array.from(assignedControlIds) }
        }).lean();
        // Mapear status de cada controle com base nas respostas
        const controlsWithStatus = assignments.map(a => {
            const response = responseMap.get(a._id.toString());
            const control = a.controlId;
            let status = 'Não implementado';
            if (response) {
                switch (response.maturityLevel) {
                    case '2':
                        status = 'Implementado';
                        break;
                    case '1':
                        status = 'Parcialmente implementado';
                        break;
                    case '0':
                        status = 'Não implementado';
                        break;
                    case 'N/A':
                        status = 'Não se aplica';
                        break;
                    default:
                        status = 'Não implementado';
                }
            }
            return {
                controlId: control?._id,
                control: control,
                status: status,
                maturityLevel: response?.maturityLevel || null,
                response: response || null,
                assignedBy: a.assignedBy,
                assignedAt: a.assignedAt,
            };
        });
        // Mapear status para todos os controles
        const controlStatusMap = new Map();
        allControls.forEach(c => {
            const assigned = controlsWithStatus.find(a => a.controlId?.toString() === c._id.toString());
            controlStatusMap.set(c._id.toString(), {
                control: c,
                status: assigned?.status || 'Não implementado',
                maturityLevel: assigned?.maturityLevel || null,
                response: assigned?.response || null,
            });
        });
        const controls = Array.from(controlStatusMap.values());
        // Logs adicionados antes do cálculo estatístico final
        console.log('🔍 DashboardService - assignedControlIds encontrados:', assignedControlIds.size);
        console.log('🔍 DashboardService - allControls encontrados:', allControls.length);
        console.log('🔍 DashboardService - controls finais:', controls.length);
        const summary = this.calculateMaturityStats({ controls });
        return {
            company: {
                id: company._id,
                name: company.name,
            },
            summary: {
                totalControls: controls.length,
                Implementado: summary.statusCounts.Implementado || 0,
                Parcialmente: summary.statusCounts['Parcialmente implementado'] || 0,
                NaoImplementado: summary.statusCounts['Não implementado'] || 0,
                NaoSeAplica: summary.statusCounts['Não se aplica'] || 0,
                percentages: summary.percentages,
                maturityLevels: summary.maturityLevels,
            },
            totalControls: controls.length,
            controls: controls,
            assignments: controlsWithStatus,
            users: users.length,
        };
    }
    /**
     * Obter dados vazios (quando não há usuários)
     */
    static getEmptyMaturityData() {
        return {
            company: { id: null, name: null },
            summary: {
                totalControls: 0,
                Implementado: 0,
                Parcialmente: 0,
                NaoImplementado: 0,
                NaoSeAplica: 0,
                percentages: {
                    Implementado: 0,
                    Parcialmente: 0,
                    NaoImplementado: 0,
                    NaoSeAplica: 0,
                },
                maturityLevels: {},
            },
            totalControls: 0,
            controls: [],
            assignments: [],
            users: 0,
        };
    }
    /**
     * Calcular estatísticas de maturidade
     */
    static calculateMaturityStats(maturityData) {
        const controls = maturityData.controls || [];
        const total = controls.length;
        const statusCounts = {
            Implementado: 0,
            'Parcialmente implementado': 0,
            'Não implementado': 0,
            'Não se aplica': 0,
        };
        controls.forEach((c) => {
            const status = c.status || 'Não implementado';
            if (status in statusCounts) {
                statusCounts[status]++;
            }
        });
        const percentages = {
            Implementado: total > 0 ? Math.round((statusCounts.Implementado / total) * 100) : 0,
            Parcialmente: total > 0 ? Math.round((statusCounts['Parcialmente implementado'] / total) * 100) : 0,
            NaoImplementado: total > 0 ? Math.round((statusCounts['Não implementado'] / total) * 100) : 0,
            NaoSeAplica: total > 0 ? Math.round((statusCounts['Não se aplica'] / total) * 100) : 0,
        };
        return {
            total,
            statusCounts,
            percentages,
            maturityLevels: this.calculateMaturityLevels(controls),
        };
    }
    /**
     * Calcular níveis de maturidade - CORRIGIDO com nullish coalescing
     */
    static calculateMaturityLevels(controls) {
        const levels = {
            'N/A': 0,
            '0': 0,
            '1': 0,
            '2': 0,
        };
        controls.forEach(c => {
            const level = c.maturityLevel || 'N/A';
            if (Object.hasOwn(levels, level)) {
                levels[level] = (levels[level] ?? 0) + 1;
            }
        });
        return levels;
    }
    // ============================================
    // MÉTODOS DE AGRUPAMENTO
    // ============================================
    /**
     * Agrupar controles por domínio
     */
    static groupByDomain(controls) {
        const domains = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
        const result = new Map();
        domains.forEach(domain => {
            const filtered = controls.filter(c => {
                const control = c.control || c;
                const dominios = control?.dominioDeSI || [];
                if (Array.isArray(dominios)) {
                    return dominios.includes(domain);
                }
                return dominios === domain;
            });
            result.set(domain, {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            });
        });
        return Object.fromEntries(result);
    }
    /**
     * Agrupar controles por categoria
     */
    static groupByCategory(controls) {
        const categories = [
            'Controles Organizacionais',
            'Controles de Pessoas',
            'Controles Físicos',
            'Controles Tecnológicos'
        ];
        const result = new Map();
        categories.forEach(category => {
            const filtered = controls.filter(c => {
                const control = c.control || c;
                const tipos = control?.tiposDeControles || control?.tipoDeControle || [];
                if (Array.isArray(tipos)) {
                    return tipos.includes(category);
                }
                return tipos === category;
            });
            result.set(category, {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            });
        });
        return Object.fromEntries(result);
    }
    /**
     * Agrupar controles por tipo - Evita dupla contagem
     */
    static groupByType(controls) {
        const types = ['Preventivo', 'Detectivo', 'Corretivo'];
        const result = new Map();
        types.forEach(type => {
            const uniqueControlIds = new Set();
            controls.forEach(c => {
                const control = c.control || c;
                const tipoDeControle = control?.tipoDeControle || [];
                let hasType = false;
                if (Array.isArray(tipoDeControle)) {
                    hasType = tipoDeControle.includes(type);
                }
                else {
                    hasType = tipoDeControle === type;
                }
                if (hasType) {
                    const id = control?._id?.toString() || c.controlId?.toString();
                    if (id) {
                        uniqueControlIds.add(id);
                    }
                }
            });
            const filtered = controls.filter(c => {
                const control = c.control || c;
                const id = control?._id?.toString() || c.controlId?.toString();
                return uniqueControlIds.has(id);
            });
            result.set(type, {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            });
        });
        return Object.fromEntries(result);
    }
    /**
     * Agrupar controles por conceito cibernético
     */
    static groupByCyberConcept(controls) {
        const concepts = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
        const result = new Map();
        concepts.forEach(concept => {
            const filtered = controls.filter(c => {
                const control = c.control || c;
                const conceitos = control?.conceitoDeSegurancaCibernetica || [];
                if (Array.isArray(conceitos)) {
                    return conceitos.includes(concept);
                }
                return conceitos === concept;
            });
            result.set(concept, {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            });
        });
        return Object.fromEntries(result);
    }
    /**
     * Agrupar controles por capacidade operacional
     */
    static groupByCapability(controls) {
        const capabilities = [
            'Governança',
            'Gestão de ativos',
            'Proteção da informação',
            'Gestão de identidade e acesso',
            'Segurança nas relações com fornecedores',
            'Gestão de evento de segurança da informação',
            'Gestão de ameaças e vulnerabilidades',
            'Gestão de continuidade do negócio',
            'Segurança física',
            'Desenvolvimento seguro',
            'Gestão de redes',
            'Monitoramento e análise',
            'Gestão de pessoas',
            'Gestão de criptografia',
            'Garantia de segurança da informação',
        ];
        const result = new Map();
        capabilities.forEach(capability => {
            const filtered = controls.filter(c => {
                const control = c.control || c;
                const capacidades = control?.capacidadesOperacionais || [];
                if (Array.isArray(capacidades)) {
                    return capacidades.includes(capability);
                }
                return capacidades === capability;
            });
            result.set(capability, {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
                aderente: filtered.length > 0
                    ? Math.round((filtered.filter(c => c.status === 'Implementado').length / filtered.length) * 100)
                    : 0,
            });
        });
        return Object.fromEntries(result);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=DashboardService.js.map
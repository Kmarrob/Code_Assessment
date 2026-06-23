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
     * Obter dados de maturidade de uma empresa
     */
    static async getCompanyMaturity(companyId, filters) {
        // Verificar se a empresa existe
        const company = await Company_js_1.Company.findById(companyId);
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        // Buscar usuários da empresa
        const userFilter = { companyId, isActive: true };
        if (filters?.userId) {
            userFilter._id = new mongoose_1.default.Types.ObjectId(filters.userId);
        }
        const users = await User_js_1.User.find(userFilter).select('_id');
        const userIds = users.map(u => u._id);
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
        // Criar mapa de respostas por assignmentId
        const responseMap = new Map();
        responses.forEach(r => {
            responseMap.set(r.assignmentId.toString(), r);
        });
        // Mapear status de cada controle com base no maturityLevel
        const controlsWithStatus = assignments.map(a => {
            const response = responseMap.get(a._id.toString());
            const control = a.controlId;
            // Mapear maturityLevel para status
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
        // Buscar todos os controles da empresa (atribuídos ou não)
        const allControls = await Control_js_1.Control.find({
            _id: { $in: company.assignedControls || [] }
        }).lean();
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
        return {
            company: {
                id: company._id,
                name: company.name,
            },
            totalControls: allControls.length,
            controls: Array.from(controlStatusMap.values()),
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
     * Calcular níveis de maturidade
     */
    static calculateMaturityLevels(controls) {
        const levels = {
            'N/A': 0,
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
        };
        controls.forEach(c => {
            const level = c.maturityLevel || 'N/A';
            if (level in levels) {
                levels[level]++;
            }
        });
        return levels;
    }
    /**
     * Agrupar controles por domínio
     */
    static groupByDomain(controls) {
        const domains = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
        const result = {};
        domains.forEach(d => {
            const filtered = controls.filter(c => c.control?.dominioDeSI?.includes(d));
            result[d] = {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            };
        });
        return result;
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
        const result = {};
        categories.forEach(cat => {
            const filtered = controls.filter(c => c.control?.tiposDeControles?.includes(cat));
            result[cat] = {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            };
        });
        return result;
    }
    /**
     * Agrupar controles por tipo
     */
    static groupByType(controls) {
        const types = ['Preventivo', 'Detectivo', 'Corretivo'];
        const result = {};
        types.forEach(t => {
            const filtered = controls.filter(c => c.control?.tipoDeControle?.includes(t));
            result[t] = {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            };
        });
        return result;
    }
    /**
     * Agrupar controles por conceito cibernético
     */
    static groupByCyberConcept(controls) {
        const concepts = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
        const result = {};
        concepts.forEach(concept => {
            const filtered = controls.filter(c => c.control?.conceitoDeSegurancaCibernetica?.includes(concept));
            result[concept] = {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
            };
        });
        return result;
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
        const result = {};
        capabilities.forEach(cap => {
            const filtered = controls.filter(c => c.control?.capacidadesOperacionais?.includes(cap));
            result[cap] = {
                total: filtered.length,
                implemented: filtered.filter(c => c.status === 'Implementado').length,
                partial: filtered.filter(c => c.status === 'Parcialmente implementado').length,
                notImpl: filtered.filter(c => c.status === 'Não implementado').length,
                na: filtered.filter(c => c.status === 'Não se aplica').length,
                aderente: filtered.length > 0
                    ? Math.round((filtered.filter(c => c.status === 'Implementado').length / filtered.length) * 100)
                    : 0,
            };
        });
        return result;
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=DashboardService.js.map
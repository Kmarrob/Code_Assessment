"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditSoAController = exports.AuditSoAController = void 0;
const AuditSoAService_1 = require("../../models/audit/services/AuditSoAService");
class AuditSoAController {
    /**
     * Criar nova Declaração de Aplicabilidade
     * POST /api/internal-audit/soa
     */
    async create(req, res) {
        try {
            const { companyId, version, controls, observations } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            // Verificar se já existe SoA ativa
            const active = await AuditSoAService_1.auditSoAService.findActiveByCompany(companyId);
            if (active) {
                return res.status(409).json({
                    error: 'Já existe uma Declaração de Aplicabilidade ativa. Crie uma nova versão ou arquive a existente.'
                });
            }
            const soa = await AuditSoAService_1.auditSoAService.create({
                companyId,
                version: version || '1.0',
                controls: controls || [],
                createdBy: userId,
                status: 'draft',
                observations,
            });
            return res.status(201).json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar SoA por ID
     * GET /api/internal-audit/soa/:id
     */
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const soa = await AuditSoAService_1.auditSoAService.findById(id);
            if (!soa) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar SoA por empresa
     * GET /api/internal-audit/soa/company/:companyId
     */
    async findByCompany(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const { status } = req.query;
            const soas = await AuditSoAService_1.auditSoAService.findByCompany(companyId, {
                status: status,
            });
            return res.json(soas);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar SoA ativa por empresa
     * GET /api/internal-audit/soa/company/:companyId/active
     */
    async findActiveByCompany(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const soa = await AuditSoAService_1.auditSoAService.findActiveByCompany(companyId);
            if (!soa) {
                return res.status(404).json({ error: 'Nenhuma Declaração de Aplicabilidade ativa encontrada' });
            }
            return res.json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar SoA
     * PUT /api/internal-audit/soa/:id
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { version, controls, observations } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const soa = await AuditSoAService_1.auditSoAService.update(id, {
                version,
                controls,
                observations,
            });
            if (!soa) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar um controle específico da SoA
     * PUT /api/internal-audit/soa/:id/control/:clause
     */
    async updateControl(req, res) {
        try {
            const { id, clause } = req.params;
            const data = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!clause) {
                return res.status(400).json({ error: 'clause é obrigatório' });
            }
            // Converter strings para booleanos
            if (data.motivators) {
                data.motivators = {
                    business: data.motivators.business === true || data.motivators.business === 'true',
                    risk: data.motivators.risk === true || data.motivators.risk === 'true',
                    legal: data.motivators.legal === true || data.motivators.legal === 'true',
                    contract: data.motivators.contract === true || data.motivators.contract === 'true',
                };
            }
            if (data.applicable !== undefined) {
                data.applicable = data.applicable === true || data.applicable === 'true';
            }
            if (data.implemented !== undefined) {
                data.implemented = data.implemented === true || data.implemented === 'true';
            }
            if (data.lastAssessmentDate) {
                data.lastAssessmentDate = new Date(data.lastAssessmentDate);
            }
            if (data.implementationDate) {
                data.implementationDate = new Date(data.implementationDate);
            }
            const soa = await AuditSoAService_1.auditSoAService.updateControl(id, clause, data);
            if (!soa) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Aprovar SoA
     * POST /api/internal-audit/soa/:id/approve
     */
    async approve(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const soa = await AuditSoAService_1.auditSoAService.approve(id, userId);
            if (!soa) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Arquivar SoA
     * POST /api/internal-audit/soa/:id/archive
     */
    async archive(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const soa = await AuditSoAService_1.auditSoAService.archive(id);
            if (!soa) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(soa);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Excluir SoA
     * DELETE /api/internal-audit/soa/:id
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const soa = await AuditSoAService_1.auditSoAService.delete(id);
            if (!soa) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json({ message: 'Declaração de Aplicabilidade excluída com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Obter estatísticas da SoA
     * GET /api/internal-audit/soa/:id/stats
     */
    async getStatistics(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const stats = await AuditSoAService_1.auditSoAService.getStatistics(id);
            if (!stats) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(stats);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Exportar SoA para formato de planilha
     * GET /api/internal-audit/soa/:id/export
     */
    async exportToSpreadsheet(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const data = await AuditSoAService_1.auditSoAService.exportToSpreadsheet(id);
            if (!data) {
                return res.status(404).json({ error: 'Declaração de Aplicabilidade não encontrada' });
            }
            return res.json(data);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.AuditSoAController = AuditSoAController;
exports.auditSoAController = new AuditSoAController();
//# sourceMappingURL=AuditSoAController.js.map
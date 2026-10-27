"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditPlanController = exports.AuditPlanController = void 0;
const AuditPlanService_1 = require("../../models/audit/services/AuditPlanService");
const audit_schemas_1 = require("../../models/audit/schemas/audit.schemas");
const Response_1 = require("../../models/Response");
const mongoose_1 = __importDefault(require("mongoose"));
const auditPlanService = new AuditPlanService_1.AuditPlanService();
class AuditPlanController {
    // ============================================================
    // CRIAR PLANO
    // ============================================================
    async create(req, res) {
        try {
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const data = req.body;
            // Nunca aceitar companyId enviado
            // pelo frontend para substituir o tenant.
            delete data.companyId;
            const plan = await auditPlanService.create(data, userId, companyId);
            return res.status(201).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            console.error('Erro ao criar plano de auditoria:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // LISTAR PLANOS
    // ============================================================
    async findAll(req, res) {
        try {
            const companyId = req.user?.companyId?.toString();
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const { status, leadAuditor, auditor, search, } = req.query;
            const filters = {
                companyId,
                status: status,
                leadAuditor: leadAuditor,
                auditor: auditor,
                search: search,
            };
            const plans = await auditPlanService.findAll(filters);
            return res.status(200).json({
                success: true,
                data: plans,
            });
        }
        catch (error) {
            console.error('Erro ao listar planos de auditoria:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // BUSCAR PLANO POR ID
    // ============================================================
    async findById(req, res) {
        try {
            const { id } = req.params;
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.findById(id, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // ATUALIZAR PLANO
    // ============================================================
    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            const data = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.update(id, data, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            console.error('Erro ao atualizar plano:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // DELETAR PLANO
    // ============================================================
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.cancel(id, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // ENVIAR PARA APROVAÇÃO
    // ============================================================
    async submitForApproval(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.submitForApproval(id, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // APROVAR PLANO
    // ============================================================
    async approve(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.approve(id, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // REJEITAR PLANO
    // ============================================================
    async reject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            const { reason } = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            if (!reason ||
                !reason.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Motivo da rejeição é obrigatório',
                });
            }
            const plan = await auditPlanService.reject(id, userId, reason, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // CANCELAR PLANO
    // ============================================================
    async cancel(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.cancel(id, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // INICIAR AUDITORIA
    // ============================================================
    async startAudit(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.startAudit(id, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // CONCLUIR AUDITORIA
    // ============================================================
    async completeAudit(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plan = await auditPlanService.completeAudit(id, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // ESTATÍSTICAS
    // ============================================================
    async getStats(req, res) {
        try {
            const companyId = req.user?.companyId?.toString();
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const stats = await auditPlanService.getStats(companyId);
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // BUSCAR RESPOSTAS DOS USUÁRIOS POR PLANO
    // ============================================================
    async getResponsesByPlan(req, res) {
        try {
            const { planId } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!planId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do plano é obrigatório',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            // ============================================================
            // BUSCAR PLANO DENTRO DO TENANT
            // ============================================================
            const plan = await auditPlanService.findById(planId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            // ============================================================
            // EXTRAIR CONTROLES
            // ============================================================
            const controlIds = plan.scope?.controls || [];
            if (controlIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'Nenhum controle no escopo do plano',
                });
            }
            // ============================================================
            // SEPARAR IDs MONGODB E IDS FUNCIONAIS
            // ============================================================
            const controlObjectIds = [];
            const controlStringIds = [];
            for (const controlId of controlIds) {
                if (mongoose_1.default.Types.ObjectId.isValid(controlId)) {
                    controlObjectIds.push(new mongoose_1.default.Types.ObjectId(controlId));
                }
                else {
                    controlStringIds.push(controlId);
                }
            }
            // ============================================================
            // BUSCAR CONTROLES
            // ============================================================
            const controlQuery = [];
            if (controlObjectIds.length > 0) {
                controlQuery.push({
                    _id: {
                        $in: controlObjectIds,
                    },
                });
            }
            if (controlStringIds.length > 0) {
                controlQuery.push({
                    id: {
                        $in: controlStringIds,
                    },
                });
            }
            if (controlQuery.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'Nenhum identificador de controle válido foi encontrado',
                });
            }
            const controls = await mongoose_1.default
                .model('Control')
                .find({
                $or: controlQuery,
                companyId,
            })
                .lean();
            const controlDbIds = controls.map((control) => control._id.toString());
            if (controlDbIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'Nenhum controle encontrado para os IDs do escopo',
                });
            }
            // ============================================================
            // BUSCAR RESPOSTAS
            // ============================================================
            const responses = await Response_1.Response.find({
                companyId,
                controlId: {
                    $in: controlDbIds,
                },
            })
                .populate('userId', 'name email')
                .populate('controlId', 'id nome')
                .lean();
            // ============================================================
            // FORMATAR RESPOSTAS
            // ============================================================
            const formattedResponses = responses.map((response) => ({
                id: response._id,
                assignmentId: response.assignmentId,
                userId: response.userId,
                controlId: response.controlId?._id ||
                    response.controlId,
                controlIdString: response.controlId?.id ||
                    '',
                controlName: response.controlId?.nome ||
                    'Controle não identificado',
                maturityLevel: response.maturityLevel ||
                    'N/A',
                scenarioDescription: response.scenarioDescription ||
                    '',
                observations: response.observations ||
                    '',
                evidence: response.evidence ||
                    [],
                submittedAt: response.submittedAt,
                updatedAt: response.updatedAt,
                userName: response.userId?.name ||
                    'Usuário não identificado',
                userEmail: response.userId?.email ||
                    '',
            }));
            return res.status(200).json({
                success: true,
                data: formattedResponses,
                total: formattedResponses.length,
                message: `${formattedResponses.length} respostas encontradas para o plano`,
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar respostas por plano:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 🆕 EXCLUIR CONTROLE DO ESCOPO
    // ============================================================
    /**
     * Exclui um controle do escopo da auditoria.
     *
     * Rota esperada:
     *   POST /api/internal-audit/plans/:id/exclusions
     *
     * Body:
     *   {
     *     controlId: string,
     *     reason: string (min 20 chars)
     *   }
     *
     * Regras:
     *   - Plano deve estar em 'draft' ou 'pending_approval'.
     *   - Plano deve estar em modo 'all'.
     *   - Justificativa obrigatória.
     *   - Não pode excluir todos os controles.
     */
    async excludeControl(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do plano não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            // ============================================================
            // VALIDAR BODY COM ZOD
            // ============================================================
            const parsed = audit_schemas_1.excludeControlSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: parsed.error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            const { controlId, reason } = parsed.data;
            const plan = await auditPlanService.excludeControl(id, controlId, reason, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
                message: 'Controle excluído do escopo. Aguardando aprovação do Auditor Líder.',
            });
        }
        catch (error) {
            console.error('Erro ao excluir controle do escopo:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 🆕 APROVAR EXCLUSÃO DE CONTROLE
    // ============================================================
    /**
     * Aprova uma exclusão de controle previamente registrada.
     *
     * Rota esperada:
     *   POST /api/internal-audit/plans/:id/exclusions/:controlId/approve
     *
     * Regras:
     *   - Apenas o Auditor Líder pode aprovar.
     *   - A exclusão precisa existir.
     *   - A exclusão não pode já estar aprovada.
     */
    async approveExclusion(req, res) {
        try {
            const { id, controlId } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do plano não informado',
                });
            }
            if (!controlId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do controle não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            // ============================================================
            // VALIDAR PARAMS COM ZOD
            // ============================================================
            const parsed = audit_schemas_1.approveExclusionSchema.safeParse({ controlId });
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: parsed.error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            const plan = await auditPlanService.approveExclusion(id, controlId, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
                message: 'Exclusão aprovada com sucesso.',
            });
        }
        catch (error) {
            console.error('Erro ao aprovar exclusão de controle:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 🆕 REJEITAR EXCLUSÃO DE CONTROLE
    // ============================================================
    /**
     * Rejeita uma exclusão de controle.
     *
     * Rota esperada:
     *   POST /api/internal-audit/plans/:id/exclusions/:controlId/reject
     *
     * Regras:
     *   - Apenas o Auditor Líder pode rejeitar.
     *   - Ao rejeitar, o controle volta ao escopo efetivo.
     */
    async rejectExclusion(req, res) {
        try {
            const { id, controlId } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do plano não informado',
                });
            }
            if (!controlId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do controle não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            // ============================================================
            // VALIDAR PARAMS COM ZOD
            // ============================================================
            const parsed = audit_schemas_1.rejectExclusionSchema.safeParse({ controlId });
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: parsed.error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            const plan = await auditPlanService.rejectExclusion(id, controlId, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
                message: 'Exclusão rejeitada. O controle voltou ao escopo.',
            });
        }
        catch (error) {
            console.error('Erro ao rejeitar exclusão de controle:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 🆕 REMOVER EXCLUSÃO DE CONTROLE
    // ============================================================
    /**
     * Remove uma exclusão já registrada (sem rejeição formal).
     *
     * Rota esperada:
     *   DELETE /api/internal-audit/plans/:id/exclusions/:controlId
     *
     * Regras:
     *   - Plano deve estar em 'draft' ou 'pending_approval'.
     *   - Autor da exclusão OU Auditor Líder podem remover.
     *   - O controle volta ao escopo efetivo.
     */
    async removeExclusion(req, res) {
        try {
            const { id, controlId } = req.params;
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do plano não informado',
                });
            }
            if (!controlId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do controle não informado',
                });
            }
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            // ============================================================
            // VALIDAR PARAMS COM ZOD
            // ============================================================
            const parsed = audit_schemas_1.removeExclusionSchema.safeParse({ controlId });
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: parsed.error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            const plan = await auditPlanService.removeExclusion(id, controlId, userId, companyId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plano não encontrado',
                });
            }
            return res.status(200).json({
                success: true,
                data: plan,
                message: 'Exclusão removida. O controle voltou ao escopo.',
            });
        }
        catch (error) {
            console.error('Erro ao remover exclusão de controle:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 🆕 v52.1 — DASHBOARDS POR ROLE
    // ============================================================
    //
    // MOTIVO:
    //   Os roles auditor_lead, auditor e observer precisam de
    //   endpoints dedicados para alimentar seus dashboards.
    //
    //   Antes, eles só conseguiam usar GET /plans (que traz TODOS
    //   os planos da empresa) — o que não é o comportamento
    //   desejado para auditor e observer (que só devem ver os
    //   planos em que participam).
    //
    //   O REP continua usando GET /plans normalmente.
    //
    // SEGURANÇA:
    //   - companyId sempre vem do token (req.user.companyId),
    //     nunca do body/query.
    //   - userId sempre vem do token (req.user._id).
    //   - As rotas (Bloco 1, arquivo 3/3) aplicam authorize()
    //     específico por role.
    //
    // ============================================================
    // ============================================================
    // 1/4 — PLANOS AGUARDANDO APROVAÇÃO (AUDITOR LÍDER)
    // ============================================================
    //
    // Retorna planos em status 'pending_approval' onde o usuário
    // autenticado é o leadAuditor designado.
    //
    // USO:
    //   Alimenta o card "Planos para Aprovar" do AuditorLeadDashboard.
    //
    // ROTA:
    //   GET /api/internal-audit/auditor/plans-to-approve
    //
    // ============================================================
    async getPlansToApprove(req, res) {
        try {
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plans = await auditPlanService.findByTeamMember(userId, 'lead', companyId, {
                statuses: ['pending_approval'],
            });
            return res.status(200).json({
                success: true,
                data: plans,
                total: plans.length,
            });
        }
        catch (error) {
            console.error('Erro ao buscar planos para aprovação:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 2/4 — PLANOS ATIVOS DO AUDITOR LÍDER
    // ============================================================
    //
    // Retorna planos onde o usuário autenticado é o leadAuditor,
    // em status 'approved', 'in_progress' ou 'completed'.
    //
    // USO:
    //   Alimenta o card "Planos que Eu Executo" do AuditorLeadDashboard.
    //
    // ROTA:
    //   GET /api/internal-audit/auditor/lead-plans
    //
    // ============================================================
    async getLeadAuditorPlans(req, res) {
        try {
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plans = await auditPlanService.findByTeamMember(userId, 'lead', companyId, {
                statuses: ['approved', 'in_progress', 'completed'],
            });
            return res.status(200).json({
                success: true,
                data: plans,
                total: plans.length,
            });
        }
        catch (error) {
            console.error('Erro ao buscar planos do auditor líder:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 3/4 — PLANOS QUE O AUDITOR PARTICIPA
    // ============================================================
    //
    // Retorna planos onde o usuário autenticado está em
    // team.auditors[], em qualquer status exceto 'draft',
    // 'submitted' e 'cancelled'.
    //
    // USO:
    //   Alimenta o card "Planos que Participo" do AuditorDashboard.
    //
    // ROTA:
    //   GET /api/internal-audit/auditor/my-plans
    //
    // ============================================================
    async getAuditorPlans(req, res) {
        try {
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plans = await auditPlanService.findByTeamMember(userId, 'auditor', companyId, {
                excludeStatuses: ['draft', 'submitted', 'cancelled'],
            });
            return res.status(200).json({
                success: true,
                data: plans,
                total: plans.length,
            });
        }
        catch (error) {
            console.error('Erro ao buscar planos do auditor:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
    // ============================================================
    // 4/4 — PLANOS QUE O OBSERVADOR ACOMPANHA
    // ============================================================
    //
    // Retorna planos onde o usuário autenticado está em
    // team.observers[], em qualquer status exceto 'draft',
    // 'submitted' e 'cancelled'.
    //
    // USO:
    //   Alimenta o card "Planos que Observo" do ObserverDashboard.
    //
    // ROTA:
    //   GET /api/internal-audit/observer/my-plans
    //
    // ============================================================
    async getObserverPlans(req, res) {
        try {
            const userId = req.user?._id?.toString();
            const companyId = req.user?.companyId?.toString();
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
            }
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresa não identificada',
                });
            }
            const plans = await auditPlanService.findByTeamMember(userId, 'observer', companyId, {
                excludeStatuses: ['draft', 'submitted', 'cancelled'],
            });
            return res.status(200).json({
                success: true,
                data: plans,
                total: plans.length,
            });
        }
        catch (error) {
            console.error('Erro ao buscar planos do observador:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.AuditPlanController = AuditPlanController;
exports.auditPlanController = new AuditPlanController();
//# sourceMappingURL=AuditPlanController.js.map
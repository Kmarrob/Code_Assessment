"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditChecklistService = void 0;
const AuditChecklist_1 = require("../models/AuditChecklist");
const AuditPlan_1 = require("../models/AuditPlan");
const Response_1 = require("../../Response");
const Assignment_1 = require("../../Assignment");
const mongoose_1 = require("mongoose");
/**
 * Mapeia documento do MongoDB para IAuditChecklist com id
 */
function mapToIAuditChecklist(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id.toString(),
        ...doc,
    };
}
/**
 * Mapeia array de documentos para IAuditChecklist[]
 */
function mapToIAuditChecklistArray(docs) {
    if (!docs)
        return [];
    return docs.map(doc => mapToIAuditChecklist(doc));
}
/**
 * Converte respostas legadas/frontend para o padrão utilizado
 * pelo modelo AuditChecklist.
 */
function mapAnswer(answer) {
    switch (answer) {
        case 'C':
        case 'conforme':
            return 'C';
        case 'NC':
        case 'nao_conforme':
            return 'NC';
        case 'OB':
        case 'observacao':
            return 'OB';
        case 'OM':
        case 'oportunidade':
            return 'OM';
        case 'NA':
        case 'nao_aplicavel':
            return 'NA';
        case '--':
        case undefined:
        case null:
        case '':
            return '--';
        default:
            return '--';
    }
}
/**
 * Converte maturityLevel do usuário para resposta do checklist
 *
 * Nível 2 (Implementado) → C (Conforme)
 * Nível 1 (Parcial) → OB (Observação)
 * Nível 0 (Não Implementado) → NC (Não Conforme)
 */
function mapMaturityToChecklistAnswer(maturityLevel) {
    switch (maturityLevel) {
        case '2':
            return 'C';
        case '1':
            return 'OB';
        case '0':
            return 'NC';
        default:
            return '--';
    }
}
/**
 * Retorna o label do nível de maturidade
 */
function getMaturityLabel(maturityLevel) {
    switch (maturityLevel) {
        case '2': return 'Implementado';
        case '1': return 'Parcial';
        case '0': return 'Não Implementado';
        default: return 'Não respondido';
    }
}
class AuditChecklistService {
    // ============================================================
    // BUSCAR CHECKLIST POR PLANO E CONTROLE
    // ============================================================
    async findByPlanAndControl(auditPlanId, controlId) {
        const doc = await AuditChecklist_1.AuditChecklist.findOne({ auditPlanId, controlId }).lean();
        if (!doc)
            return null;
        return mapToIAuditChecklist(doc);
    }
    // ============================================================
    // LISTAR CHECKLISTS POR PLANO
    // ============================================================
    async findByPlanId(auditPlanId) {
        const docs = await AuditChecklist_1.AuditChecklist.find({ auditPlanId }).lean();
        return mapToIAuditChecklistArray(docs);
    }
    // ============================================================
    // POPULAR CHECKLIST COM RESPOSTAS DOS USUÁRIOS
    // ============================================================
    async populateWithUserResponses(auditPlanId, controlId, userId) {
        // 1. Buscar o checklist
        const checklist = await AuditChecklist_1.AuditChecklist.findOne({ auditPlanId, controlId });
        if (!checklist) {
            throw new Error(`Checklist não encontrado para o controle ${controlId}`);
        }
        // 2. Buscar todas as atribuições para este controle
        const assignments = await Assignment_1.Assignment.find({
            'control.id': controlId,
        }).lean();
        if (assignments.length === 0) {
            console.log(`ℹ️ Nenhuma atribuição encontrada para o controle ${controlId}`);
            return mapToIAuditChecklist(checklist.toObject());
        }
        // 3. Buscar as respostas dos usuários para estas atribuições
        const assignmentIds = assignments.map(a => a._id.toString());
        const responses = await Response_1.Response.find({
            assignmentId: { $in: assignmentIds },
        }).lean();
        // Criar um mapa de assignmentId → response para acesso rápido
        const responseMap = new Map();
        responses.forEach(r => {
            responseMap.set(r.assignmentId, r);
        });
        // 4. Para cada pergunta no checklist, tentar encontrar a resposta correspondente
        let updatedCount = 0;
        // ✅ CORRIGIDO: usar for tradicional com índice e verificação explícita
        for (let i = 0; i < checklist.questions.length; i++) {
            // ✅ Verificação explícita: garantir que a pergunta existe
            const question = checklist.questions[i];
            if (!question) {
                continue;
            }
            // Tentar encontrar uma resposta que corresponda a esta pergunta
            for (const assignment of assignments) {
                const response = responseMap.get(assignment._id.toString());
                if (response && response.maturityLevel) {
                    // Se já encontramos uma resposta para esta pergunta, pulamos
                    if (question.answer !== '--') {
                        break;
                    }
                    // Mapear maturidade para resposta do checklist
                    const answer = mapMaturityToChecklistAnswer(response.maturityLevel);
                    // Copiar scenarioDescription para observations se existir
                    const observations = response.scenarioDescription ||
                        `Cenário identificado: ${getMaturityLabel(response.maturityLevel)}`;
                    // ✅ CORRIGIDO: converter ObjectId para string com .toString()
                    const responsible = assignment.userId
                        ? (assignment.userId instanceof mongoose_1.Types.ObjectId ? assignment.userId.toString() : String(assignment.userId))
                        : '';
                    // Atualizar a pergunta no checklist
                    checklist.questions[i] = {
                        ...question,
                        answer: answer,
                        observations: observations,
                        responsible: responsible,
                        answeredAt: new Date(),
                        answeredBy: userId,
                    };
                    updatedCount++;
                    break;
                }
            }
        }
        // 5. Atualizar estatísticas
        // ✅ CORRIGIDO: verificar se o método existe antes de chamar
        if (typeof checklist.updateStatistics === 'function') {
            await checklist.updateStatistics();
        }
        checklist.updatedBy = userId;
        await checklist.save();
        console.log(`✅ Checklist populado: ${updatedCount} perguntas atualizadas para o controle ${controlId}`);
        return mapToIAuditChecklist(checklist.toObject());
    }
    // ============================================================
    // POPULAR TODOS OS CHECKLISTS DE UM PLANO
    // ============================================================
    async populateAllChecklists(auditPlanId, userId) {
        const checklists = await AuditChecklist_1.AuditChecklist.find({ auditPlanId });
        if (checklists.length === 0) {
            throw new Error(`Nenhum checklist encontrado para o plano ${auditPlanId}`);
        }
        let populatedCount = 0;
        for (const checklist of checklists) {
            const result = await this.populateWithUserResponses(auditPlanId, checklist.controlId, userId);
            if (result) {
                populatedCount++;
            }
        }
        console.log(`✅ ${populatedCount} checklists populados para o plano ${auditPlanId}`);
        return populatedCount;
    }
    // ============================================================
    // ATUALIZAR CHECKLIST
    // ============================================================
    async updateChecklist(id, questions, userId) {
        const checklist = await AuditChecklist_1.AuditChecklist.findById(id);
        if (!checklist)
            throw new Error('Checklist não encontrado');
        // Verificar se o usuário faz parte da equipe de auditoria
        const plan = await AuditPlan_1.AuditPlan.findById(checklist.auditPlanId);
        if (!plan)
            throw new Error('Plano de auditoria não encontrado');
        const isTeamMember = plan.team.leadAuditor === userId ||
            plan.team.auditors.includes(userId);
        if (!isTeamMember) {
            throw new Error('Apenas membros da equipe de auditoria podem atualizar o checklist');
        }
        // Converter IAuditChecklistItem para IAuditChecklistQuestion
        const questionsMapped = questions.map(q => ({
            question: q.question,
            answer: mapAnswer(q.answer),
            observations: q.observations || '',
            evidenceIds: q.evidenceIds || [],
            responsible: q.responsible || '',
            answeredAt: q.answeredAt || undefined,
            answeredBy: q.answeredBy || undefined,
        }));
        checklist.questions = questionsMapped;
        checklist.updatedAt = new Date();
        checklist.updatedBy = userId;
        // ✅ CORRIGIDO: verificar se o método existe antes de chamar
        if (typeof checklist.updateStatistics === 'function') {
            await checklist.updateStatistics();
        }
        await checklist.save();
        return mapToIAuditChecklist(checklist.toObject());
    }
    // ============================================================
    // MARCAR CHECKLIST COMO CONCLUÍDO
    // ============================================================
    async complete(id, userId) {
        const checklist = await AuditChecklist_1.AuditChecklist.findById(id);
        if (!checklist)
            throw new Error('Checklist não encontrado');
        // Verificar se o usuário faz parte da equipe de auditoria
        const plan = await AuditPlan_1.AuditPlan.findById(checklist.auditPlanId);
        if (!plan)
            throw new Error('Plano de auditoria não encontrado');
        const isTeamMember = plan.team.leadAuditor === userId ||
            plan.team.auditors.includes(userId);
        if (!isTeamMember) {
            throw new Error('Apenas membros da equipe de auditoria podem concluir o checklist');
        }
        checklist.status = 'completed';
        checklist.completedBy = userId;
        checklist.completedAt = new Date();
        checklist.updatedBy = userId;
        await checklist.save();
        return mapToIAuditChecklist(checklist.toObject());
    }
    // ============================================================
    // ESTATÍSTICAS DO CHECKLIST
    // ============================================================
    async getStats(auditPlanId) {
        const total = await AuditChecklist_1.AuditChecklist.countDocuments({ auditPlanId });
        const completed = await AuditChecklist_1.AuditChecklist.countDocuments({ auditPlanId, status: 'completed' });
        const inProgress = await AuditChecklist_1.AuditChecklist.countDocuments({ auditPlanId, status: 'in_progress' });
        const pending = await AuditChecklist_1.AuditChecklist.countDocuments({ auditPlanId, status: 'pending' });
        return {
            total,
            completed,
            inProgress,
            pending,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
    }
}
exports.AuditChecklistService = AuditChecklistService;
//# sourceMappingURL=AuditChecklistService.js.map
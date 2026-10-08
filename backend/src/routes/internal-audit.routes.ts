import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/index.js';

// ============================================================
// 🆕 v51.1 — UPLOADER DE EVIDÊNCIAS
// ============================================================
//
// MOTIVO:
//   A rota POST /evidence/upload não tinha middleware Multer.
//   Sem ele, o multipart/form-data não era parseado, `req.file`
//   ficava undefined e `req.body.auditPlanId` nunca chegava ao
//   controller, causando o erro "ID do plano é obrigatório".
//
// O uploader `uploadEvidence` e o handler de erros
// `handleEvidenceMulterError` vivem em config/multer.ts,
// junto com os uploaders existentes (logo, favicon) — os quais
// permanecem INTACTOS.
//
// ============================================================
import {
  uploadEvidence,
  handleEvidenceMulterError,
} from '../config/multer';

import {
  auditPlanController,
  auditChecklistController,
  auditFindingController,
  auditEvidenceController,
  auditActionPlanController,
  auditReportController,
  auditProgramController,
  auditSoAController,
  auditRiskController,
  auditDocumentReviewController,
  auditQuestionController,

  // ============================================================
  // 🆕 v50.1 — Perguntas de auditoria por controle (Anexo A)
  // ============================================================
  auditControlQuestionController,

  // ============================================================
  // 🆕 v50.2.15 — Dashboard de auditoria (Admin + REP)
  // ============================================================
  auditDashboardController,
} from '../controllers/audit';

// ============================================================
// 🆕 v52.7.3 — RepController para a rota /controls
// ============================================================
//
// MOTIVO:
//   Os roles auditor_lead / auditor / observer precisam listar
//   os controles da empresa para montar os labels da tela de
//   execução de auditoria (ex: "5.1 - Políticas...").
//
//   A rota existente GET /rep/controls é restrita ao REP. Para
//   os novos roles, ela retorna 403 e o lookup falha em silêncio,
//   fazendo o frontend exibir o hash do ObjectId.
//
// SOLUÇÃO:
//   Reaproveitar o MESMO método `getCompanyControls` (já pronto
//   em RepController) numa rota nova sob /internal-audit/controls,
//   com authorize(...CAN_READ_AUDIT).
//
// SEGURANÇA:
//   - O método usa req.userId do token (não confia no frontend).
//   - Busca a empresa do próprio usuário logado via User.findById.
//   - Aplica o mesmo filtro/ordenação da rota original.
//
// ============================================================
import { RepController } from '../controllers/RepController.js';

const router = Router();

// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================
router.use(authenticate);

// ============================================================
// 🆕 v52.0 — CONSTANTES DE AUTORIZAÇÃO POR GRUPO DE ROLES
// ============================================================
//
// MOTIVO:
//   Com a introdução dos roles de auditoria interna
//   (auditor_lead, auditor, observer), precisamos autorizar as
//   rotas de auditoria de acordo com o papel do usuário.
//
// REGRAS:
//   - REP: continua com acesso total (comportamento antigo).
//   - ADMIN: acesso total (bypass).
//   - AUDITOR_LEAD: aprovador + executor + leitura.
//   - AUDITOR: executor + leitura (NÃO aprova).
//   - OBSERVER: somente leitura.
//
// ESTRATÉGIA:
//   4 constantes reutilizáveis para evitar repetição em ~100 rotas.
//
// SEGURANÇA:
//   - REP e ADMIN nunca perdem acesso existente.
//   - Os 3 novos roles ganham acesso (aditivo).
//   - Nenhuma rota fica mais restrita para quem já funcionava.
//
// ============================================================

const CAN_READ_AUDIT = [
  UserRole.ADMIN,
  UserRole.REP,
  UserRole.AUDITOR_LEAD,
  UserRole.AUDITOR,
  UserRole.OBSERVER,
] as const;

const CAN_WRITE_AUDIT = [
  UserRole.ADMIN,
  UserRole.REP,
  UserRole.AUDITOR_LEAD,
  UserRole.AUDITOR,
] as const;

const CAN_APPROVE_AUDIT = [
  UserRole.ADMIN,
  UserRole.REP,
  UserRole.AUDITOR_LEAD,
] as const;

// ============================================================
// 🆕 v52.1 — CONSTANTES ESPECÍFICAS DOS DASHBOARDS POR ROLE
// ============================================================
//
// MOTIVO:
//   Cada dashboard por role só deve ser acessível pelo próprio
//   role (e pelo ADMIN, que tem bypass total).
//
// REGRAS:
//   - CAN_VIEW_LEAD_DASHBOARD      → ADMIN, AUDITOR_LEAD
//   - CAN_VIEW_AUDITOR_DASHBOARD   → ADMIN, AUDITOR
//   - CAN_VIEW_OBSERVER_DASHBOARD  → ADMIN, OBSERVER
//
// SEGURANÇA:
//   - O REP NÃO acessa esses endpoints (ele tem o próprio painel
//     com a rota geral /plans — comportamento inalterado).
//   - Isolamento por role garante segregação de funções.
//
// ============================================================

const CAN_VIEW_LEAD_DASHBOARD = [
  UserRole.ADMIN,
  UserRole.AUDITOR_LEAD,
] as const;

const CAN_VIEW_AUDITOR_DASHBOARD = [
  UserRole.ADMIN,
  UserRole.AUDITOR,
] as const;

const CAN_VIEW_OBSERVER_DASHBOARD = [
  UserRole.ADMIN,
  UserRole.OBSERVER,
] as const;

// ============================================================
// 🆕 v52.7.3 — ROTA DE CONTROLES ACESSÍVEL A TODOS OS ROLES
// ============================================================
//
// MOTIVO:
//   A tela de execução de auditoria (RepAuditExecution) precisa
//   listar os controles da empresa para montar os labels
//   (ex: "5.1 - Políticas..."). Hoje só o REP consegue, via
//   GET /rep/controls.
//
// SOLUÇÃO:
//   Reaproveita o método `RepController.getCompanyControls` em
//   uma rota nova, autorizada para todos os roles de auditoria.
//
// SEGURANÇA:
//   - O controller usa req.userId do token.
//   - Busca a empresa do próprio usuário logado.
//   - Sem vazamento de dados entre tenants.
//
// ============================================================
router.get(
  '/controls',
  authorize(...CAN_READ_AUDIT),
  RepController.getCompanyControls
);

// ============================================================
// 🆕 v50.2.15 — ROTAS DE DASHBOARD
// ============================================================
//
// Acesso:
//   - ADMIN: vê tudo (query params opcionais: companyId, planId)
//   - REP:   vê só a empresa dele (backend força o companyId)
//   - AUDITOR_LEAD / AUDITOR: veem o dashboard da empresa
//   - OBSERVER: somente leitura
//
// ============================================================

router.get(
  '/dashboard/stats',
  authorize(...CAN_READ_AUDIT),
  auditDashboardController.getStats
);

// ============================================================
// ROTAS DE PLANOS DE AUDITORIA
// ============================================================
//
// REGRAS:
//   - Criar/editar/excluir plano: REP, ADMIN
//   - Enviar para aprovação:     REP, ADMIN
//   - Aprovar/rejeitar:          REP, ADMIN, AUDITOR_LEAD
//   - Cancelar:                  REP, ADMIN, AUDITOR_LEAD
//   - Iniciar auditoria:         REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Concluir auditoria:        REP, ADMIN, AUDITOR_LEAD
//   - Consultar planos:          todos os roles de auditoria
//
// ============================================================

router.post(
  '/plans',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditPlanController.create
);

router.get(
  '/plans',
  authorize(...CAN_READ_AUDIT),
  auditPlanController.findAll
);

router.get(
  '/plans/stats',
  authorize(...CAN_READ_AUDIT),
  auditPlanController.getStats
);

router.get(
  '/plans/:id',
  authorize(...CAN_READ_AUDIT),
  auditPlanController.findById
);

router.put(
  '/plans/:id',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditPlanController.update
);

router.delete(
  '/plans/:id',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditPlanController.delete
);

router.post(
  '/plans/:id/submit',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditPlanController.submitForApproval
);

router.post(
  '/plans/:id/approve',
  authorize(...CAN_APPROVE_AUDIT),
  auditPlanController.approve
);

router.post(
  '/plans/:id/reject',
  authorize(...CAN_APPROVE_AUDIT),
  auditPlanController.reject
);

router.post(
  '/plans/:id/cancel',
  authorize(...CAN_APPROVE_AUDIT),
  auditPlanController.cancel
);

router.post(
  '/plans/:id/start',
  authorize(...CAN_WRITE_AUDIT),
  auditPlanController.startAudit
);

router.post(
  '/plans/:id/complete',
  authorize(...CAN_APPROVE_AUDIT),
  auditPlanController.completeAudit
);

// 🆕 NOVO (v47.0) - Buscar respostas dos usuários por plano
router.get(
  '/plans/:planId/responses',
  authorize(...CAN_READ_AUDIT),
  auditPlanController.getResponsesByPlan
);

// ============================================================
// 🆕 NOVO — EXCLUSÃO DE CONTROLES DO ESCOPO (Opção C)
// ============================================================
//
// Fluxo:
//   1. Criador do plano exclui um controle com justificativa.
//   2. Auditor Líder aprova ou rejeita a exclusão.
//   3. Autor da exclusão (ou Auditor Líder) pode remover
//      antes do envio para aprovação.

// Excluir um controle (adiciona exclusão pendente)
router.post(
  '/plans/:id/exclusions',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditPlanController.excludeControl
);

// Aprovar uma exclusão específica
router.post(
  '/plans/:id/exclusions/:controlId/approve',
  authorize(...CAN_APPROVE_AUDIT),
  auditPlanController.approveExclusion
);

// Rejeitar uma exclusão específica (devolve o controle ao escopo)
router.post(
  '/plans/:id/exclusions/:controlId/reject',
  authorize(...CAN_APPROVE_AUDIT),
  auditPlanController.rejectExclusion
);

// Remover uma exclusão já registrada (devolve o controle ao escopo)
router.delete(
  '/plans/:id/exclusions/:controlId',
  authorize(UserRole.ADMIN, UserRole.REP, UserRole.AUDITOR_LEAD),
  auditPlanController.removeExclusion
);

// ============================================================
// 🆕 v52.1 — ROTAS DE DASHBOARD POR ROLE
// ============================================================
//
// MOTIVO:
//   Os roles auditor_lead, auditor e observer precisam de
//   endpoints dedicados para alimentar seus dashboards.
//
//   Antes, todos usavam GET /plans (que traz TODOS os planos
//   da empresa) — o que não é o comportamento desejado.
//
// REGRAS:
//   - REP: continua usando GET /plans (nenhuma mudança).
//   - ADMIN: acesso total a qualquer rota de dashboard.
//   - AUDITOR_LEAD: acessa planos onde é leadAuditor.
//   - AUDITOR: acessa planos onde está em team.auditors[].
//   - OBSERVER: acessa planos onde está em team.observers[].
//
// SEGURANÇA:
//   - companyId e userId sempre vêm do token (middleware).
//   - O controller filtra por ambos, garantindo isolamento
//     de tenant e de papel.
//
// ORDEM DAS ROTAS:
//   Estas rotas vêm ANTES das rotas genéricas /plans/:id
//   NÃO É NECESSÁRIO — o prefixo /auditor/... e /observer/...
//   não conflita com /plans/:id. A ordem é apenas organizacional.
//
// ============================================================

// ------------------------------------------------------------
// AUDITOR LÍDER — Planos para aprovar + Planos que executa
// ------------------------------------------------------------

router.get(
  '/auditor/plans-to-approve',
  authorize(...CAN_VIEW_LEAD_DASHBOARD),
  auditPlanController.getPlansToApprove
);

router.get(
  '/auditor/lead-plans',
  authorize(...CAN_VIEW_LEAD_DASHBOARD),
  auditPlanController.getLeadAuditorPlans
);

// ------------------------------------------------------------
// AUDITOR — Planos que participa
// ------------------------------------------------------------

router.get(
  '/auditor/my-plans',
  authorize(...CAN_VIEW_AUDITOR_DASHBOARD),
  auditPlanController.getAuditorPlans
);

// ------------------------------------------------------------
// OBSERVADOR — Planos que acompanha
// ------------------------------------------------------------

router.get(
  '/observer/my-plans',
  authorize(...CAN_VIEW_OBSERVER_DASHBOARD),
  auditPlanController.getObserverPlans
);

// ============================================================
// 🆕 v49.2 — ROTAS DE PERGUNTAS DE AUDITORIA (CLÁUSULAS 4-10)
// ============================================================
//
// ACESSO RESTRITO:
//   Todas as rotas exigem role ADMIN (authorize(UserRole.ADMIN)).
//   Nenhum outro perfil (REP, Consultant, User) pode acessar.
//
// ENDPOINTS:
//   POST   /questions                 → Criar pergunta
//   GET    /questions                 → Listar perguntas (filtros)
//   GET    /questions/stats           → Estatísticas
//   GET    /questions/:id             → Buscar por ID
//   PUT    /questions/:id             → Atualizar
//   DELETE /questions/:id             → Soft delete
//
// ORDEM DAS ROTAS:
//   /stats vem ANTES de /:id para não ser interpretado como ID.
//
// ============================================================

// Listar perguntas (com filtros opcionais)
router.get(
  '/questions',
  authorize(UserRole.ADMIN),
  auditQuestionController.findAll
);

// Estatísticas (antes de /:id para não conflitar)
router.get(
  '/questions/stats',
  authorize(UserRole.ADMIN),
  auditQuestionController.getStats
);

// Criar nova pergunta
router.post(
  '/questions',
  authorize(UserRole.ADMIN),
  auditQuestionController.create
);

// Buscar pergunta por ID
router.get(
  '/questions/:id',
  authorize(UserRole.ADMIN),
  auditQuestionController.findById
);

// Atualizar pergunta
router.put(
  '/questions/:id',
  authorize(UserRole.ADMIN),
  auditQuestionController.update
);

// Excluir pergunta (soft delete)
router.delete(
  '/questions/:id',
  authorize(UserRole.ADMIN),
  auditQuestionController.delete
);

// ============================================================
// 🆕 v50.1 — ROTAS DE PERGUNTAS DE AUDITORIA POR CONTROLE (ANEXO A)
// ============================================================
//
// ACESSO RESTRITO:
//   Todas as rotas exigem role ADMIN (authorize(UserRole.ADMIN)).
//   Nenhum outro perfil (REP, Consultant, User) pode acessar.
//
// ENDPOINTS:
//   POST   /control-questions                 → Criar pergunta
//   GET    /control-questions                 → Listar (filtros)
//   GET    /control-questions/stats           → Estatísticas
//   GET    /control-questions/:id             → Buscar por ID
//   PUT    /control-questions/:id             → Atualizar
//   DELETE /control-questions/:id             → Soft delete
//
// ORDEM DAS ROTAS:
//   /stats vem ANTES de /:id para não ser interpretado como ID.
//
// DIFERENÇA DE /questions:
//   /questions         → cláusulas 4-10 (SGSI)
//   /control-questions → 93 controles do Anexo A
//
// ============================================================

// Listar perguntas de auditoria por controle
router.get(
  '/control-questions',
  authorize(UserRole.ADMIN),
  auditControlQuestionController.findAll
);

// Estatísticas (antes de /:id para não conflitar)
router.get(
  '/control-questions/stats',
  authorize(UserRole.ADMIN),
  auditControlQuestionController.getStats
);

// Criar nova pergunta de auditoria por controle
router.post(
  '/control-questions',
  authorize(UserRole.ADMIN),
  auditControlQuestionController.create
);

// Buscar pergunta por ID
router.get(
  '/control-questions/:id',
  authorize(UserRole.ADMIN),
  auditControlQuestionController.findById
);

// Atualizar pergunta
router.put(
  '/control-questions/:id',
  authorize(UserRole.ADMIN),
  auditControlQuestionController.update
);

// Excluir pergunta (soft delete)
router.delete(
  '/control-questions/:id',
  authorize(UserRole.ADMIN),
  auditControlQuestionController.delete
);

// ============================================================
// ROTAS DE CHECKLISTS
// ============================================================
//
// REGRAS:
//   - Consultar checklists:  todos os roles de auditoria
//   - Editar/concluir:       REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Popular:               REP, ADMIN, AUDITOR_LEAD, AUDITOR
//
// ============================================================

router.get(
  '/checklists/plan/:auditPlanId',
  authorize(...CAN_READ_AUDIT),
  auditChecklistController.findByPlanId
);

router.get(
  '/checklists/plan/:auditPlanId/control/:controlId',
  authorize(...CAN_READ_AUDIT),
  auditChecklistController.findByPlanAndControl
);

router.get(
  '/checklists/plan/:auditPlanId/stats',
  authorize(...CAN_READ_AUDIT),
  auditChecklistController.getStats
);

router.put(
  '/checklists/:id',
  authorize(...CAN_WRITE_AUDIT),
  auditChecklistController.updateChecklist
);

router.post(
  '/checklists/:id/complete',
  authorize(...CAN_WRITE_AUDIT),
  auditChecklistController.complete
);

// 🆕 NOVO (v47.0) - Popula checklists com respostas dos usuários
// POST /api/internal-audit/checklists/populate/:auditPlanId
router.post(
  '/checklists/populate/:auditPlanId',
  authorize(...CAN_WRITE_AUDIT),
  auditChecklistController.populateWithUserResponses
);

// ============================================================
// ROTAS DE NÃO CONFORMIDADES (FINDINGS)
// ============================================================
//
// REGRAS:
//   - Consultar NCs:    todos os roles de auditoria
//   - Criar/editar:     REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Excluir/validar:  REP, ADMIN, AUDITOR_LEAD
//
// ============================================================

router.post(
  '/findings/plan/:auditPlanId',
  authorize(...CAN_WRITE_AUDIT),
  auditFindingController.create
);

router.get(
  '/findings/plan/:auditPlanId',
  authorize(...CAN_READ_AUDIT),
  auditFindingController.findByPlanId
);

router.get(
  '/findings',
  authorize(...CAN_READ_AUDIT),
  auditFindingController.findAll
);

router.get(
  '/findings/:id',
  authorize(...CAN_READ_AUDIT),
  auditFindingController.findById
);

router.put(
  '/findings/:id',
  authorize(...CAN_WRITE_AUDIT),
  auditFindingController.update
);

router.delete(
  '/findings/:id',
  authorize(...CAN_APPROVE_AUDIT),
  auditFindingController.delete
);

router.post(
  '/findings/:id/submit',
  authorize(...CAN_WRITE_AUDIT),
  auditFindingController.submitForValidation
);

router.post(
  '/findings/:id/validate',
  authorize(...CAN_APPROVE_AUDIT),
  auditFindingController.validate
);

router.get(
  '/findings/plan/:auditPlanId/stats',
  authorize(...CAN_READ_AUDIT),
  auditFindingController.getStats
);

// ============================================================
// ROTAS DE EVIDÊNCIAS
// ============================================================
//
// 🆕 v51.1 — CORREÇÃO CRÍTICA:
// ----------------------------------------------------------------
// A rota POST /evidence/upload NÃO tinha Multer aplicado. Sem
// ele, o `multipart/form-data` não era parseado, `req.file`
// ficava `undefined` e `req.body.auditPlanId` nunca chegava ao
// controller — gerando o erro "ID do plano é obrigatório".
//
// A CORREÇÃO:
//   Aplicar `uploadEvidence.single('file')` como middleware
//   ANTES do controller. O middleware:
//     1. Parseia o multipart/form-data.
//     2. Popula `req.file` com o arquivo enviado (campo `file`).
//     3. Popula `req.body` com os demais campos (auditPlanId,
//        findingId, description, questionRef).
//     4. Move o arquivo para `uploads/evidence/<auditPlanId>/`.
//
// TRATAMENTO DE ERRO:
//   `handleEvidenceMulterError` intercepta erros do Multer
//   (limite de tamanho, campo inesperado) e responde 400 com
//   JSON estruturado, ANTES de chegar ao controller.
//
// IMPACTO:
//   Zero regressão. A rota continua com a mesma URL, mesmo
//   controller, mesma resposta em caso de sucesso. A ÚNICA
//   mudança é que agora o multipart é parseado corretamente.
//
// 🆕 v51.5 — ROTA DE DOWNLOAD/VIEW:
// ----------------------------------------------------------------
//   Adicionada a rota GET /evidence/:id/file que serve o
//   arquivo físico para o navegador abrir em nova aba.
//   DEVE VIR ANTES de /evidence/:id (que é catch-all).
//
// 🆕 v52.0 — AUTORIZAÇÃO:
//   - Upload: REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Consulta/Download: todos os roles de auditoria
//   - Exclusão: REP, ADMIN, AUDITOR_LEAD
//
// ============================================================
router.post(
  '/evidence/upload',
  authorize(...CAN_WRITE_AUDIT),
  uploadEvidence.single('file'),
  handleEvidenceMulterError,
  auditEvidenceController.upload
);

// 🆕 v51.5 — Servir o arquivo físico da evidência
// (DEVE VIR ANTES de /evidence/:id)
router.get(
  '/evidence/:id/file',
  authorize(...CAN_READ_AUDIT),
  auditEvidenceController.download
);

router.get(
  '/evidence/plan/:auditPlanId',
  authorize(...CAN_READ_AUDIT),
  auditEvidenceController.findByPlanId
);

router.get(
  '/evidence/finding/:findingId',
  authorize(...CAN_READ_AUDIT),
  auditEvidenceController.findByFindingId
);

router.get(
  '/evidence/:id',
  authorize(...CAN_READ_AUDIT),
  auditEvidenceController.findById
);

router.delete(
  '/evidence/:id',
  authorize(...CAN_APPROVE_AUDIT),
  auditEvidenceController.delete
);

// ============================================================
// ROTAS DE PLANOS DE AÇÃO
// ============================================================
//
// REGRAS:
//   - Consultar:     todos os roles de auditoria
//   - Criar/editar:  REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Excluir:       REP, ADMIN, AUDITOR_LEAD
//   - Validar:       REP, ADMIN, AUDITOR_LEAD
//
// ============================================================

router.post(
  '/actions',
  authorize(...CAN_WRITE_AUDIT),
  auditActionPlanController.create
);

router.get(
  '/actions/finding/:findingId',
  authorize(...CAN_READ_AUDIT),
  auditActionPlanController.findByFindingId
);

router.get(
  '/actions/responsible/:responsible',
  authorize(...CAN_READ_AUDIT),
  auditActionPlanController.findByResponsible
);

router.get(
  '/actions/:id',
  authorize(...CAN_READ_AUDIT),
  auditActionPlanController.findById
);

router.put(
  '/actions/:id',
  authorize(...CAN_WRITE_AUDIT),
  auditActionPlanController.update
);

router.delete(
  '/actions/:id',
  authorize(...CAN_APPROVE_AUDIT),
  auditActionPlanController.delete
);

router.post(
  '/actions/:id/start',
  authorize(...CAN_WRITE_AUDIT),
  auditActionPlanController.startProgress
);

router.post(
  '/actions/:id/complete',
  authorize(...CAN_WRITE_AUDIT),
  auditActionPlanController.complete
);

router.post(
  '/actions/:id/validate',
  authorize(...CAN_APPROVE_AUDIT),
  auditActionPlanController.validate
);

// ============================================================
// ROTAS DE RELATÓRIOS
// ============================================================
//
// REGRAS:
//   - Consultar:        todos os roles de auditoria
//   - Criar/editar:     REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Aprovar/rejeitar: REP, ADMIN, AUDITOR_LEAD
//   - Excluir:          REP, ADMIN, AUDITOR_LEAD
//
// ============================================================

router.post(
  '/reports',
  authorize(...CAN_WRITE_AUDIT),
  auditReportController.create
);

router.get(
  '/reports',
  authorize(...CAN_READ_AUDIT),
  auditReportController.findAll
);

router.get(
  '/reports/plan/:auditPlanId',
  authorize(...CAN_READ_AUDIT),
  auditReportController.findByPlanId
);

router.get(
  '/reports/:id',
  authorize(...CAN_READ_AUDIT),
  auditReportController.findById
);

router.put(
  '/reports/:id',
  authorize(...CAN_WRITE_AUDIT),
  auditReportController.update
);

router.delete(
  '/reports/:id',
  authorize(...CAN_APPROVE_AUDIT),
  auditReportController.delete
);

router.post(
  '/reports/:id/submit',
  authorize(...CAN_WRITE_AUDIT),
  auditReportController.submitForReview
);

router.post(
  '/reports/:id/approve',
  authorize(...CAN_APPROVE_AUDIT),
  auditReportController.approve
);

router.post(
  '/reports/:id/reject',
  authorize(...CAN_APPROVE_AUDIT),
  auditReportController.reject
);

router.post(
  '/reports/plan/:auditPlanId/generate',
  authorize(...CAN_WRITE_AUDIT),
  auditReportController.generateAutoReport
);

// ============================================================
// ROTAS DE PROGRAMA DE AUDITORIAS
// ============================================================
//
// REGRAS:
//   - Consultar:        todos os roles de auditoria
//   - Criar/editar:     REP, ADMIN
//   - Aprovar/arquivar: REP, ADMIN, AUDITOR_LEAD
//   - Excluir:          REP, ADMIN
//
// ============================================================

router.post(
  '/program',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.create
);

router.get(
  '/program/company/:companyId',
  authorize(...CAN_READ_AUDIT),
  auditProgramController.findAllByCompany
);

router.get(
  '/program/company/:companyId/year/:year',
  authorize(...CAN_READ_AUDIT),
  auditProgramController.findByCompanyAndYear
);

router.get(
  '/program/:id',
  authorize(...CAN_READ_AUDIT),
  auditProgramController.findById
);

router.put(
  '/program/:id',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.update
);

router.delete(
  '/program/:id',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.delete
);

router.post(
  '/program/:id/approve',
  authorize(...CAN_APPROVE_AUDIT),
  auditProgramController.approve
);

router.post(
  '/program/:id/activate',
  authorize(...CAN_APPROVE_AUDIT),
  auditProgramController.activate
);

router.post(
  '/program/:id/archive',
  authorize(...CAN_APPROVE_AUDIT),
  auditProgramController.archive
);

router.get(
  '/program/:id/stats',
  authorize(...CAN_READ_AUDIT),
  auditProgramController.getStatistics
);

router.get(
  '/program/:id/next-audits',
  authorize(...CAN_READ_AUDIT),
  auditProgramController.generateNextAudits
);

// Setores
router.post(
  '/program/:id/sector',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.addSector
);

router.put(
  '/program/:id/sector/:index',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.updateSector
);

// Auditoria de fornecedores
router.post(
  '/program/:id/supplier-audit',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.addSupplierAudit
);

router.put(
  '/program/:id/supplier-audit/:index',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.updateSupplierAudit
);

// Auditoria externa
router.put(
  '/program/:id/external-audit',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.updateExternalAudit
);

// Atividades
router.post(
  '/program/:id/activity',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.addActivity
);

router.put(
  '/program/:id/activity/:index',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditProgramController.updateActivity
);

// ============================================================
// ROTAS DE DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================
//
// REGRAS:
//   - Consultar:        todos os roles de auditoria
//   - Criar/editar:     REP, ADMIN
//   - Aprovar/arquivar: REP, ADMIN, AUDITOR_LEAD
//
// ============================================================

router.post(
  '/soa',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditSoAController.create
);

router.get(
  '/soa/company/:companyId',
  authorize(...CAN_READ_AUDIT),
  auditSoAController.findByCompany
);

router.get(
  '/soa/company/:companyId/active',
  authorize(...CAN_READ_AUDIT),
  auditSoAController.findActiveByCompany
);

router.get(
  '/soa/:id',
  authorize(...CAN_READ_AUDIT),
  auditSoAController.findById
);

router.put(
  '/soa/:id',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditSoAController.update
);

router.delete(
  '/soa/:id',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditSoAController.delete
);

router.post(
  '/soa/:id/approve',
  authorize(...CAN_APPROVE_AUDIT),
  auditSoAController.approve
);

router.post(
  '/soa/:id/archive',
  authorize(...CAN_APPROVE_AUDIT),
  auditSoAController.archive
);

router.get(
  '/soa/:id/stats',
  authorize(...CAN_READ_AUDIT),
  auditSoAController.getStatistics
);

router.get(
  '/soa/:id/export',
  authorize(...CAN_READ_AUDIT),
  auditSoAController.exportToSpreadsheet
);

// Controles da SoA
router.put(
  '/soa/:id/control/:clause',
  authorize(UserRole.ADMIN, UserRole.REP),
  auditSoAController.updateControl
);

// ============================================================
// ROTAS DE GESTÃO DE RISCOS
// ============================================================
//
// REGRAS:
//   - Consultar:        todos os roles de auditoria
//   - Criar/editar:     REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Excluir:          REP, ADMIN, AUDITOR_LEAD
//
// ============================================================

router.post(
  '/risks',
  authorize(...CAN_WRITE_AUDIT),
  auditRiskController.create
);

router.get(
  '/risks/plan/:planId',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.findAllByPlan
);

router.get(
  '/risks/company/:companyId',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.findAllByCompany
);

router.get(
  '/risks/company/:companyId/stats',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.getStatistics
);

router.get(
  '/risks/company/:companyId/critical',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.getCriticalRisks
);

router.get(
  '/risks/company/:companyId/export',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.exportToSpreadsheet
);

router.get(
  '/risks/:id',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.findById
);

router.get(
  '/risks/company/:companyId/risk-id/:riskId',
  authorize(...CAN_READ_AUDIT),
  auditRiskController.findByRiskId
);

router.put(
  '/risks/:id',
  authorize(...CAN_WRITE_AUDIT),
  auditRiskController.update
);

router.delete(
  '/risks/:id',
  authorize(...CAN_APPROVE_AUDIT),
  auditRiskController.delete
);

router.put(
  '/risks/:id/assessment',
  authorize(...CAN_WRITE_AUDIT),
  auditRiskController.updateAssessment
);

router.post(
  '/risks/:id/treat',
  authorize(...CAN_WRITE_AUDIT),
  auditRiskController.treatRisk
);

router.put(
  '/risks/:id/monitor',
  authorize(...CAN_WRITE_AUDIT),
  auditRiskController.monitorRisk
);

router.post(
  '/risks/:id/reopen',
  authorize(...CAN_APPROVE_AUDIT),
  auditRiskController.reopenRisk
);

// ============================================================
// ROTAS DE REVISÃO DE DOCUMENTAÇÃO
// ============================================================
//
// REGRAS:
//   - Consultar:        todos os roles de auditoria
//   - Criar/editar:     REP, ADMIN, AUDITOR_LEAD, AUDITOR
//   - Excluir/completar: REP, ADMIN, AUDITOR_LEAD
//
// ============================================================

router.post(
  '/document-review',
  authorize(...CAN_WRITE_AUDIT),
  auditDocumentReviewController.create
);

router.get(
  '/document-review/company/:companyId',
  authorize(...CAN_READ_AUDIT),
  auditDocumentReviewController.findAllByCompany
);

router.get(
  '/document-review/plan/:auditPlanId',
  authorize(...CAN_READ_AUDIT),
  auditDocumentReviewController.findByAuditPlanId
);

router.get(
  '/document-review/:id',
  authorize(...CAN_READ_AUDIT),
  auditDocumentReviewController.findById
);

router.put(
  '/document-review/:id',
  authorize(...CAN_WRITE_AUDIT),
  auditDocumentReviewController.update
);

router.delete(
  '/document-review/:id',
  authorize(...CAN_APPROVE_AUDIT),
  auditDocumentReviewController.delete
);

router.post(
  '/document-review/:id/complete',
  authorize(...CAN_APPROVE_AUDIT),
  auditDocumentReviewController.completeReview
);

router.get(
  '/document-review/:id/summary',
  authorize(...CAN_READ_AUDIT),
  auditDocumentReviewController.getSummary
);

router.get(
  '/document-review/:id/nonconformities',
  authorize(...CAN_READ_AUDIT),
  auditDocumentReviewController.getNonconformities
);

router.get(
  '/document-review/:id/recommendations',
  authorize(...CAN_READ_AUDIT),
  auditDocumentReviewController.getRecommendations
);

// Documentos da revisão
router.put(
  '/document-review/:id/document/:clause',
  authorize(...CAN_WRITE_AUDIT),
  auditDocumentReviewController.updateDocument
);

router.put(
  '/document-review/:id/document/:clause/status',
  authorize(...CAN_WRITE_AUDIT),
  auditDocumentReviewController.updateDocumentStatus
);

router.post(
  '/document-review/:id/document',
  authorize(...CAN_WRITE_AUDIT),
  auditDocumentReviewController.addDocument
);

router.delete(
  '/document-review/:id/document/:clause',
  authorize(...CAN_APPROVE_AUDIT),
  auditDocumentReviewController.removeDocument
);

export default router;
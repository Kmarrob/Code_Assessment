"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const index_js_1 = require("../types/index.js");
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
const multer_1 = require("../config/multer");
const audit_1 = require("../controllers/audit");
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
const RepController_js_1 = require("../controllers/RepController.js");
const router = (0, express_1.Router)();
// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================
router.use(auth_1.authenticate);
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
    index_js_1.UserRole.ADMIN,
    index_js_1.UserRole.REP,
    index_js_1.UserRole.AUDITOR_LEAD,
    index_js_1.UserRole.AUDITOR,
    index_js_1.UserRole.OBSERVER,
];
const CAN_WRITE_AUDIT = [
    index_js_1.UserRole.ADMIN,
    index_js_1.UserRole.REP,
    index_js_1.UserRole.AUDITOR_LEAD,
    index_js_1.UserRole.AUDITOR,
];
const CAN_APPROVE_AUDIT = [
    index_js_1.UserRole.ADMIN,
    index_js_1.UserRole.REP,
    index_js_1.UserRole.AUDITOR_LEAD,
];
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
    index_js_1.UserRole.ADMIN,
    index_js_1.UserRole.AUDITOR_LEAD,
];
const CAN_VIEW_AUDITOR_DASHBOARD = [
    index_js_1.UserRole.ADMIN,
    index_js_1.UserRole.AUDITOR,
];
const CAN_VIEW_OBSERVER_DASHBOARD = [
    index_js_1.UserRole.ADMIN,
    index_js_1.UserRole.OBSERVER,
];
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
router.get('/controls', (0, auth_1.authorize)(...CAN_READ_AUDIT), RepController_js_1.RepController.getCompanyControls);
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
router.get('/dashboard/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDashboardController.getStats);
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
router.post('/plans', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditPlanController.create);
router.get('/plans', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditPlanController.findAll);
router.get('/plans/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditPlanController.getStats);
router.get('/plans/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditPlanController.findById);
router.put('/plans/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditPlanController.update);
router.delete('/plans/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditPlanController.delete);
router.post('/plans/:id/submit', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditPlanController.submitForApproval);
router.post('/plans/:id/approve', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditPlanController.approve);
router.post('/plans/:id/reject', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditPlanController.reject);
router.post('/plans/:id/cancel', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditPlanController.cancel);
router.post('/plans/:id/start', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditPlanController.startAudit);
router.post('/plans/:id/complete', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditPlanController.completeAudit);
// 🆕 NOVO (v47.0) - Buscar respostas dos usuários por plano
router.get('/plans/:planId/responses', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditPlanController.getResponsesByPlan);
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
router.post('/plans/:id/exclusions', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditPlanController.excludeControl);
// Aprovar uma exclusão específica
router.post('/plans/:id/exclusions/:controlId/approve', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditPlanController.approveExclusion);
// Rejeitar uma exclusão específica (devolve o controle ao escopo)
router.post('/plans/:id/exclusions/:controlId/reject', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditPlanController.rejectExclusion);
// Remover uma exclusão já registrada (devolve o controle ao escopo)
router.delete('/plans/:id/exclusions/:controlId', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP, index_js_1.UserRole.AUDITOR_LEAD), audit_1.auditPlanController.removeExclusion);
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
router.get('/auditor/plans-to-approve', (0, auth_1.authorize)(...CAN_VIEW_LEAD_DASHBOARD), audit_1.auditPlanController.getPlansToApprove);
router.get('/auditor/lead-plans', (0, auth_1.authorize)(...CAN_VIEW_LEAD_DASHBOARD), audit_1.auditPlanController.getLeadAuditorPlans);
// ------------------------------------------------------------
// AUDITOR — Planos que participa
// ------------------------------------------------------------
router.get('/auditor/my-plans', (0, auth_1.authorize)(...CAN_VIEW_AUDITOR_DASHBOARD), audit_1.auditPlanController.getAuditorPlans);
// ------------------------------------------------------------
// OBSERVADOR — Planos que acompanha
// ------------------------------------------------------------
router.get('/observer/my-plans', (0, auth_1.authorize)(...CAN_VIEW_OBSERVER_DASHBOARD), audit_1.auditPlanController.getObserverPlans);
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
router.get('/questions', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditQuestionController.findAll);
// Estatísticas (antes de /:id para não conflitar)
router.get('/questions/stats', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditQuestionController.getStats);
// Criar nova pergunta
router.post('/questions', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditQuestionController.create);
// Buscar pergunta por ID
router.get('/questions/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditQuestionController.findById);
// Atualizar pergunta
router.put('/questions/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditQuestionController.update);
// Excluir pergunta (soft delete)
router.delete('/questions/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditQuestionController.delete);
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
router.get('/control-questions', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditControlQuestionController.findAll);
// Estatísticas (antes de /:id para não conflitar)
router.get('/control-questions/stats', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditControlQuestionController.getStats);
// Criar nova pergunta de auditoria por controle
router.post('/control-questions', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditControlQuestionController.create);
// Buscar pergunta por ID
router.get('/control-questions/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditControlQuestionController.findById);
// Atualizar pergunta
router.put('/control-questions/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditControlQuestionController.update);
// Excluir pergunta (soft delete)
router.delete('/control-questions/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), audit_1.auditControlQuestionController.delete);
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
router.get('/checklists/plan/:auditPlanId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditChecklistController.findByPlanId);
router.get('/checklists/plan/:auditPlanId/control/:controlId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditChecklistController.findByPlanAndControl);
router.get('/checklists/plan/:auditPlanId/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditChecklistController.getStats);
router.put('/checklists/:id', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditChecklistController.updateChecklist);
router.post('/checklists/:id/complete', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditChecklistController.complete);
// 🆕 NOVO (v47.0) - Popula checklists com respostas dos usuários
// POST /api/internal-audit/checklists/populate/:auditPlanId
router.post('/checklists/populate/:auditPlanId', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditChecklistController.populateWithUserResponses);
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
router.post('/findings/plan/:auditPlanId', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditFindingController.create);
router.get('/findings/plan/:auditPlanId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditFindingController.findByPlanId);
router.get('/findings', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditFindingController.findAll);
router.get('/findings/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditFindingController.findById);
router.put('/findings/:id', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditFindingController.update);
router.delete('/findings/:id', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditFindingController.delete);
router.post('/findings/:id/submit', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditFindingController.submitForValidation);
router.post('/findings/:id/validate', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditFindingController.validate);
router.get('/findings/plan/:auditPlanId/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditFindingController.getStats);
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
router.post('/evidence/upload', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), multer_1.uploadEvidence.single('file'), multer_1.handleEvidenceMulterError, audit_1.auditEvidenceController.upload);
// 🆕 v51.5 — Servir o arquivo físico da evidência
// (DEVE VIR ANTES de /evidence/:id)
router.get('/evidence/:id/file', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditEvidenceController.download);
router.get('/evidence/plan/:auditPlanId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditEvidenceController.findByPlanId);
router.get('/evidence/finding/:findingId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditEvidenceController.findByFindingId);
router.get('/evidence/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditEvidenceController.findById);
router.delete('/evidence/:id', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditEvidenceController.delete);
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
router.post('/actions', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditActionPlanController.create);
router.get('/actions/finding/:findingId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditActionPlanController.findByFindingId);
router.get('/actions/responsible/:responsible', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditActionPlanController.findByResponsible);
router.get('/actions/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditActionPlanController.findById);
router.put('/actions/:id', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditActionPlanController.update);
router.delete('/actions/:id', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditActionPlanController.delete);
router.post('/actions/:id/start', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditActionPlanController.startProgress);
router.post('/actions/:id/complete', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditActionPlanController.complete);
router.post('/actions/:id/validate', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditActionPlanController.validate);
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
router.post('/reports', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditReportController.create);
router.get('/reports', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditReportController.findAll);
router.get('/reports/plan/:auditPlanId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditReportController.findByPlanId);
router.get('/reports/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditReportController.findById);
router.put('/reports/:id', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditReportController.update);
router.delete('/reports/:id', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditReportController.delete);
router.post('/reports/:id/submit', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditReportController.submitForReview);
router.post('/reports/:id/approve', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditReportController.approve);
router.post('/reports/:id/reject', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditReportController.reject);
router.post('/reports/plan/:auditPlanId/generate', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditReportController.generateAutoReport);
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
router.post('/program', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.create);
router.get('/program/company/:companyId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditProgramController.findAllByCompany);
router.get('/program/company/:companyId/year/:year', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditProgramController.findByCompanyAndYear);
router.get('/program/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditProgramController.findById);
router.put('/program/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.update);
router.delete('/program/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.delete);
router.post('/program/:id/approve', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditProgramController.approve);
router.post('/program/:id/activate', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditProgramController.activate);
router.post('/program/:id/archive', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditProgramController.archive);
router.get('/program/:id/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditProgramController.getStatistics);
router.get('/program/:id/next-audits', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditProgramController.generateNextAudits);
// Setores
router.post('/program/:id/sector', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.addSector);
router.put('/program/:id/sector/:index', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.updateSector);
// Auditoria de fornecedores
router.post('/program/:id/supplier-audit', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.addSupplierAudit);
router.put('/program/:id/supplier-audit/:index', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.updateSupplierAudit);
// Auditoria externa
router.put('/program/:id/external-audit', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.updateExternalAudit);
// Atividades
router.post('/program/:id/activity', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.addActivity);
router.put('/program/:id/activity/:index', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditProgramController.updateActivity);
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
router.post('/soa', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditSoAController.create);
router.get('/soa/company/:companyId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditSoAController.findByCompany);
router.get('/soa/company/:companyId/active', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditSoAController.findActiveByCompany);
router.get('/soa/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditSoAController.findById);
router.put('/soa/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditSoAController.update);
router.delete('/soa/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditSoAController.delete);
router.post('/soa/:id/approve', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditSoAController.approve);
router.post('/soa/:id/archive', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditSoAController.archive);
router.get('/soa/:id/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditSoAController.getStatistics);
router.get('/soa/:id/export', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditSoAController.exportToSpreadsheet);
// Controles da SoA
router.put('/soa/:id/control/:clause', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN, index_js_1.UserRole.REP), audit_1.auditSoAController.updateControl);
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
router.post('/risks', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditRiskController.create);
router.get('/risks/plan/:planId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.findAllByPlan);
router.get('/risks/company/:companyId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.findAllByCompany);
router.get('/risks/company/:companyId/stats', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.getStatistics);
router.get('/risks/company/:companyId/critical', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.getCriticalRisks);
router.get('/risks/company/:companyId/export', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.exportToSpreadsheet);
router.get('/risks/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.findById);
router.get('/risks/company/:companyId/risk-id/:riskId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditRiskController.findByRiskId);
router.put('/risks/:id', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditRiskController.update);
router.delete('/risks/:id', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditRiskController.delete);
router.put('/risks/:id/assessment', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditRiskController.updateAssessment);
router.post('/risks/:id/treat', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditRiskController.treatRisk);
router.put('/risks/:id/monitor', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditRiskController.monitorRisk);
router.post('/risks/:id/reopen', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditRiskController.reopenRisk);
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
router.post('/document-review', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditDocumentReviewController.create);
router.get('/document-review/company/:companyId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDocumentReviewController.findAllByCompany);
router.get('/document-review/plan/:auditPlanId', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDocumentReviewController.findByAuditPlanId);
router.get('/document-review/:id', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDocumentReviewController.findById);
router.put('/document-review/:id', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditDocumentReviewController.update);
router.delete('/document-review/:id', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditDocumentReviewController.delete);
router.post('/document-review/:id/complete', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditDocumentReviewController.completeReview);
router.get('/document-review/:id/summary', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDocumentReviewController.getSummary);
router.get('/document-review/:id/nonconformities', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDocumentReviewController.getNonconformities);
router.get('/document-review/:id/recommendations', (0, auth_1.authorize)(...CAN_READ_AUDIT), audit_1.auditDocumentReviewController.getRecommendations);
// Documentos da revisão
router.put('/document-review/:id/document/:clause', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditDocumentReviewController.updateDocument);
router.put('/document-review/:id/document/:clause/status', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditDocumentReviewController.updateDocumentStatus);
router.post('/document-review/:id/document', (0, auth_1.authorize)(...CAN_WRITE_AUDIT), audit_1.auditDocumentReviewController.addDocument);
router.delete('/document-review/:id/document/:clause', (0, auth_1.authorize)(...CAN_APPROVE_AUDIT), audit_1.auditDocumentReviewController.removeDocument);
exports.default = router;
//# sourceMappingURL=internal-audit.routes.js.map
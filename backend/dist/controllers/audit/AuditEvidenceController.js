"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvidenceController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AuditEvidenceService_1 = require("../../models/audit/services/AuditEvidenceService");
const auditEvidenceService = new AuditEvidenceService_1.AuditEvidenceService();
class AuditEvidenceController {
    // ============================================================
    // UPLOAD DE EVIDÊNCIA
    // ============================================================
    //
    // 🆕 v51.1 — CAMPO `questionRef` (OPCIONAL)
    // ------------------------------------------
    // O corpo da requisição pode agora incluir `questionRef`,
    // que chega como string JSON (FormData) e precisa ser
    // parseado antes de ir para o service.
    //
    // Formato aceito:
    //   questionRef = '{"controlId":"5.12","questionIndex":2}'
    //   questionRef = '{"controlId":"5.12"}'  ← constatação final
    //
    // Se ausente ou malformado, é silenciosamente ignorado
    // (comportamento antigo, 100% compatível).
    //
    // ============================================================
    async upload(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const { auditPlanId, findingId, description, questionRef } = req.body;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
            }
            // ============================================================
            // 🆕 v51.1 — PARSE DEFENSIVO DO `questionRef`
            // ============================================================
            //
            // MOTIVO:
            //   O `questionRef` chega como string via FormData
            //   (`multipart/form-data` não suporta objetos aninhados).
            //   Precisamos fazer JSON.parse antes de passar ao service.
            //
            // SEGURANÇA:
            //   - Se `questionRef` não vier, `parsedQuestionRef` fica
            //     undefined (comportamento antigo).
            //   - Se vier como string inválida, o parse falha e o
            //     campo é silenciosamente ignorado (não quebra o upload).
            //
            // ============================================================
            let parsedQuestionRef;
            if (typeof questionRef === 'string' && questionRef.trim().length > 0) {
                try {
                    const obj = JSON.parse(questionRef);
                    if (obj && typeof obj.controlId === 'string' && obj.controlId.length > 0) {
                        parsedQuestionRef = {
                            controlId: obj.controlId,
                            questionIndex: typeof obj.questionIndex === 'number'
                                ? obj.questionIndex
                                : undefined,
                        };
                    }
                }
                catch (parseErr) {
                    // Não falha o upload — apenas ignora o vínculo
                    console.warn('[AuditEvidenceController] questionRef inválido, ignorado:', questionRef);
                }
            }
            else if (questionRef && typeof questionRef === 'object') {
                // Se por algum motivo o body-parser já parseou o objeto
                if (typeof questionRef.controlId === 'string' &&
                    questionRef.controlId.length > 0) {
                    parsedQuestionRef = {
                        controlId: questionRef.controlId,
                        questionIndex: typeof questionRef.questionIndex === 'number'
                            ? questionRef.questionIndex
                            : undefined,
                    };
                }
            }
            const evidence = await auditEvidenceService.create({
                auditPlanId,
                findingId,
                filename: file.originalname,
                filepath: file.path,
                mimeType: file.mimetype,
                size: file.size,
                description,
                // 🆕 v51.1 — repassa o vínculo já parseado
                questionRef: parsedQuestionRef,
            }, userId);
            return res.status(201).json({ success: true, data: evidence });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR EVIDÊNCIAS POR PLANO
    // ============================================================
    async findByPlanId(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const evidences = await auditEvidenceService.findByPlanId(auditPlanId);
            return res.status(200).json({ success: true, data: evidences });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR EVIDÊNCIAS POR NC
    // ============================================================
    async findByFindingId(req, res) {
        try {
            const { findingId } = req.params;
            if (!findingId) {
                return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
            }
            const evidences = await auditEvidenceService.findByFindingId(findingId);
            return res.status(200).json({ success: true, data: evidences });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // BUSCAR EVIDÊNCIA POR ID
    // ============================================================
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            const evidence = await auditEvidenceService.findById(id);
            if (!evidence) {
                return res.status(404).json({ success: false, message: 'Evidência não encontrada' });
            }
            return res.status(200).json({ success: true, data: evidence });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // 🆕 v51.5 — SERVIR ARQUIVO DA EVIDÊNCIA (DOWNLOAD/VIEW)
    // ============================================================
    //
    // MOTIVO:
    //   O endpoint GET /evidence/:id retorna apenas os METADADOS
    //   (filename, size, mimeType), não o arquivo binário. Sem um
    //   endpoint dedicado, o frontend não consegue abrir o arquivo
    //   ao clicar no chip da evidência.
    //
    // COMPORTAMENTO:
    //   1. Busca os metadados da evidência pelo ID.
    //   2. Verifica se o arquivo físico existe no disco.
    //   3. Faz `res.sendFile(...)` com o mimeType correto e
    //      Content-Disposition inline (abre no navegador em nova aba).
    //
    // SEGURANÇA:
    //   - Rota protegida por `authenticate` (middleware do router).
    //   - Se o arquivo físico não existir (ex.: apagado do disco),
    //     retorna 404 com mensagem clara.
    //
    // COMPATIBILIDADE:
    //   Não altera nenhum método existente. É puramente adicional.
    //
    // ============================================================
    async download(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            const evidence = await auditEvidenceService.findById(id);
            if (!evidence) {
                return res.status(404).json({ success: false, message: 'Evidência não encontrada' });
            }
            const filepath = String(evidence.filepath || '');
            if (!filepath) {
                return res.status(404).json({
                    success: false,
                    message: 'Caminho do arquivo não registrado para esta evidência',
                });
            }
            // Verifica se o arquivo físico existe
            if (!fs_1.default.existsSync(filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Arquivo físico não encontrado no servidor. Pode ter sido removido do disco.',
                });
            }
            // Força o download inline (para o navegador abrir em nova aba)
            const mimeType = String(evidence.mimeType || 'application/octet-stream');
            const filename = String(evidence.filename || path_1.default.basename(filepath));
            // Sanitiza o filename para o header (evita header injection)
            const safeFilename = filename.replace(/[\r\n"]/g, '_');
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(safeFilename)}"`);
            // sendFile respeita Range requests (streaming para arquivos grandes)
            res.sendFile(path_1.default.resolve(filepath));
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // EXCLUIR EVIDÊNCIA
    // ============================================================
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            await auditEvidenceService.delete(id, userId);
            return res.status(200).json({ success: true, message: 'Evidência excluída com sucesso' });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.AuditEvidenceController = AuditEvidenceController;
//# sourceMappingURL=AuditEvidenceController.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceController = void 0;
const GovernanceService_1 = require("../services/GovernanceService");
const FeatureService_1 = require("../services/FeatureService");
const DocumentExportService_1 = require("../services/DocumentExportService");
const PDFService_1 = require("../../../services/PDFService");
const governance_schemas_1 = require("../schemas/governance.schemas");
const Company_1 = require("../../../models/Company");
const AuditService_js_1 = require("../../../services/AuditService.js");
const governanceService = new GovernanceService_1.GovernanceService();
class GovernanceController {
    // 🆕 CORREÇÃO v41.3: Passar userRole para o service
    async create(req, res) {
        try {
            const validation = governance_schemas_1.createGovernanceDocumentSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Dados inválidos',
                    details: validation.error.errors
                });
            }
            const user = req.user;
            const userId = user?.id;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - create
            console.log('🔍 [create] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email
            });
            if (!userId || !companyId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            // Converter datas de string para Date e garantir que level seja DocumentLevel
            const data = {
                ...validation.data,
                level: validation.data.level,
                effectiveDate: new Date(validation.data.effectiveDate),
                reviewDate: new Date(validation.data.reviewDate),
            };
            // 🆕 Passar userRole para o service
            const doc = await governanceService.create(data, userId, companyId, user?.role);
            // 🔐 AUDITORIA: Registro de criação de documento
            if (doc) {
                let compName = user?.company || '';
                if (companyId) {
                    const comp = await Company_1.Company.findById(companyId);
                    if (comp?.name)
                        compName = comp.name;
                }
                await AuditService_js_1.AuditService.logDocumentCreation(userId, user?.email || 'desconhecido', doc._id?.toString() || doc.id || '', doc.code || '', doc.title || '', companyId || '', compName, req, true);
            }
            return res.status(201).json(doc);
        }
        catch (error) {
            console.error('Erro ao criar documento:', error);
            // 🔐 AUDITORIA: Falha ao criar documento
            const user = req.user;
            if (user?.id) {
                await AuditService_js_1.AuditService.logDocumentCreation(user.id, user.email || 'desconhecido', '', req.body?.code || '', req.body?.title || '', user.companyId || '', user.company || '', req, false, error instanceof Error ? error.message : 'Erro interno ao criar documento');
            }
            return res.status(500).json({ error: 'Erro interno ao criar documento' });
        }
    }
    async findAll(req, res) {
        try {
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - findAll
            console.log('🔍 [findAll] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email
            });
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const filters = governance_schemas_1.governanceFiltersSchema.parse(req.query);
            // 🔧 CORREÇÃO: Converter level para DocumentLevel se existir
            const serviceFilters = { ...filters };
            if (filters.level !== undefined) {
                serviceFilters.level = Number(filters.level);
            }
            const docs = await governanceService.findAll(companyId, serviceFilters);
            return res.json(docs);
        }
        catch (error) {
            console.error('Erro ao listar documentos:', error);
            return res.status(500).json({ error: 'Erro interno ao listar documentos' });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - findById
            console.log('🔍 [findById] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id) {
                return res.status(400).json({ error: 'ID do documento é obrigatório' });
            }
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const doc = await governanceService.findById(id, companyId);
            if (!doc) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            return res.json(doc);
        }
        catch (error) {
            console.error('Erro ao buscar documento:', error);
            return res.status(500).json({ error: 'Erro interno ao buscar documento' });
        }
    }
    // 🆕 CORREÇÃO v41.2: Passar userRole para o service
    async update(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            const userId = user?.id;
            // 🔍 LOG DE DIAGNÓSTICO - update
            console.log('🔍 [update] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id) {
                return res.status(400).json({ error: 'ID do documento é obrigatório' });
            }
            if ((!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') || !userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const validation = governance_schemas_1.updateGovernanceDocumentSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Dados inválidos',
                    details: validation.error.errors
                });
            }
            // Converter datas de string para Date se existirem
            const data = { ...validation.data };
            if (data.effectiveDate)
                data.effectiveDate = new Date(data.effectiveDate);
            if (data.reviewDate)
                data.reviewDate = new Date(data.reviewDate);
            // 🆕 Passar userRole para o service
            const doc = await governanceService.update(id, data, userId, companyId, user?.role);
            if (!doc) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            // 🔐 AUDITORIA: Registro de atualização de documento
            let compName = user?.company || '';
            if (companyId) {
                const comp = await Company_1.Company.findById(companyId);
                if (comp?.name)
                    compName = comp.name;
            }
            await AuditService_js_1.AuditService.log({
                userId,
                userEmail: user?.email || 'desconhecido',
                companyId: companyId || '',
                companyName: compName,
                action: 'DOCUMENT_UPDATED',
                category: 'governance',
                level: 'info',
                resource: 'GovernanceDocument',
                resourceId: id,
                resourceName: doc.code || doc.title,
                details: { metadata: validation.data },
                success: true,
                ip: AuditService_js_1.AuditService.getRequestInfo(req).ip,
                userAgent: AuditService_js_1.AuditService.getRequestInfo(req).userAgent,
                method: req.method,
                path: req.path
            });
            return res.json(doc);
        }
        catch (error) {
            console.error('Erro ao atualizar documento:', error);
            return res.status(500).json({ error: 'Erro interno ao atualizar documento' });
        }
    }
    // 🆕 CORREÇÃO v41.2: Passar userRole para o service
    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - delete
            console.log('🔍 [delete] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id) {
                return res.status(400).json({ error: 'ID do documento é obrigatório' });
            }
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            // 🆕 Passar userRole para o service
            const deleted = await governanceService.delete(id, companyId, user?.role);
            if (!deleted) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            // 🔐 AUDITORIA: Registro de exclusão de documento
            let compName = user?.company || '';
            if (companyId) {
                const comp = await Company_1.Company.findById(companyId);
                if (comp?.name)
                    compName = comp.name;
            }
            await AuditService_js_1.AuditService.log({
                userId: user?.id,
                userEmail: user?.email || 'desconhecido',
                companyId: companyId || '',
                companyName: compName,
                action: 'DOCUMENT_DELETED',
                category: 'governance',
                level: 'warning',
                resource: 'GovernanceDocument',
                resourceId: id,
                success: true,
                ip: AuditService_js_1.AuditService.getRequestInfo(req).ip,
                userAgent: AuditService_js_1.AuditService.getRequestInfo(req).userAgent,
                method: req.method,
                path: req.path
            });
            return res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao excluir documento:', error);
            return res.status(500).json({ error: 'Erro interno ao excluir documento' });
        }
    }
    // 🆕 CORREÇÃO v41.2: Passar userRole para o service
    async approve(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            const userId = user?.id;
            // 🔍 LOG DE DIAGNÓSTICO - approve
            console.log('🔍 [approve] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id) {
                return res.status(400).json({ error: 'ID do documento é obrigatório' });
            }
            if ((!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') || !userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            // 🆕 Passar userRole para o service
            const doc = await governanceService.approve(id, userId, companyId, user?.role);
            if (!doc) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            // 🔐 AUDITORIA: Registro de aprovação de documento
            let compName = user?.company || '';
            if (companyId) {
                const comp = await Company_1.Company.findById(companyId);
                if (comp?.name)
                    compName = comp.name;
            }
            await AuditService_js_1.AuditService.logDocumentApproval(userId, user?.email || 'desconhecido', doc._id?.toString() || id, doc.code || '', doc.title || '', companyId || '', compName, req, true);
            return res.json(doc);
        }
        catch (error) {
            console.error('Erro ao aprovar documento:', error);
            return res.status(500).json({ error: 'Erro interno ao aprovar documento' });
        }
    }
    async getByLevel(req, res) {
        try {
            const { level } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - getByLevel
            console.log('🔍 [getByLevel] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                level: level
            });
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const docs = await governanceService.getByLevel(companyId, Number(level));
            return res.json(docs);
        }
        catch (error) {
            console.error('Erro ao buscar documentos por nível:', error);
            return res.status(500).json({ error: 'Erro interno ao buscar documentos' });
        }
    }
    async getTree(req, res) {
        try {
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - getTree
            console.log('🔍 [getTree] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email
            });
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const tree = await governanceService.getTree(companyId);
            return res.json(tree);
        }
        catch (error) {
            console.error('Erro ao buscar árvore documental:', error);
            return res.status(500).json({ error: 'Erro interno ao buscar árvore documental' });
        }
    }
    // ============================================
    // 🆕 NOVO (v39) - ENDPOINTS DE DOWNLOAD
    // ============================================
    /**
     * Download de documento em formato DOC
     */
    async downloadDoc(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - downloadDoc
            console.log('🔍 [downloadDoc] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id) {
                return res.status(400).json({ error: 'ID do documento é obrigatório' });
            }
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const doc = await governanceService.findById(id, companyId);
            if (!doc) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            // Buscar nome da empresa
            let companyName = 'Empresa';
            if (companyId) {
                const company = await Company_1.Company.findById(companyId);
                if (company?.name)
                    companyName = company.name;
            }
            // Gerar conteúdo DOC
            const exportService = new DocumentExportService_1.DocumentExportService();
            const content = await exportService.generateDocContent(doc, companyName);
            // Definir nome do arquivo
            const filename = `${doc.code}_${doc.title.replace(/\s+/g, '_')}.doc`;
            // 🔐 AUDITORIA: Registro do download em DOC
            await AuditService_js_1.AuditService.logDocumentDownload(user?.id || '', user?.email || 'desconhecido', doc._id?.toString() || id, doc.code || '', doc.title || '', 'doc', companyId || '', companyName, req, true);
            res.setHeader('Content-Type', 'application/msword');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(content);
        }
        catch (error) {
            console.error('Erro ao baixar DOC:', error);
            return res.status(500).json({ error: 'Erro interno ao baixar documento' });
        }
    }
    /**
     * Download de documento em formato PDF
     */
    async downloadPdf(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - downloadPdf
            console.log('🔍 [downloadPdf] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id) {
                return res.status(400).json({ error: 'ID do documento é obrigatório' });
            }
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            const doc = await governanceService.findById(id, companyId);
            if (!doc) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            // Buscar nome da empresa
            let companyName = 'Empresa';
            if (companyId) {
                const company = await Company_1.Company.findById(companyId);
                if (company?.name)
                    companyName = company.name;
            }
            // Gerar conteúdo PDF HTML
            const exportService = new DocumentExportService_1.DocumentExportService();
            const htmlContent = await exportService.generatePdfContent(doc, companyName);
            // Definir nome do arquivo
            const filename = `${doc.code}_${doc.title.replace(/\s+/g, '_')}.pdf`;
            // Usar o PDFService estático para gerar o buffer PDF
            const pdfBuffer = await PDFService_1.PDFService.generateFromHtml(htmlContent);
            // 🔐 AUDITORIA: Registro do download em PDF
            await AuditService_js_1.AuditService.logDocumentDownload(user?.id || '', user?.email || 'desconhecido', doc._id?.toString() || id, doc.code || '', doc.title || '', 'pdf', companyId || '', companyName, req, true);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao baixar PDF:', error);
            return res.status(500).json({ error: 'Erro interno ao baixar documento' });
        }
    }
    // ============================================
    // 🆕 NOVO (v40/v41) - ENDPOINT DE VISUALIZAÇÃO COM SUBSTITUIÇÃO
    // ============================================
    /**
     * Visualizar documento com placeholders substituídos pelo nome da empresa
     * Suporta busca por _id (ObjectId) ou por code (string)
     */
    async viewDocument(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const companyId = user?.companyId;
            // 🔍 LOG DE DIAGNÓSTICO - viewDocument
            console.log('🔍 [viewDocument] user:', {
                id: user?.id,
                role: user?.role,
                plan: user?.plan,
                companyId: user?.companyId,
                email: user?.email,
                documentId: id
            });
            if (!id || id === 'undefined' || id === 'null') {
                return res.status(400).json({
                    success: false,
                    message: 'Identificador inválido',
                    error: 'ID do documento é obrigatório e deve ser válido'
                });
            }
            if (!companyId && user?.role !== 'ADMIN' && user?.role !== 'admin') {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // 🔧 CORREÇÃO: Admin sempre tem acesso (verifica tanto 'ADMIN' quanto 'admin')
            if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
                const hasAccess = await FeatureService_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
                if (!hasAccess) {
                    return res.status(403).json({
                        error: 'Plano Enterprise necessário para acessar o módulo de governança',
                        code: 'PLAN_FEATURE_NOT_AVAILABLE',
                        requiredPlan: 'enterprise',
                        currentPlan: user?.plan || 'basic',
                    });
                }
            }
            // 🔧 CORREÇÃO: Buscar por _id (ObjectId) OU por code (string)
            let doc = null;
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
            if (isValidObjectId) {
                // Buscar por _id
                doc = await governanceService.findById(id, companyId);
            }
            else {
                // Buscar por code - buscar todos e filtrar
                const allDocs = await governanceService.findAll(companyId, {});
                doc = allDocs.find(d => d.code === id) || null;
            }
            if (!doc) {
                return res.status(404).json({
                    success: false,
                    message: 'Documento não encontrado',
                    error: 'Nenhum documento encontrado com o identificador fornecido'
                });
            }
            // Buscar nome da empresa
            let companyName = 'Empresa';
            if (companyId) {
                const company = await Company_1.Company.findById(companyId);
                if (company?.name)
                    companyName = company.name;
            }
            // Substituir placeholders no conteúdo
            const exportService = new DocumentExportService_1.DocumentExportService();
            const contentWithCompany = exportService.replacePlaceholders(doc.content, companyName);
            // 🔐 AUDITORIA: Registro de visualização do documento
            await AuditService_js_1.AuditService.log({
                userId: user?.id,
                userEmail: user?.email || 'desconhecido',
                companyId: companyId || '',
                companyName,
                action: 'DOCUMENT_VIEWED',
                category: 'governance',
                level: 'info',
                resource: 'GovernanceDocument',
                resourceId: doc._id?.toString() || id,
                resourceName: doc.code || doc.title,
                success: true,
                ip: AuditService_js_1.AuditService.getRequestInfo(req).ip,
                userAgent: AuditService_js_1.AuditService.getRequestInfo(req).userAgent,
                method: req.method,
                path: req.path
            });
            // Retornar documento com o conteúdo substituído
            const docObj = doc.toObject ? doc.toObject() : doc;
            return res.json({
                ...docObj,
                content: contentWithCompany,
            });
        }
        catch (error) {
            console.error('Erro ao visualizar documento:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno ao visualizar documento',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
exports.GovernanceController = GovernanceController;
//# sourceMappingURL=GovernanceController.js.map
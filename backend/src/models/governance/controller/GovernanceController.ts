import { Request, Response } from 'express';
import { GovernanceService } from '../services/GovernanceService';
import { FeatureService } from '../services/FeatureService';
import { DocumentExportService } from '../services/DocumentExportService';
import { 
  createGovernanceDocumentSchema, 
  updateGovernanceDocumentSchema,
  governanceFiltersSchema 
} from '../schemas/governance.schemas';
import { Company } from '../../../models/Company.js';

const governanceService = new GovernanceService();

export class GovernanceController {
  async create(req: Request, res: Response) {
    try {
      const validation = createGovernanceDocumentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.error.errors 
        });
      }

      const user = (req as any).user;
      const userId = user?.id;
      const companyId = user?.companyId;

      if (!userId || !companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Converter datas de string para Date
      const data = {
        ...validation.data,
        effectiveDate: new Date(validation.data.effectiveDate),
        reviewDate: new Date(validation.data.reviewDate),
      };

      const doc = await governanceService.create(data, userId, companyId);
      return res.status(201).json(doc);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      return res.status(500).json({ error: 'Erro interno ao criar documento' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar acesso ao módulo de governança (apenas Enterprise)
      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
            requiredPlan: 'enterprise',
            currentPlan: user?.plan || 'basic',
          });
        }
      }

      const filters = governanceFiltersSchema.parse(req.query);
      const docs = await governanceService.findAll(companyId, filters);
      return res.json(docs);
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return res.status(500).json({ error: 'Erro interno ao listar documentos' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!id) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' });
      }

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
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
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar documento' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;
      const userId = user?.id;

      if (!id) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' });
      }

      if (!companyId || !userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
            requiredPlan: 'enterprise',
            currentPlan: user?.plan || 'basic',
          });
        }
      }

      const validation = updateGovernanceDocumentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.error.errors 
        });
      }

      // Converter datas de string para Date se existirem
      const data: any = { ...validation.data };
      if (data.effectiveDate) data.effectiveDate = new Date(data.effectiveDate);
      if (data.reviewDate) data.reviewDate = new Date(data.reviewDate);

      const doc = await governanceService.update(id, data, userId, companyId);
      if (!doc) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      return res.json(doc);
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar documento' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!id) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' });
      }

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
            requiredPlan: 'enterprise',
            currentPlan: user?.plan || 'basic',
          });
        }
      }

      const deleted = await governanceService.delete(id, companyId);
      if (!deleted) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir documento' });
    }
  }

  async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;
      const userId = user?.id;

      if (!id) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' });
      }

      if (!companyId || !userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
            requiredPlan: 'enterprise',
            currentPlan: user?.plan || 'basic',
          });
        }
      }

      const doc = await governanceService.approve(id, userId, companyId);
      if (!doc) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      return res.json(doc);
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      return res.status(500).json({ error: 'Erro interno ao aprovar documento' });
    }
  }

  async getByLevel(req: Request, res: Response) {
    try {
      const { level } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
            requiredPlan: 'enterprise',
            currentPlan: user?.plan || 'basic',
          });
        }
      }

      const docs = await governanceService.getByLevel(companyId, Number(level) as 1 | 2 | 3 | 4 | 5);
      return res.json(docs);
    } catch (error) {
      console.error('Erro ao buscar documentos por nível:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar documentos' });
    }
  }

  async getTree(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
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
    } catch (error) {
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
  async downloadDoc(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!id) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' });
      }

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar acesso (apenas Enterprise para REP)
      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
          });
        }
      }

      const doc = await governanceService.findById(id, companyId);
      if (!doc) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      // Buscar nome da empresa
      const company = await Company.findById(companyId);
      const companyName = company?.name || 'Empresa';

      // Gerar conteúdo DOC
      const exportService = new DocumentExportService();
      const content = await exportService.generateDocContent(doc, companyName);

      // Definir nome do arquivo
      const filename = `${doc.code}_${doc.title.replace(/\s+/g, '_')}.doc`;

      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(content);
    } catch (error) {
      console.error('Erro ao baixar DOC:', error);
      return res.status(500).json({ error: 'Erro interno ao baixar documento' });
    }
  }

  /**
   * Download de documento em formato PDF
   */
  async downloadPdf(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const companyId = user?.companyId;

      if (!id) {
        return res.status(400).json({ error: 'ID do documento é obrigatório' });
      }

      if (!companyId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar acesso (apenas Enterprise para REP)
      if (user?.role !== 'ADMIN') {
        const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
          return res.status(403).json({
            error: 'Plano Enterprise necessário para acessar o módulo de governança',
            code: 'PLAN_FEATURE_NOT_AVAILABLE',
          });
        }
      }

      const doc = await governanceService.findById(id, companyId);
      if (!doc) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }

      // Buscar nome da empresa
      const company = await Company.findById(companyId);
      const companyName = company?.name || 'Empresa';

      // Gerar conteúdo PDF
      const exportService = new DocumentExportService();
      const htmlContent = await exportService.generatePdfContent(doc, companyName);

      // Definir nome do arquivo
      const filename = `${doc.code}_${doc.title.replace(/\s+/g, '_')}.pdf`;

      // Usar o PDFService existente para gerar o PDF
      const { PDFService } = await import('../../../services/PDFService.js');
      const pdfBuffer = await PDFService.generateFromHtml(htmlContent);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      return res.status(500).json({ error: 'Erro interno ao baixar documento' });
    }
  }
}
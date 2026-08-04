import { GovernanceDocument, IGovernanceDocument } from '../models/GovernanceDocument';
import { CreateGovernanceDocumentDTO, UpdateGovernanceDocumentDTO, GovernanceFilters } from '../types/governance.types';
import { logger } from '../../../utils/logger.js';

export class GovernanceService {
  // 🆕 CORREÇÃO v41.3: ADMIN cria documentos globais (companyId: null, isGlobal: true)
  async create(data: CreateGovernanceDocumentDTO, userId: string, companyId: string, userRole?: string): Promise<IGovernanceDocument> {
    // 🆕 Se for ADMIN, criar como documento global
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin';
    const finalCompanyId = isAdmin ? null : companyId;
    const isGlobal = isAdmin ? true : false;

    logger.info(`📝 [GovernanceService.create] Criando documento:`, {
      code: data.code,
      title: data.title,
      isAdmin,
      companyId: finalCompanyId,
      isGlobal
    });

    const doc = new GovernanceDocument({
      ...data,
      createdBy: userId,
      updatedBy: userId,
      companyId: finalCompanyId,
      isGlobal: isGlobal,
      version: 'v1.0',
      status: 'draft',
      versionHistory: [
        {
          version: 'v1.0',
          date: new Date(),
          user: userId,
          changes: 'Criação inicial do documento',
        },
      ],
    });

    await doc.save();
    return doc;
  }

  async findById(id: string, companyId: string): Promise<IGovernanceDocument | null> {
    // 🆕 Buscar documento da empresa OU documento global
    return GovernanceDocument.findOne({
      _id: id,
      $or: [
        { companyId: companyId },
        { isGlobal: true }
      ],
      deletedAt: null
    }).exec();
  }

  async findAll(companyId: string, filters: GovernanceFilters = {}): Promise<IGovernanceDocument[]> {
    // 🆕 NOVO (v40) - Buscar documentos da empresa OU documentos globais
    const query: any = {
      $or: [
        { companyId: companyId },
        { isGlobal: true }
      ],
      deletedAt: null
    };

    // 🔧 CORREÇÃO: Converter level para número
    if (filters.level) query.level = Number(filters.level);
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    
    // 🔧 CORREÇÃO: O $or para busca já existe, não sobrescrever
    if (filters.search) {
      // Adicionar busca ao query existente
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.framework) {
      query[`frameworks.${filters.framework}`] = { $exists: true, $not: { $size: 0 } };
    }

    const docs = await GovernanceDocument.find(query)
      .sort({ code: 1 })
      .exec();

    return docs;
  }

  // 🔧 CORREÇÃO v41.1: Adicionar $or com isGlobal no update
  // 🆕 CORREÇÃO v41.2: Adicionar bypass para ADMIN
  async update(id: string, data: UpdateGovernanceDocumentDTO, userId: string, companyId: string, userRole?: string): Promise<IGovernanceDocument | null> {
    // 🆕 BYPASS PARA ADMIN: Se for admin, busca apenas por ID e deletedAt
    let query: any = { _id: id, deletedAt: null };
    
    // Se NÃO for admin, aplica as regras de empresa
    if (userRole !== 'ADMIN' && userRole !== 'admin') {
      query = {
        _id: id,
        $or: [
          { companyId: companyId },
          { isGlobal: true }
        ],
        deletedAt: null
      };
    }
    
    const doc = await GovernanceDocument.findOne(query).exec();
    if (!doc) return null;

    const updateData: any = { ...data, updatedBy: userId };

    // Se houver mudança de versão, adicionar ao histórico
    if (data.version && data.versionChanges) {
      if (!doc.versionHistory) {
        doc.versionHistory = [];
      }
      doc.versionHistory.push({
        version: data.version,
        date: new Date(),
        user: userId,
        changes: data.versionChanges,
      });
      updateData.versionHistory = doc.versionHistory;
    }

    Object.assign(doc, updateData);
    await doc.save();
    return doc;
  }

  // 🆕 CORREÇÃO v41.2: Adicionar bypass para ADMIN no delete
  async delete(id: string, companyId: string, userRole?: string): Promise<boolean> {
    // 🆕 BYPASS PARA ADMIN: Se for admin, busca apenas por ID e deletedAt
    let query: any = { _id: id, deletedAt: null };
    
    // Se NÃO for admin, aplica as regras de empresa
    if (userRole !== 'ADMIN' && userRole !== 'admin') {
      query = {
        _id: id,
        $or: [
          { companyId: companyId },
          { isGlobal: true }
        ],
        deletedAt: null
      };
    }
    
    const doc = await GovernanceDocument.findOne(query).exec();
    if (!doc) return false;

    doc.deletedAt = new Date();
    doc.status = 'archived';
    await doc.save();
    return true;
  }

  // 🆕 CORREÇÃO v41.2: Adicionar bypass para ADMIN no approve
  async approve(id: string, userId: string, companyId: string, userRole?: string): Promise<IGovernanceDocument | null> {
    // 🆕 BYPASS PARA ADMIN: Se for admin, busca apenas por ID e deletedAt
    let query: any = { _id: id, deletedAt: null };
    
    // Se NÃO for admin, aplica as regras de empresa
    if (userRole !== 'ADMIN' && userRole !== 'admin') {
      query = {
        _id: id,
        $or: [
          { companyId: companyId },
          { isGlobal: true }
        ],
        deletedAt: null
      };
    }
    
    const doc = await GovernanceDocument.findOne(query).exec();
    if (!doc) return null;

    doc.status = 'approved';
    doc.approvedBy = userId;
    doc.approvedAt = new Date();
    await doc.save();
    return doc;
  }

  async getByLevel(companyId: string, level: 1 | 2 | 3 | 4 | 5): Promise<IGovernanceDocument[]> {
    const docs = await GovernanceDocument.find({
      $or: [
        { companyId: companyId },
        { isGlobal: true }
      ],
      level,
      status: 'approved',
      deletedAt: null,
    })
    .sort({ code: 1 })
    .exec();

    return docs;
  }

  async getByCategory(companyId: string, category: string): Promise<IGovernanceDocument[]> {
    const docs = await GovernanceDocument.find({
      $or: [
        { companyId: companyId },
        { isGlobal: true }
      ],
      category,
      status: 'approved',
      deletedAt: null,
    })
    .sort({ code: 1 })
    .exec();

    return docs;
  }

  async getTree(companyId: string): Promise<any> {
    const allDocs = await this.findAll(companyId, { status: 'approved' });
    
    // Construir árvore hierárquica
    const tree: any = {};
    const levelMap: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

    allDocs.forEach(doc => {
      const level = doc.level as keyof typeof levelMap;
      if (!levelMap[level]) {
        levelMap[level] = [];
      }
      levelMap[level].push(doc);
    });

    // Organizar por hierarquia
    Object.keys(levelMap).forEach(level => {
      const levelNum = Number(level);
      const docs = levelMap[levelNum] || [];
      docs.forEach((doc: any) => {
        if (doc.parentId) {
          // Encontrar pai e adicionar como filho
        }
      });
    });

    return levelMap;
  }

  async searchByKeyword(companyId: string, keyword: string): Promise<IGovernanceDocument[]> {
    const docs = await GovernanceDocument.find({
      $or: [
        { companyId: companyId },
        { isGlobal: true }
      ],
      keywords: { $in: [new RegExp(keyword, 'i')] },
      status: 'approved',
      deletedAt: null,
    })
    .sort({ code: 1 })
    .exec();

    return docs;
  }
}
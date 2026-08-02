import { GovernanceDocument, IGovernanceDocument } from '../models/GovernanceDocument';
import { CreateGovernanceDocumentDTO, UpdateGovernanceDocumentDTO, GovernanceFilters } from '../types/governance.types';
import { logger } from '../../../utils/logger.js';

export class GovernanceService {
  async create(data: CreateGovernanceDocumentDTO, userId: string, companyId: string): Promise<IGovernanceDocument> {
    const doc = new GovernanceDocument({
      ...data,
      createdBy: userId,
      updatedBy: userId,
      companyId,
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
    return GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
  }

  async findAll(companyId: string, filters: GovernanceFilters = {}): Promise<IGovernanceDocument[]> {
    const query: any = { companyId, deletedAt: null };

    if (filters.level) query.level = filters.level;
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
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

  async update(id: string, data: UpdateGovernanceDocumentDTO, userId: string, companyId: string): Promise<IGovernanceDocument | null> {
    const doc = await GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
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

  async delete(id: string, companyId: string): Promise<boolean> {
    const doc = await GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
    if (!doc) return false;

    doc.deletedAt = new Date();
    doc.status = 'archived';
    await doc.save();
    return true;
  }

  async approve(id: string, userId: string, companyId: string): Promise<IGovernanceDocument | null> {
    const doc = await GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
    if (!doc) return null;

    doc.status = 'approved';
    doc.approvedBy = userId;
    doc.approvedAt = new Date();
    await doc.save();
    return doc;
  }

  async getByLevel(companyId: string, level: 1 | 2 | 3 | 4 | 5): Promise<IGovernanceDocument[]> {
    const docs = await GovernanceDocument.find({
      companyId,
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
      companyId,
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
      companyId,
      keywords: { $in: [new RegExp(keyword, 'i')] },
      status: 'approved',
      deletedAt: null,
    })
    .sort({ code: 1 })
    .exec();

    return docs;
  }
}
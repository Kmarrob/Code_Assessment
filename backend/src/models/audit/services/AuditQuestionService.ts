import { AuditQuestion, IAuditQuestion } from '../models/AuditQuestion';

export interface IQuestionFilters {
  search?: string;
  category?: 'clause' | 'control';
  isActive?: boolean;
  clause?: string;
  section?: string;
}

export class AuditQuestionService {
  /**
   * Criar uma nova pergunta
   */
  async create(data: Partial<IAuditQuestion>, userId: string): Promise<IAuditQuestion> {
    const question = new AuditQuestion({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
    return await question.save();
  }

  /**
   * Listar perguntas com filtros
   */
  async findAll(filters: IQuestionFilters = {}): Promise<IAuditQuestion[]> {
    const query: any = { deletedAt: null };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.clause) {
      query.clause = filters.clause;
    }

    if (filters.section) {
      query.section = filters.section;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { text: searchRegex },
        { clause: searchRegex },
        { section: searchRegex },
      ];
    }

    const results = await AuditQuestion.find(query)
      .sort({ section: 1, order: 1, clause: 1 })
      .exec();

    return results.map((doc) => doc.toObject() as IAuditQuestion);
  }

  /**
   * Buscar pergunta por ID
   */
  async findById(id: string): Promise<IAuditQuestion | null> {
    const result = await AuditQuestion.findOne({ _id: id, deletedAt: null }).exec();
    return result ? (result.toObject() as IAuditQuestion) : null;
  }

  /**
   * Atualizar pergunta
   */
  async update(id: string, data: Partial<IAuditQuestion>, userId: string): Promise<IAuditQuestion | null> {
    const result = await AuditQuestion.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    ).exec();
    return result ? (result.toObject() as IAuditQuestion) : null;
  }

  /**
   * Ativar/Desativar pergunta
   */
  async toggleStatus(id: string, isActive: boolean, userId: string): Promise<IAuditQuestion | null> {
    const result = await AuditQuestion.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { isActive, updatedBy: userId },
      { new: true }
    ).exec();
    return result ? (result.toObject() as IAuditQuestion) : null;
  }

  /**
   * Excluir pergunta (soft delete)
   */
  async delete(id: string, userId: string): Promise<IAuditQuestion | null> {
    const result = await AuditQuestion.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), updatedBy: userId },
      { new: true }
    ).exec();
    return result ? (result.toObject() as IAuditQuestion) : null;
  }

  /**
   * Buscar perguntas por cláusula
   */
  async findByClause(clause: string, onlyActive: boolean = true): Promise<IAuditQuestion[]> {
    const query: any = { clause, deletedAt: null };
    if (onlyActive) {
      query.isActive = true;
    }
    const results = await AuditQuestion.find(query)
      .sort({ order: 1 })
      .exec();
    return results.map((doc) => doc.toObject() as IAuditQuestion);
  }

  /**
   * Buscar perguntas por seção
   */
  async findBySection(section: string, onlyActive: boolean = true): Promise<IAuditQuestion[]> {
    const query: any = { section, deletedAt: null };
    if (onlyActive) {
      query.isActive = true;
    }
    const results = await AuditQuestion.find(query)
      .sort({ clause: 1, order: 1 })
      .exec();
    return results.map((doc) => doc.toObject() as IAuditQuestion);
  }

  /**
   * Buscar perguntas por controle
   */
  async findByControlId(controlId: string, onlyActive: boolean = true): Promise<IAuditQuestion[]> {
    const query: any = { controlId, category: 'control', deletedAt: null };
    if (onlyActive) {
      query.isActive = true;
    }
    const results = await AuditQuestion.find(query)
      .sort({ order: 1 })
      .exec();
    return results.map((doc) => doc.toObject() as IAuditQuestion);
  }

  /**
   * Obter estatísticas das perguntas
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: { clause: number; control: number };
    bySection: Record<string, number>;
  }> {
    const total = await AuditQuestion.countDocuments({ deletedAt: null });
    const active = await AuditQuestion.countDocuments({ deletedAt: null, isActive: true });
    const inactive = await AuditQuestion.countDocuments({ deletedAt: null, isActive: false });

    const byCategory = {
      clause: await AuditQuestion.countDocuments({ deletedAt: null, category: 'clause' }),
      control: await AuditQuestion.countDocuments({ deletedAt: null, category: 'control' }),
    };

    const sections = await AuditQuestion.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const bySection: Record<string, number> = {};
    sections.forEach((s: any) => {
      bySection[s._id] = s.count;
    });

    return { total, active, inactive, byCategory, bySection };
  }
}

export const auditQuestionService = new AuditQuestionService();
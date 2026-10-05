import { AuditControlQuestion, IAuditControlQuestion } from '../models/AuditControlQuestion';
import {
  CreateAuditControlQuestionInput,
  UpdateAuditControlQuestionInput,
  AuditControlQuestionFiltersInput,
} from '../schemas/auditControlQuestion.schemas';

// ============================================================
// AUDIT CONTROL QUESTION SERVICE — v50.1
// ============================================================
//
// Serviço de CRUD da coleção AuditControlQuestion.
//
// Coleção NOVA e ISOLADA. Não altera nenhum serviço existente.
//
// Padrão seguido:
//   - Mesma estrutura do AuditQuestionService (cláusulas)
//   - Soft delete com deletedAt
//   - Filtros combináveis
//   - getStats() para a tela do admin
//
// NÃO HÁ SEED. O cadastro é 100% manual pelo ADMIN.
// ============================================================

// ============================================================
// TIPOS AUXILIARES
// ============================================================

export interface AuditControlQuestionStats {
  total: number;
  active: number;
  inactive: number;
  byControlGroup: Record<string, number>;
  byControlId: Record<string, number>;
}

// ============================================================
// SERVICE
// ============================================================

export class AuditControlQuestionService {

  // ============================================================
  // CREATE
  // ============================================================

  /**
   * Cria uma nova pergunta de auditoria por controle.
   *
   * @param data       Dados validados pelo schema Zod
   * @param createdBy  ID do ADMIN que está criando
   */
  async create(
    data: CreateAuditControlQuestionInput,
    createdBy: string
  ): Promise<IAuditControlQuestion> {

    if (!createdBy) {
      throw new Error(
        'O usuário criador é obrigatório para cadastrar uma pergunta de auditoria'
      );
    }

    if (!data || !data.controlId || !data.text) {
      throw new Error(
        'Código do controle e texto da pergunta são obrigatórios'
      );
    }

    const question = new AuditControlQuestion({
      controlId: data.controlId.trim(),

      controlName: data.controlName.trim(),

      controlGroup: data.controlGroup?.trim() || '',

      text: data.text.trim(),

      objective: data.objective?.trim() || '',

      guidance: data.guidance?.trim() || '',

      evidenceExpected: data.evidenceExpected?.trim() || '',

      order: data.order ?? 1,

      active: data.active ?? true,

      createdBy,
    });

    await question.save();

    return question;
  }

  // ============================================================
  // FIND ALL (com filtros)
  // ============================================================

  /**
   * Lista perguntas de auditoria por controle.
   *
   * Filtros suportados:
   *   - controlId       (código ISO ex.: "5.1")
   *   - controlGroup    (ex.: "A.5 Organizacionais")
   *   - active          (true/false)
   *   - search          (busca textual em text, objective, guidance)
   */
  async findAll(
    filters: AuditControlQuestionFiltersInput = {}
  ): Promise<IAuditControlQuestion[]> {

    const query: any = {};

    if (filters.controlId) {
      query.controlId = filters.controlId.trim();
    }

    if (filters.controlGroup) {
      query.controlGroup = filters.controlGroup.trim();
    }

    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    if (filters.search) {
      // Escapar caracteres especiais do regex
      const escaped = filters.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      query.$or = [
        { text: { $regex: escaped, $options: 'i' } },
        { objective: { $regex: escaped, $options: 'i' } },
        { guidance: { $regex: escaped, $options: 'i' } },
        { evidenceExpected: { $regex: escaped, $options: 'i' } },
      ];
    }

    return AuditControlQuestion.find(query)
      .sort({ controlId: 1, order: 1, createdAt: 1 })
      .lean();
  }

  // ============================================================
  // FIND BY ID
  // ============================================================

  async findById(
    id: string
  ): Promise<IAuditControlQuestion | null> {

    const normalizedId = String(id || '').trim();

    if (!normalizedId) {
      throw new Error('ID da pergunta é obrigatório');
    }

    return AuditControlQuestion.findById(normalizedId).lean();
  }

  // ============================================================
  // FIND BY CONTROL ID (código ISO)
  // ============================================================

  /**
   * Lista todas as perguntas ativas de um controle específico.
   *
   * Usado pelo generateChecklist() para popular o checklist do
   * auditor com as perguntas de auditoria do controle.
   */
  async findByControlId(
    controlId: string,
    onlyActive: boolean = true
  ): Promise<IAuditControlQuestion[]> {

    const normalized = String(controlId || '').trim();

    if (!normalized) {
      throw new Error('Código do controle é obrigatório');
    }

    const query: any = { controlId: normalized };

    if (onlyActive) {
      query.active = true;
    }

    return AuditControlQuestion.find(query)
      .sort({ order: 1, createdAt: 1 })
      .lean();
  }

  // ============================================================
  // UPDATE
  // ============================================================

  /**
   * Atualiza campos permitidos de uma pergunta.
   *
   * Campos NÃO atualizáveis:
   *   - _id, createdBy, createdAt, deletedAt
   */
  async update(
    id: string,
    data: UpdateAuditControlQuestionInput,
    updatedBy: string
  ): Promise<IAuditControlQuestion | null> {

    const normalizedId = String(id || '').trim();

    if (!normalizedId) {
      throw new Error('ID da pergunta é obrigatório');
    }

    if (!updatedBy) {
      throw new Error('O usuário que está atualizando é obrigatório');
    }

    const question = await AuditControlQuestion.findById(normalizedId);

    if (!question) {
      throw new Error('Pergunta de auditoria não encontrada');
    }

    // ---- Campos editáveis ----

    if (data.controlId !== undefined) {
      question.controlId = data.controlId.trim();
    }

    if (data.controlName !== undefined) {
      question.controlName = data.controlName.trim();
    }

    if (data.controlGroup !== undefined) {
      question.controlGroup = data.controlGroup.trim();
    }

    if (data.text !== undefined) {
      question.text = data.text.trim();
    }

    if (data.objective !== undefined) {
      question.objective = data.objective.trim();
    }

    if (data.guidance !== undefined) {
      question.guidance = data.guidance.trim();
    }

    if (data.evidenceExpected !== undefined) {
      question.evidenceExpected = data.evidenceExpected.trim();
    }

    if (data.order !== undefined) {
      question.order = data.order;
    }

    if (data.active !== undefined) {
      question.active = data.active;
    }

    question.updatedBy = updatedBy;

    await question.save();

    return question;
  }

  // ============================================================
  // DELETE (soft delete)
  // ============================================================

  /**
   * Marca a pergunta como deletada (soft delete).
   *
   * A pergunta permanece no banco para fins históricos.
   * Filtros automáticos (pre('find')) escondem registros com
   * deletedAt preenchido.
   */
  async delete(
    id: string,
    deletedBy: string
  ): Promise<boolean> {

    const normalizedId = String(id || '').trim();

    if (!normalizedId) {
      throw new Error('ID da pergunta é obrigatório');
    }

    if (!deletedBy) {
      throw new Error('O usuário que está excluindo é obrigatório');
    }

    const question = await AuditControlQuestion.findById(normalizedId);

    if (!question) {
      throw new Error('Pergunta de auditoria não encontrada');
    }

    question.deletedAt = new Date();
    question.updatedBy = deletedBy;

    await question.save();

    return true;
  }

  // ============================================================
  // STATS
  // ============================================================

  /**
   * Estatísticas agregadas para a tela do admin.
   *
   * Retorna:
   *   - total, active, inactive
   *   - byControlGroup: { "A.5 Organizacionais": 37, ... }
   *   - byControlId:    { "5.1": 6, "5.2": 2, ... }
   */
  async getStats(): Promise<AuditControlQuestionStats> {

    const all = await AuditControlQuestion.find({}).lean();

    const total = all.length;

    const active = all.filter((q) => q.active).length;

    const inactive = total - active;

    const byControlGroup: Record<string, number> = {};

    const byControlId: Record<string, number> = {};

    for (const q of all) {
      const group = q.controlGroup || 'Sem grupo';

      byControlGroup[group] = (byControlGroup[group] || 0) + 1;

      const control = q.controlId || 'Sem controle';

      byControlId[control] = (byControlId[control] || 0) + 1;
    }

    return {
      total,
      active,
      inactive,
      byControlGroup,
      byControlId,
    };
  }
}

// ============================================================
// INSTÂNCIA SINGLETON
// ============================================================

export const auditControlQuestionService =
  new AuditControlQuestionService();
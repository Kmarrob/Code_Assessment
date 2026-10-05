// ============================================================
// AUDIT CONTROL QUESTION — TIPOS (FRONTEND) — v50.1
// ============================================================
//
// Tipos da coleção AuditControlQuestion (perguntas de auditoria
// por controle do Anexo A — ISO 27001:2022).
//
// Coleção NOVA e ISOLADA. Não altera nenhum tipo existente.
//
// ============================================================

// ============================================================
// ENTIDADE COMPLETA
// ============================================================

export interface AuditControlQuestionFull {
  _id: string;
  id?: string;

  /**
   * Código ISO do controle (ex.: "5.1", "6.2", "8.34").
   * NÃO é ObjectId — é o mesmo formato usado em Control.id.
   */
  controlId: string;

  /**
   * Nome do controle (ex.: "Políticas de segurança da informação").
   */
  controlName: string;

  /**
   * Grupo do controle (ex.: "A.5 Organizacionais").
   */
  controlGroup?: string;

  /**
   * Texto da pergunta de auditoria.
   */
  text: string;

  /**
   * Objetivo da pergunta (o que o auditor quer confirmar).
   */
  objective?: string;

  /**
   * Orientação ao auditor (como investigar).
   */
  guidance?: string;

  /**
   * Evidência esperada para esta pergunta.
   */
  evidenceExpected?: string;

  /**
   * Ordem de exibição dentro do controle.
   */
  order: number;

  /**
   * Indica se a pergunta está ativa.
   */
  active: boolean;

  /**
   * ID do ADMIN que cadastrou a pergunta.
   */
  createdBy: string;

  /**
   * ID do usuário que fez a última atualização.
   */
  updatedBy?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ============================================================
// DTOs
// ============================================================

export interface CreateAuditControlQuestionDTO {
  controlId: string;
  controlName: string;
  controlGroup?: string;
  text: string;
  objective?: string;
  guidance?: string;
  evidenceExpected?: string;
  order?: number;
  active?: boolean;
}

export interface UpdateAuditControlQuestionDTO {
  controlId?: string;
  controlName?: string;
  controlGroup?: string;
  text?: string;
  objective?: string;
  guidance?: string;
  evidenceExpected?: string;
  order?: number;
  active?: boolean;
}

// ============================================================
// FILTROS
// ============================================================

export interface AuditControlQuestionFilters {
  controlId?: string;
  controlGroup?: string;
  active?: boolean;
  search?: string;
}

// ============================================================
// ESTATÍSTICAS
// ============================================================

export interface AuditControlQuestionStats {
  total: number;
  active: number;
  inactive: number;
  byControlGroup: Record<string, number>;
  byControlId: Record<string, number>;
}
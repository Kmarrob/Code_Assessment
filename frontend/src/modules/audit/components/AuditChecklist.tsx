import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertCircle,
  Upload,
  Wand2,
  ChevronDown,
  ChevronRight,
  FileText,
  ClipboardList,
  Target,
  Loader2,      // 🆕 v51.1 — spinner de upload
  Paperclip,    // 🆕 v51.1 — ícone de anexo
  Trash2,       // 🆕 v51.1 — ícone de remover evidência
} from 'lucide-react';
import {
  AuditChecklist as AuditChecklistType,
  AuditChecklistItem,
  AuditChecklistAuditQuestion,
  AuditChecklistAnswer,
} from '../types/audit.types';

// ============================================================
// AUDIT CHECKLIST — v51.2
// ============================================================
//
// Este componente agora suporta DOIS modos:
//
//   MODO 1 — SIMPLES (compatibilidade)
//     Só renderiza as perguntas do Assessment (questions[]).
//     Usado por checklists antigos que não têm auditQuestions[].
//     Comportamento IDÊNTICO ao anterior.
//
//   MODO 2 — COMPLETO (v50.1)
//     Renderiza:
//       Bloco 1 — Contexto do Assessment (colapsável)
//       Bloco 2 — Perguntas de auditoria (C/NC/OB/OM/NA + obs)
//       Bloco 3 — Constatação final do controle
//       Bloco 4 — Perguntas do Assessment (formulário)
//
// A escolha do modo é automática: se `checklist.auditQuestions`
// existe e tem itens, entra no MODO 2. Caso contrário, MODO 1.
//
// COMPATIBILIDADE DE PROPS:
//   - `onUpdate`     — MANTIDA (só questions[])
//   - `onUpdateFull` — NOVA (v50.1), opcional; quando presente, é
//                      chamada com o payload completo.
//   - `onUploadEvidence` — 🆕 v51.1, opcional; quando presente,
//                          habilita o botão "Anexar Evidência" em
//                          cada pergunta de auditoria e na
//                          constatação final.
//   - `evidenceMap`  — 🆕 v51.1, opcional; mapa id → {filename, size}
//                      para exibir nomes amigáveis das evidências.
//
// 🔧 v51.2 — CORREÇÃO CRÍTICA DE ESTADO
// ----------------------------------------
// PROBLEMA (reportado em produção em 06/out/2026):
//   Ao selecionar uma opção no <select> C/NC/OB/OM/NA, a
//   escolha "voltava" para "--" imediatamente. Nenhuma
//   requisição de rede acontecia; nenhum erro no console.
//
// CAUSA RAIZ:
//   O `useEffect` de inicialização tinha como dependência o
//   OBJETO `checklist` (e o ARRAY `companyResponses`). Esses
//   valores são recriados a cada render pelo React Query e pelo
//   componente pai, disparando o efeito a cada mudança de estado
//   do próprio componente. Resultado: `auditQuestions` era
//   resetado para o valor do servidor (sem a resposta nova)
//   logo após o `handleAuditAnswerChange` gravar a resposta.
//
// SOLUÇÃO:
//   Trocar as dependências por valores ESTÁVEIS:
//   - `checklist._id`         (string, muda só quando troca de checklist)
//   - `companyResponsesKey`   (string serializada do array)
//
// COMPATIBILIDADE:
//   - Comportamento idêntico em todos os outros cenários.
//   - Trocar de checklist continua disparando o efeito corretamente.
//   - Atualizar `companyResponses` continua disparando o efeito.
//
// ============================================================

interface AuditUpdateFullPayload {
  questions: AuditChecklistItem[];
  auditQuestions: AuditChecklistAuditQuestion[];
  finalConclusion: AuditChecklistAnswer;
  finalObservation: string;
  finalEvidenceIds: string[];
  finalJustification: string;
}

// ============================================================
// 🆕 v51.1 — CONTEXTO DO UPLOAD DE EVIDÊNCIA
// ============================================================
//
// Distingue os dois casos de upload:
//   1. Pergunta de auditoria → questionIndex é number
//   2. Constatação final     → questionIndex é undefined
//
// O pai (RepAuditChecklist / RepAuditExecution) decide o que fazer
// com esse contexto (tipicamente: passar para o backend para gravar
// o campo `questionRef` da evidência).
//
// ============================================================

export interface UploadEvidenceContext {
  controlId: string;
  /**
   * Índice da pergunta de auditoria dentro de `auditQuestions[]`.
   * Ausente quando o upload é da constatação final do controle.
   */
  questionIndex?: number;
  /**
   * Descrição opcional que o auditor pode querer associar à evidência.
   */
  description?: string;
}

interface AuditChecklistProps {
  checklist: AuditChecklistType;

  /**
   * Callback legado — recebe apenas as perguntas do Assessment.
   * MANTIDO para não quebrar chamadores antigos.
   */
  onUpdate: (questions: AuditChecklistItem[]) => Promise<void>;

  /**
   * 🆕 v50.1 — Callback completo.
   *
   * Quando fornecido, é chamado em vez de `onUpdate` e recebe
   * o payload inteiro (perguntas do Assessment + perguntas de
   * auditoria + constatação final).
   *
   * Se não for fornecido, o componente chama `onUpdate` (modo
   * legado), preservando o comportamento anterior.
   */
  onUpdateFull?: (payload: AuditUpdateFullPayload) => Promise<void>;

  onComplete: () => Promise<void>;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  companyResponses?: Array<{
    controlId: string;
    maturityLevel: string;
    scenarioDescription?: string;
    observations?: string;
  }>;
  controlsMap?: Map<string, { code: string; name: string }>;

  // ============================================================
  // 🆕 v51.1 — UPLOAD DE EVIDÊNCIA POR PERGUNTA
  // ============================================================
  //
  // Quando `onUploadEvidence` é fornecida, o botão "Anexar Evidência"
  // aparece em cada pergunta de auditoria (Bloco 2) e na constatação
  // final (Bloco 3). Cada upload:
  //
  //   1. Chama `onUploadEvidence(file, context)`.
  //   2. O pai faz o POST /api/internal-audit/evidence/upload.
  //   3. O pai retorna o `evidenceId` (string).
  //   4. O componente faz push em `evidenceIds[]` da pergunta.
  //   5. Marca `isDirty = true` para persistir via Save.
  //
  // Se `onUploadEvidence` NÃO for fornecida, os botões NÃO aparecem.
  // Isso preserva o modo somente-leitura de evidências.
  //
  onUploadEvidence?: (
    file: File,
    context: UploadEvidenceContext
  ) => Promise<string>;

  /**
   * 🆕 v51.1 — Mapa de evidências para exibição.
   *
   * Chave: evidenceId (string).
   * Valor: { filename, size } — usado para renderizar o nome
   *        amigável do arquivo.
   *
   * O componente NÃO busca evidências sozinho; o pai fornece o mapa.
   * Quando ausente, o componente exibe o ID truncado.
   */
  evidenceMap?: Map<string, { filename: string; size: number }>;
}

const ANSWER_OPTIONS = [
  { value: 'C', label: 'Conforme', icon: CheckCircle, color: 'text-green-600' },
  { value: 'NC', label: 'Não Conforme', icon: XCircle, color: 'text-red-600' },
  { value: 'OB', label: 'Observação', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'OM', label: 'Oportunidade', icon: AlertCircle, color: 'text-blue-600' },
  { value: 'NA', label: 'Não Aplicável', icon: MinusCircle, color: 'text-gray-400' },
];

// ============================================================
// 🆕 v51.1 — REGRA DE NEGÓCIO: NC SEM EVIDÊNCIA
// ============================================================
//
// ISO 19011 §6.4.7: toda constatação precisa de evidência objetiva.
// Mitigação pragmática: se marcar NC e NÃO anexar evidência,
// exige justificativa textual (≥ 20 caracteres) em "Observações".
//
// A regra é aplicada em dois momentos:
//   - handleSave:     aviso amarelo (não bloqueia)
//   - handleComplete: bloqueio duro (não deixa concluir)
//
// ============================================================

const MIN_JUSTIFICATION_LENGTH = 20;

function isNonConformityWithoutEvidence(
  answer: string | undefined,
  evidenceIds: string[] | undefined,
  observations: string | undefined
): boolean {
  if (answer !== 'NC') return false;
  const hasEvidence = Array.isArray(evidenceIds) && evidenceIds.length > 0;
  if (hasEvidence) return false;
  const obs = String(observations || '').trim();
  return obs.length < MIN_JUSTIFICATION_LENGTH;
}

export function AuditChecklist({
  checklist,
  onUpdate,
  onUpdateFull,
  onComplete,
  isSubmitting = false,
  isReadOnly = false,
  companyResponses = [],
  controlsMap,
  // 🆕 v51.1
  onUploadEvidence,
  evidenceMap,
}: AuditChecklistProps) {
  // ---- Estado: perguntas do Assessment (INTACTO) ----

  const [questions, setQuestions] = useState<AuditChecklistItem[]>([]);

  // ---- 🆕 v50.1 — Estado: perguntas de auditoria ----

  const [auditQuestions, setAuditQuestions] = useState<
    AuditChecklistAuditQuestion[]
  >([]);

  // ---- 🆕 v50.1 — Estado: constatação final do controle ----

  const [finalConclusion, setFinalConclusion] =
    useState<AuditChecklistAnswer>('--');
  const [finalObservation, setFinalObservation] = useState('');
  const [finalJustification, setFinalJustification] = useState('');
  const [finalEvidenceIds, setFinalEvidenceIds] = useState<string[]>([]);

  // ---- 🆕 v50.1 — Controle de blocos colapsáveis ----

  const [showAssessmentContext, setShowAssessmentContext] = useState(false);
  const [showFinalBlock, setShowFinalBlock] = useState(false);

  // ---- Estados gerais (INTACTO) ----

  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // 🆕 v51.1 — ESTADOS DE UPLOAD DE EVIDÊNCIA
  // ============================================================
  //
  // Por que Set/Map?
  //   - Set<number> para `uploadingByQuestion`: permite múltiplos
  //     uploads simultâneos (auditor pode anexar em várias perguntas
  //     em paralelo) sem travar a UI global.
  //   - Map<number, string> para erros: feedback POR pergunta,
  //     não global — auditor sabe exatamente qual falhou.
  //   - fileInputRefs: um <input type="file"> oculto POR pergunta
  //     para que cada botão "Anexar" abra o seletor correto.
  //
  // ============================================================

  const [uploadingByQuestion, setUploadingByQuestion] = useState<
    Set<number>
  >(new Set());
  const [uploadingFinal, setUploadingFinal] = useState(false);
  const [uploadErrorByQuestion, setUploadErrorByQuestion] = useState<
    Map<number, string>
  >(new Map());
  const [uploadErrorFinal, setUploadErrorFinal] = useState<string | null>(
    null
  );

  // Refs dos inputs de arquivo (um por pergunta + um para a constatação final)
  const fileInputRefs = useRef<Map<number, HTMLInputElement | null>>(
    new Map()
  );
  const finalFileInputRef = useRef<HTMLInputElement | null>(null);

  // ============================================================
  // 🆕 v49.1.2 — HELPER DE EXIBIÇÃO DE CONTROLE
  // ============================================================

  const getControlLabel = (controlId: string): string => {
    if (!controlsMap) return controlId;

    const entry = controlsMap.get(String(controlId));
    if (!entry) return controlId;

    const { code, name } = entry;
    if (code && name) return `${code} - ${name}`;
    return code || name || controlId;
  };

  // ============================================================
  // 🆕 v51.1 — HELPER DE EXIBIÇÃO DE EVIDÊNCIA
  // ============================================================
  //
  // Se o pai forneceu `evidenceMap`, exibe o nome do arquivo.
  // Caso contrário, exibe o ID truncado (fallback seguro).
  //
  // ============================================================

  const getEvidenceLabel = (evidenceId: string): string => {
    if (evidenceMap) {
      const entry = evidenceMap.get(evidenceId);
      if (entry?.filename) return entry.filename;
    }
    // Fallback: ID truncado para 8 caracteres + reticências
    const id = String(evidenceId || '');
    if (id.length <= 8) return id;
    return `${id.slice(0, 8)}…`;
  };

  const formatFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    const rounded = size >= 10 ? Math.round(size) : Math.round(size * 10) / 10;
    return `${rounded} ${units[unitIndex]}`;
  };

  // ============================================================
  // 🔍 DETECÇÃO DO MODO
  // ============================================================

  const hasAuditQuestions =
    Array.isArray(checklist.auditQuestions) &&
    checklist.auditQuestions.length > 0;

  // ============================================================
  // 🆕 v51.2 — CHAVE ESTÁVEL PARA O `companyResponses`
  // ============================================================
  //
  // MOTIVO:
  //   O `useEffect` de inicialização precisa reagir a mudanças em
  //   `companyResponses`, mas o array é recriado a cada render do
  //   pai (mesmo conteúdo, referência nova). Usar o array direto
  //   como dependência dispara o efeito sem necessidade, resetando
  //   o estado local e fazendo o select "voltar para --".
  //
  // SOLUÇÃO:
  //   Serializar o array em uma string estável. A string só muda
  //   quando o CONTEÚDO muda (não a referência).
  //
  // CUSTO:
  //   JSON.stringify de um array pequeno (< 100 itens) é desprezível.
  //   Não é chamado a cada render — apenas quando `companyResponses`
  //   muda de referência.
  //
  // ============================================================

  const companyResponsesKey = (() => {
    if (!Array.isArray(companyResponses) || companyResponses.length === 0) {
      return '';
    }
    try {
      return JSON.stringify(
        companyResponses.map((r) => ({
          controlId: String(r.controlId ?? ''),
          maturityLevel: String(r.maturityLevel ?? ''),
          scenarioDescription: String(r.scenarioDescription ?? ''),
          observations: String(r.observations ?? ''),
        }))
      );
    } catch {
      // Fallback: se a serialização falhar por qualquer motivo,
      // retorna uma chave que força o efeito (comportamento antigo).
      return `fallback-${companyResponses.length}`;
    }
  })();

  // ============================================================
  // INICIALIZAÇÃO (INTACTO + EXTRA)
  // ============================================================
  //
  // 🔧 v51.2 — DEPENDÊNCIAS CORRIGIDAS
  // ----------------------------------------
  // ANTES: [checklist, companyResponses]
  //   - `checklist` é um OBJETO recriado pelo React Query.
  //   - `companyResponses` é um ARRAY recriado pelo pai.
  //   - Ambos disparavam o efeito a cada render, resetando
  //     `auditQuestions` para o valor do servidor e apagando
  //     a seleção do usuário.
  //
  // DEPOIS: [checklist._id, companyResponsesKey]
  //   - `checklist._id` é uma STRING estável.
  //   - `companyResponsesKey` é uma STRING derivada do conteúdo.
  //   - O efeito só dispara quando o CONTEÚDO muda de verdade.
  //
  // ============================================================

  useEffect(() => {
    let initialQuestions = checklist.questions || [];

    // Preenchimento automático do Assessment (INTACTO)

    if (
      companyResponses &&
      companyResponses.length > 0 &&
      initialQuestions.length > 0
    ) {
      const response = companyResponses.find(
        (r) => String(r.controlId) === String(checklist.controlId)
      );

      if (response && response.maturityLevel !== undefined) {
        const level = String(response.maturityLevel);
        let autoAnswer: 'NC' | 'OB' | 'C' = 'C';

        if (level === '0') {
          autoAnswer = 'NC';
        } else if (level === '1') {
          autoAnswer = 'OB';
        } else {
          autoAnswer = 'C';
        }

        initialQuestions = initialQuestions.map((q) => {
          if (!q.answer || q.answer === '--') {
            return {
              ...q,
              answer: autoAnswer,
              observations:
                q.observations ||
                response.scenarioDescription ||
                response.observations ||
                '',
            };
          }
          return q;
        });
      }
    }

    setQuestions(initialQuestions);

    // 🆕 v50.1 — Inicializar perguntas de auditoria

    setAuditQuestions(checklist.auditQuestions || []);

    // 🆕 v50.1 — Inicializar constatação final

    setFinalConclusion(
      (checklist.finalConclusion as AuditChecklistAnswer) || '--'
    );
    setFinalObservation(checklist.finalObservation || '');
    setFinalJustification(checklist.finalJustification || '');
    setFinalEvidenceIds(checklist.finalEvidenceIds || []);

    setIsDirty(false);

    // 🆕 v51.1 — Limpa estados de upload ao trocar de checklist
    // (evita que um erro de upload do controle anterior vaze)
    setUploadingByQuestion(new Set());
    setUploadingFinal(false);
    setUploadErrorByQuestion(new Map());
    setUploadErrorFinal(null);

    // 🔧 v51.2 — Dependências estáveis (comentário abaixo para
    // documentar a decisão e evitar regressão futura):
    //
    //   eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist._id, companyResponsesKey]);

  // ============================================================
  // HANDLERS DAS PERGUNTAS DO ASSESSMENT (INTACTO)
  // ============================================================

  const handleAnswerChange = (
    index: number,
    field: keyof AuditChecklistItem,
    value: any
  ) => {
    if (isReadOnly) return;
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
    setIsDirty(true);
    setError(null);
  };

  // ============================================================
  // 🆕 v50.1 — HANDLERS DAS PERGUNTAS DE AUDITORIA
  // ============================================================

  const handleAuditAnswerChange = (
    index: number,
    field: keyof AuditChecklistAuditQuestion,
    value: any
  ) => {
    if (isReadOnly) return;
    const next = [...auditQuestions];
    next[index] = { ...next[index], [field]: value };
    setAuditQuestions(next);
    setIsDirty(true);
    setError(null);
  };

  // ============================================================
  // 🆕 v51.1 — HANDLER: UPLOAD DE EVIDÊNCIA (PERGUNTA DE AUDITORIA)
  // ============================================================
  //
  // Fluxo (Opção A — upload imediato, confirmado pelo stakeholder):
  //
  //   1. Abre o <input type="file"> da pergunta.
  //   2. Ao escolher, marca `uploadingByQuestion[index] = true`.
  //   3. Chama `onUploadEvidence(file, { controlId, questionIndex })`.
  //   4. O pai faz POST /api/internal-audit/evidence/upload.
  //   5. O pai retorna `evidenceId` (string).
  //   6. Faz push em `auditQuestions[index].evidenceIds[]`.
  //   7. Marca `isDirty = true` → o Save persiste o array atualizado.
  //   8. Limpa o <input> para permitir re-upload do mesmo arquivo.
  //
  // Em caso de erro: guarda mensagem em `uploadErrorByQuestion`.
  //
  // ============================================================

  const handleUploadEvidence = async (
    index: number,
    file: File
  ): Promise<void> => {
    if (isReadOnly || !onUploadEvidence) return;

    // Marca como "uploading" para mostrar spinner
    setUploadingByQuestion((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    // Limpa erro anterior desta pergunta
    setUploadErrorByQuestion((prev) => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });

    try {
      const evidenceId = await onUploadEvidence(file, {
        controlId: String(checklist.controlId),
        questionIndex: index,
      });

      // Atualiza o array de evidenceIds da pergunta
      setAuditQuestions((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        const currentIds = Array.isArray(current.evidenceIds)
          ? current.evidenceIds
          : [];
        next[index] = {
          ...current,
          evidenceIds: [...currentIds, evidenceId],
        };
        return next;
      });

      setIsDirty(true);
    } catch (err) {
      const message =
        (err as Error)?.message || 'Falha ao anexar evidência.';
      setUploadErrorByQuestion((prev) => {
        const next = new Map(prev);
        next.set(index, message);
        return next;
      });
    } finally {
      // Limpa o input para permitir o mesmo arquivo novamente
      const inputEl = fileInputRefs.current.get(index);
      if (inputEl) inputEl.value = '';

      setUploadingByQuestion((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  // ============================================================
  // 🆕 v51.1 — HANDLER: UPLOAD DE EVIDÊNCIA (CONSTATAÇÃO FINAL)
  // ============================================================
  //
  // Mesmo fluxo do handler acima, mas para a constatação final.
  // `questionIndex` fica indefinido no contexto.
  //
  // ============================================================

  const handleUploadFinalEvidence = async (file: File): Promise<void> => {
    if (isReadOnly || !onUploadEvidence) return;

    setUploadingFinal(true);
    setUploadErrorFinal(null);

    try {
      const evidenceId = await onUploadEvidence(file, {
        controlId: String(checklist.controlId),
        // questionIndex ausente = constatação final
      });

      setFinalEvidenceIds((prev) => [...prev, evidenceId]);
      setIsDirty(true);
    } catch (err) {
      const message =
        (err as Error)?.message || 'Falha ao anexar evidência.';
      setUploadErrorFinal(message);
    } finally {
      if (finalFileInputRef.current) finalFileInputRef.current.value = '';
      setUploadingFinal(false);
    }
  };

  // ============================================================
  // 🆕 v51.1 — HANDLER: REMOVER EVIDÊNCIA
  // ============================================================
  //
  // Apenas remove o ID do array local. A exclusão física do arquivo
  // no servidor é responsabilidade do pai (endpoint separado) ou
  // de um job de limpeza. Aqui só desvinculamos.
  //
  // ============================================================

  const handleRemoveEvidence = (
    index: number,
    evidenceId: string
  ): void => {
    if (isReadOnly) return;

    setAuditQuestions((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      const currentIds = Array.isArray(current.evidenceIds)
        ? current.evidenceIds
        : [];
      next[index] = {
        ...current,
        evidenceIds: currentIds.filter((id) => id !== evidenceId),
      };
      return next;
    });
    setIsDirty(true);
  };

  const handleRemoveFinalEvidence = (evidenceId: string): void => {
    if (isReadOnly) return;
    setFinalEvidenceIds((prev) => prev.filter((id) => id !== evidenceId));
    setIsDirty(true);
  };

  // ---- Auto-fill de maturidade (INTACTO) ----

  const handleAutoFill = () => {
    if (isReadOnly || !companyResponses || companyResponses.length === 0)
      return;

    const response = companyResponses.find(
      (r) => String(r.controlId) === String(checklist.controlId)
    );

    if (!response || response.maturityLevel === undefined) return;

    const level = String(response.maturityLevel);
    let autoAnswer: 'NC' | 'OB' | 'C' = 'C';

    if (level === '0') {
      autoAnswer = 'NC';
    } else if (level === '1') {
      autoAnswer = 'OB';
    } else {
      autoAnswer = 'C';
    }

    const updated = questions.map((q) => ({
      ...q,
      answer: autoAnswer,
      observations:
        q.observations ||
        response.scenarioDescription ||
        response.observations ||
        '',
    }));

    setQuestions(updated);
    setIsDirty(true);
  };

  // ============================================================
  // SALVAR — Decide entre onUpdate e onUpdateFull
  // ============================================================
  //
  // REGRAS:
  //   1. Se `onUpdateFull` foi fornecida → usa ela com payload completo.
  //   2. Senão → usa `onUpdate` (comportamento antigo, só questions[]).
  //
  // Isso preserva o comportamento de qualquer chamador que ainda
  // não passou a nova prop.
  //
  // 🆕 v51.1 — Aviso NC sem evidência:
  //   Antes de salvar, verifica se há alguma pergunta de auditoria
  //   marcada como NC sem evidência E sem justificativa adequada.
  //   Se sim, define `error` com um aviso AMARELO (não bloqueia o
  //   save — o auditor pode estar no meio do preenchimento).
  //   O bloqueio duro fica no `handleComplete`.
  //
  // ============================================================

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setError(null);

    try {
      // 🆕 v51.1 — Aviso (não bloqueia) de NC sem evidência
      const ncWithoutEvidence = auditQuestions.filter((q) =>
        isNonConformityWithoutEvidence(
          q.answer,
          q.evidenceIds,
          q.observations
        )
      );

      if (ncWithoutEvidence.length > 0) {
        // Não lança — apenas avisa. O auditor pode salvar parcial.
        // O aviso visual no footer (badge amarela) já mostra o resumo.
        console.warn(
          `[AuditChecklist] ${ncWithoutEvidence.length} pergunta(s) NC sem evidência e sem justificativa adequada.`
        );
      }

      if (onUpdateFull) {
        await onUpdateFull({
          questions,
          auditQuestions,
          finalConclusion,
          finalObservation,
          finalEvidenceIds,
          finalJustification,
        });
      } else {
        await onUpdate(questions);
      }
      setIsDirty(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CONCLUIR CHECKLIST
  // ============================================================
  //
  // 🆕 v51.1 — Bloqueio duro:
  //   Se qualquer pergunta de auditoria estiver NC sem evidência E
  //   sem justificativa (≥ 20 chars), NÃO permite concluir.
  //   Exibe mensagem clara listando o número(s) da(s) pergunta(s).
  //
  // ============================================================

  const handleComplete = async () => {
    // 🆕 v51.1 — Validação NC-sem-evidência (bloqueio duro)
    const ncWithoutEvidenceIndexes: number[] = [];
    auditQuestions.forEach((q, idx) => {
      if (
        isNonConformityWithoutEvidence(
          q.answer,
          q.evidenceIds,
          q.observations
        )
      ) {
        ncWithoutEvidenceIndexes.push(idx + 1);
      }
    });

    if (ncWithoutEvidenceIndexes.length > 0) {
      setError(
        `Não é possível concluir: pergunta(s) ${ncWithoutEvidenceIndexes.join(
          ', '
        )} marcada(s) como NC sem evidência anexada e sem justificativa (mínimo ${MIN_JUSTIFICATION_LENGTH} caracteres em "Observações").`
      );
      return;
    }

    if (isDirty) {
      await handleSave();
    }
    setError(null);
    try {
      await onComplete();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ============================================================
  // HELPERS VISUAIS
  // ============================================================

  const getAnswerBadge = (answer: string) => {
    const option = ANSWER_OPTIONS.find((o) => o.value === answer);
    if (!option) return null;
    const Icon = option.icon;
    return (
      <span
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${option.color} bg-gray-50`}
      >
        <Icon className="w-3 h-3" />
        {option.label}
      </span>
    );
  };

  // ---- Contadores: Assessment (INTACTO) ----

  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(
    (q) => q.answer && q.answer !== '--'
  ).length;
  const conforming = questions.filter((q) => q.answer === 'C').length;
  const nonConforming = questions.filter((q) => q.answer === 'NC').length;
  const observations = questions.filter((q) => q.answer === 'OB').length;
  const opportunities = questions.filter((q) => q.answer === 'OM').length;
  const notApplicable = questions.filter((q) => q.answer === 'NA').length;

  // ---- Contadores: Auditoria (NOVO) ----

  const totalAuditQuestions = auditQuestions.length;
  const answeredAuditQuestions = auditQuestions.filter(
    (q) => q.answer && q.answer !== '--'
  ).length;
  const auditConforming = auditQuestions.filter(
    (q) => q.answer === 'C'
  ).length;
  const auditNonConforming = auditQuestions.filter(
    (q) => q.answer === 'NC'
  ).length;
  const auditObservations = auditQuestions.filter(
    (q) => q.answer === 'OB'
  ).length;
  const auditOpportunities = auditQuestions.filter(
    (q) => q.answer === 'OM'
  ).length;
  const auditNotApplicable = auditQuestions.filter(
    (q) => q.answer === 'NA'
  ).length;

  // ============================================================
  // 🆕 v51.1 — CONTADOR: NC SEM EVIDÊNCIA (para aviso no footer)
  // ============================================================

  const ncWithoutEvidenceCount = auditQuestions.filter((q) =>
    isNonConformityWithoutEvidence(q.answer, q.evidenceIds, q.observations)
  ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ============================================================
          HEADER (INTACTO + linha adicional de contadores de auditoria)
          ============================================================ */}

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Checklist - Controle {getControlLabel(String(checklist.controlId))}
            </h3>
            <p className="text-sm text-gray-500">
              {totalQuestions} pergunta{totalQuestions !== 1 ? 's' : ''} do
              Assessment • {answeredQuestions} respondida
              {answeredQuestions !== 1 ? 's' : ''}
              {hasAuditQuestions && (
                <>
                  {' '}
                  • {totalAuditQuestions} pergunta
                  {totalAuditQuestions !== 1 ? 's' : ''} de auditoria •{' '}
                  {answeredAuditQuestions} respondida
                  {answeredAuditQuestions !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isReadOnly && companyResponses.length > 0 && (
              <button
                type="button"
                onClick={handleAutoFill}
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-medium transition-colors mr-2"
                title="Preencher respostas automaticamente com base na maturidade do assessment"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Sincronizar Maturidade
              </button>
            )}

            {/* Contadores do Assessment (INTACTO) */}

            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">
                {conforming}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">
                {nonConforming}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-600">
                {observations}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">
                {opportunities}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
              <MinusCircle className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-400">
                {notApplicable}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-lg">
              <span className="text-xs font-medium text-indigo-600">
                {totalQuestions > 0
                  ? Math.round((answeredQuestions / totalQuestions) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          BLOCO 1 — CONTEXTO DO ASSESSMENT (só no MODO 2)
          ============================================================ */}

      {hasAuditQuestions && (
        <div className="border-b border-gray-200 bg-indigo-50">
          <button
            type="button"
            onClick={() => setShowAssessmentContext(!showAssessmentContext)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-indigo-100 transition-colors"
          >
            {showAssessmentContext ? (
              <ChevronDown className="w-5 h-5 text-indigo-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-indigo-600" />
            )}
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-900 text-sm">
              Contexto do Assessment
            </span>
            <span className="text-xs text-indigo-600">
              ({totalQuestions} resposta
              {totalQuestions !== 1 ? 's' : ''} do usuário)
            </span>
            <span className="ml-auto text-xs text-indigo-500">
              Somente leitura
            </span>
          </button>

          {showAssessmentContext && (
            <div className="px-4 pb-4 space-y-2">
              {questions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Nenhuma resposta do Assessment registrada para este controle.
                </p>
              ) : (
                questions.map((q, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-indigo-100 p-3"
                  >
                    <p className="text-sm text-gray-900 mb-1">
                      <span className="font-medium text-gray-500">
                        {index + 1}.{' '}
                      </span>
                      {q.question}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>
                        Resposta:{' '}
                        <span className="font-medium">
                          {q.answer === '--' || !q.answer
                            ? 'Não respondida'
                            : q.answer}
                        </span>
                      </span>
                      {q.observations && (
                        <span className="text-gray-500">
                          • {q.observations}
                        </span>
                      )}
                      {q.evidenceIds && q.evidenceIds.length > 0 && (
                        <span className="text-blue-600">
                          • {q.evidenceIds.length} evidência
                          {q.evidenceIds.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          BLOCO 2 — PERGUNTAS DE AUDITORIA (só no MODO 2)
          ============================================================ */}

      {hasAuditQuestions && (
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 bg-gray-100 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm">
              Perguntas de Auditoria
            </span>
            <span className="text-xs text-gray-500">
              ({totalAuditQuestions} pergunta
              {totalAuditQuestions !== 1 ? 's' : ''})
            </span>
            <span className="ml-auto text-xs text-gray-500">
              C: {auditConforming} • NC: {auditNonConforming} • OB:{' '}
              {auditObservations} • OM: {auditOpportunities} • NA:{' '}
              {auditNotApplicable}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {auditQuestions.map((question, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  question.answer === 'NC'
                    ? 'border-red-200 bg-red-50'
                    : question.answer === 'C'
                    ? 'border-green-200 bg-green-50'
                    : question.answer === 'NA'
                    ? 'border-gray-200 bg-gray-50'
                    : question.answer === 'OB'
                    ? 'border-yellow-200 bg-yellow-50'
                    : question.answer === 'OM'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {index + 1}. {question.text}
                    </p>

                    {question.objective && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Objetivo:</span>{' '}
                        {question.objective}
                      </p>
                    )}

                    {question.guidance && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Orientação:</span>{' '}
                        {question.guidance}
                      </p>
                    )}

                    {question.evidenceExpected && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Evidência esperada:</span>{' '}
                        {question.evidenceExpected}
                      </p>
                    )}

                    {question.observations && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-sm text-gray-600">
                        <span className="font-medium">Observação:</span>{' '}
                        {question.observations}
                      </div>
                    )}

                    {/* ============================================================
                        🆕 v51.1 — LISTA DE EVIDÊNCIAS ANEXADAS
                        ============================================================
                        Renderiza um chip por evidenceId vinculado à pergunta.
                        Cada chip exibe o nome do arquivo (via evidenceMap) e
                        um botão de remover (só se não for readOnly).
                        ============================================================ */}

                    {question.evidenceIds &&
                      question.evidenceIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {question.evidenceIds.map((evidenceId) => {
                            const entry = evidenceMap?.get(evidenceId);
                            return (
                              <div
                                key={evidenceId}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span
                                  className="max-w-[180px] truncate"
                                  title={entry?.filename || evidenceId}
                                >
                                  {getEvidenceLabel(evidenceId)}
                                </span>
                                {entry?.size ? (
                                  <span className="text-blue-500">
                                    ({formatFileSize(entry.size)})
                                  </span>
                                ) : null}
                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveEvidence(index, evidenceId)
                                    }
                                    className="ml-1 text-blue-500 hover:text-red-600 transition-colors"
                                    title="Remover evidência"
                                    aria-label={`Remover evidência ${getEvidenceLabel(
                                      evidenceId
                                    )}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* ============================================================
                        🆕 v51.1 — BOTÃO "ANEXAR EVIDÊNCIA" + SPINNER + ERRO
                        ============================================================
                        Só aparece se:
                          - não for readOnly
                          - `onUploadEvidence` foi fornecida pelo pai
                        ============================================================ */}

                    {!isReadOnly && onUploadEvidence && (
                      <div className="mt-2 flex items-center gap-2">
                        {/* Input oculto — o botão abaixo o aciona via ref */}
                        <input
                          ref={(el) => {
                            if (el) fileInputRefs.current.set(index, el);
                            else fileInputRefs.current.delete(index);
                          }}
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void handleUploadEvidence(index, file);
                            }
                          }}
                          aria-label={`Anexar evidência à pergunta ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current.get(index)?.click()
                          }
                          disabled={uploadingByQuestion.has(index)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Anexar evidência a esta pergunta"
                        >
                          {uploadingByQuestion.has(index) ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Paperclip className="w-3.5 h-3.5" />
                              Anexar Evidência
                            </>
                          )}
                        </button>
                        {uploadErrorByQuestion.get(index) && (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {uploadErrorByQuestion.get(index)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {!isReadOnly ? (
                      <select
                        value={question.answer || '--'}
                        onChange={(e) =>
                          handleAuditAnswerChange(
                            index,
                            'answer',
                            e.target.value as any
                          )
                        }
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="--">Selecione...</option>
                        {ANSWER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex justify-end">
                        {getAnswerBadge(question.answer || '--') || (
                          <span className="text-xs text-gray-400">
                            Não respondido
                          </span>
                        )}
                      </div>
                    )}

                    {!isReadOnly && (
                      <textarea
                        value={question.observations || ''}
                        onChange={(e) =>
                          handleAuditAnswerChange(
                            index,
                            'observations',
                            e.target.value
                          )
                        }
                        placeholder="Observações..."
                        rows={2}
                        className="w-full px-3 py-1 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    )}

                    {/* 🆕 v51.1 — Aviso visual quando NC sem evidência */}
                    {!isReadOnly &&
                      question.answer === 'NC' &&
                      (!question.evidenceIds ||
                        question.evidenceIds.length === 0) &&
                      String(question.observations || '').trim().length <
                        MIN_JUSTIFICATION_LENGTH && (
                        <div className="flex items-start gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>
                            NC sem evidência: justifique em Observações (mín.{' '}
                            {MIN_JUSTIFICATION_LENGTH} caracteres).
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          BLOCO 3 — CONSTATAÇÃO FINAL DO CONTROLE (só no MODO 2)
          ============================================================ */}

      {hasAuditQuestions && (
        <div className="border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => setShowFinalBlock(!showFinalBlock)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition-colors"
          >
            {showFinalBlock ? (
              <ChevronDown className="w-5 h-5 text-gray-700" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-700" />
            )}
            <Target className="w-4 h-4 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm">
              Constatação Final do Controle
            </span>
            {finalConclusion !== '--' && (
              <span className="ml-2">{getAnswerBadge(finalConclusion)}</span>
            )}
          </button>

          {showFinalBlock && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Constatação
                  </label>
                  {!isReadOnly ? (
                    <select
                      value={finalConclusion}
                      onChange={(e) => {
                        setFinalConclusion(
                          e.target.value as AuditChecklistAnswer
                        );
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="--">Selecione...</option>
                      {ANSWER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>{getAnswerBadge(finalConclusion)}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Observação geral do controle
                </label>
                <textarea
                  value={finalObservation}
                  onChange={(e) => {
                    setFinalObservation(e.target.value);
                    setIsDirty(true);
                  }}
                  disabled={isReadOnly}
                  rows={3}
                  placeholder="Observação consolidada do controle..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Justificativa (se não houver evidência anexada)
                </label>
                <textarea
                  value={finalJustification}
                  onChange={(e) => {
                    setFinalJustification(e.target.value);
                    setIsDirty(true);
                  }}
                  disabled={isReadOnly}
                  rows={2}
                  placeholder="Justificativa caso não haja evidência anexada..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* ============================================================
                  🆕 v51.1 — EVIDÊNCIAS DA CONSTATAÇÃO FINAL
                  ============================================================ */}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Evidências anexadas
                </label>

                {finalEvidenceIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {finalEvidenceIds.map((evidenceId) => {
                      const entry = evidenceMap?.get(evidenceId);
                      return (
                        <div
                          key={evidenceId}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span
                            className="max-w-[180px] truncate"
                            title={entry?.filename || evidenceId}
                          >
                            {getEvidenceLabel(evidenceId)}
                          </span>
                          {entry?.size ? (
                            <span className="text-blue-500">
                              ({formatFileSize(entry.size)})
                            </span>
                          ) : null}
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFinalEvidence(evidenceId)
                              }
                              className="ml-1 text-blue-500 hover:text-red-600 transition-colors"
                              title="Remover evidência"
                              aria-label={`Remover evidência ${getEvidenceLabel(
                                evidenceId
                              )}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-2">
                    Nenhuma evidência anexada.
                  </p>
                )}

                {!isReadOnly && onUploadEvidence && (
                  <div className="flex items-center gap-2">
                    <input
                      ref={finalFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleUploadFinalEvidence(file);
                        }
                      }}
                      aria-label="Anexar evidência à constatação final"
                    />
                    <button
                      type="button"
                      onClick={() => finalFileInputRef.current?.click()}
                      disabled={uploadingFinal}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Anexar evidência à constatação final"
                    >
                      {uploadingFinal ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Paperclip className="w-3.5 h-3.5" />
                          Anexar Evidência
                        </>
                      )}
                    </button>
                    {uploadErrorFinal && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {uploadErrorFinal}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          BLOCO 4 — PERGUNTAS DO ASSESSMENT (FORMULÁRIO)
          ============================================================ */}
      {/* No MODO 1, esta é a única seção (comportamento antigo).       */}
      {/* No MODO 2, permanece aqui, logo abaixo da constatação final.  */}

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma pergunta cadastrada para este controle.</p>
            <p className="text-xs mt-1">
              Cadastre perguntas na biblioteca de perguntas para que novos
              planos possam utilizá-las.
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${
                question.answer === 'NC'
                  ? 'border-red-200 bg-red-50'
                  : question.answer === 'C'
                  ? 'border-green-200 bg-green-50'
                  : question.answer === 'NA'
                  ? 'border-gray-200 bg-gray-50'
                  : question.answer === 'OB'
                  ? 'border-yellow-200 bg-yellow-50'
                  : question.answer === 'OM'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {index + 1}. {question.question}
                  </p>
                  {question.observations && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-sm text-gray-600">
                      <span className="font-medium">Observação:</span>{' '}
                      {question.observations}
                    </div>
                  )}
                  {question.evidenceIds && question.evidenceIds.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <Upload className="w-3 h-3" />
                      <span>
                        {question.evidenceIds.length} evidência
                        {question.evidenceIds.length !== 1 ? 's' : ''} anexada
                        {question.evidenceIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  {!isReadOnly ? (
                    <select
                      value={question.answer || '--'}
                      onChange={(e) =>
                        handleAnswerChange(
                          index,
                          'answer',
                          e.target.value as any
                        )
                      }
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="--">Selecione...</option>
                      {ANSWER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex justify-end">
                      {getAnswerBadge(question.answer || '--') || (
                        <span className="text-xs text-gray-400">
                          Não respondido
                        </span>
                      )}
                    </div>
                  )}
                  {!isReadOnly && (
                    <textarea
                      value={question.observations || ''}
                      onChange={(e) =>
                        handleAnswerChange(
                          index,
                          'observations',
                          e.target.value
                        )
                      }
                      placeholder="Observações..."
                      rows={2}
                      className="w-full px-3 py-1 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============================================================
          FOOTER (INTACTO + aviso NC sem evidência)
          ============================================================ */}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* ============================================================
              🆕 v51.1 — AVISO AMARELO: NC SEM EVIDÊNCIA (não bloqueia save)
              ============================================================ */}

          {!error && ncWithoutEvidenceCount > 0 && !isReadOnly && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {ncWithoutEvidenceCount} pergunta
                {ncWithoutEvidenceCount !== 1 ? 's' : ''} NC sem evidência
                anexada. Anexe uma evidência ou descreva a justificativa (mín.{' '}
                {MIN_JUSTIFICATION_LENGTH} caracteres) para poder concluir.
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 ml-auto">
            {isDirty && !isReadOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
            {!isReadOnly &&
              checklist.status !== 'completed' &&
              (hasAuditQuestions
                ? totalAuditQuestions > 0
                : totalQuestions > 0) && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={
                    isSubmitting ||
                    saving ||
                    (hasAuditQuestions
                      ? answeredAuditQuestions < totalAuditQuestions
                      : answeredQuestions < totalQuestions)
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  title={
                    (hasAuditQuestions
                      ? answeredAuditQuestions < totalAuditQuestions
                      : answeredQuestions < totalQuestions)
                      ? 'Responda todas as perguntas antes de concluir'
                      : ncWithoutEvidenceCount > 0
                      ? 'Resolva as NC sem evidência antes de concluir'
                      : ''
                  }
                >
                  {isSubmitting ? 'Concluindo...' : 'Concluir Checklist'}
                </button>
              )}
            {checklist.status === 'completed' && (
              <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4" />
                Concluído
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
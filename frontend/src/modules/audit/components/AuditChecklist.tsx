import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  AuditChecklist as AuditChecklistType,
  AuditChecklistItem,
  AuditChecklistAuditQuestion,
  AuditChecklistAnswer,
} from '../types/audit.types';

// ============================================================
// AUDIT CHECKLIST — v50.1
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
//       Bloco 4 — Resumo agregado
//
// A escolha do modo é automática: se `checklist.auditQuestions`
// existe e tem itens, entra no MODO 2. Caso contrário, MODO 1.
//
// COMPATIBILIDADE DE PROPS:
//   - `onUpdate`     — MANTIDA (só questions[])
//   - `onUpdateFull` — NOVA, opcional; quando presente, é chamada
//                      com o payload completo (questions +
//                      auditQuestions + constatação final).
//
// Isso garante ZERO regressão nos chamadores atuais.
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
}

const ANSWER_OPTIONS = [
  { value: 'C', label: 'Conforme', icon: CheckCircle, color: 'text-green-600' },
  { value: 'NC', label: 'Não Conforme', icon: XCircle, color: 'text-red-600' },
  { value: 'OB', label: 'Observação', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'OM', label: 'Oportunidade', icon: AlertCircle, color: 'text-blue-600' },
  { value: 'NA', label: 'Não Aplicável', icon: MinusCircle, color: 'text-gray-400' },
];

export function AuditChecklist({
  checklist,
  onUpdate,
  onUpdateFull,
  onComplete,
  isSubmitting = false,
  isReadOnly = false,
  companyResponses = [],
  controlsMap,
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
  // 🔍 DETECÇÃO DO MODO
  // ============================================================

  const hasAuditQuestions =
    Array.isArray(checklist.auditQuestions) &&
    checklist.auditQuestions.length > 0;

  // ============================================================
  // INICIALIZAÇÃO (INTACTO + EXTRA)
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
  }, [checklist, companyResponses]);

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

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setError(null);

    try {
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

  const handleComplete = async () => {
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

                    {question.evidenceIds &&
                      question.evidenceIds.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                          <Upload className="w-3 h-3" />
                          <span>
                            {question.evidenceIds.length} evidência
                            {question.evidenceIds.length !== 1 ? 's' : ''}{' '}
                            anexada
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
          FOOTER (INTACTO)
          ============================================================ */}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
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
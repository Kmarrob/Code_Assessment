import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MinusCircle, AlertCircle, Upload, Wand2 } from 'lucide-react';
import { AuditChecklist as AuditChecklistType, AuditChecklistItem } from '../types/audit.types';

interface AuditChecklistProps {
  checklist: AuditChecklistType;
  onUpdate: (questions: AuditChecklistItem[]) => Promise<void>;
  onComplete: () => Promise<void>;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  companyResponses?: Array<{
    controlId: string;
    maturityLevel: string;
    scenarioDescription?: string;
    observations?: string;
  }>;
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
  onComplete,
  isSubmitting = false,
  isReadOnly = false,
  companyResponses = [],
}: AuditChecklistProps) {
  const [questions, setQuestions] = useState<AuditChecklistItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let initialQuestions = checklist.questions || [];

    // Preenchimento e mapeamento automático com base no maturityLevel do banco de dados
    if (companyResponses && companyResponses.length > 0 && initialQuestions.length > 0) {
      const response = companyResponses.find(
        (r) => String(r.controlId) === String(checklist.controlId)
      );

      if (response && response.maturityLevel !== undefined) {
        const level = String(response.maturityLevel);
        let autoAnswer: 'NC' | 'OB' | 'C' = 'C';

        if (level === '0') {
          autoAnswer = 'NC'; // Não Implementado -> Não Conforme
        } else if (level === '1') {
          autoAnswer = 'OB'; // Parcialmente Implementado -> Observação
        } else {
          autoAnswer = 'C';  // Implementado -> Conforme
        }

        initialQuestions = initialQuestions.map((q) => {
          // Só aplica automaticamente se ainda não tiver sido respondido manualmente
          if (!q.answer || q.answer === '--') {
            return {
              ...q,
              answer: autoAnswer,
              observations: q.observations || response.scenarioDescription || response.observations || '',
            };
          }
          return q;
        });
      }
    }

    setQuestions(initialQuestions);
    setIsDirty(false);
  }, [checklist, companyResponses]);

  const handleAnswerChange = (index: number, field: keyof AuditChecklistItem, value: any) => {
    if (isReadOnly) return;
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
    setIsDirty(true);
    setError(null);
  };

  const handleAutoFill = () => {
    if (isReadOnly || !companyResponses || companyResponses.length === 0) return;

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
      observations: q.observations || response.scenarioDescription || response.observations || '',
    }));

    setQuestions(updated);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setError(null);
    try {
      await onUpdate(questions);
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

  const getAnswerBadge = (answer: string) => {
    const option = ANSWER_OPTIONS.find((o) => o.value === answer);
    if (!option) return null;
    const Icon = option.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${option.color} bg-gray-50`}>
        <Icon className="w-3 h-3" />
        {option.label}
      </span>
    );
  };

  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q) => q.answer && q.answer !== '--').length;
  const conforming = questions.filter((q) => q.answer === 'C').length;
  const nonConforming = questions.filter((q) => q.answer === 'NC').length;
  const observations = questions.filter((q) => q.answer === 'OB').length;
  const opportunities = questions.filter((q) => q.answer === 'OM').length;
  const notApplicable = questions.filter((q) => q.answer === 'NA').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Checklist - Controle {checklist.controlId}</h3>
            <p className="text-sm text-gray-500">{totalQuestions} perguntas • {answeredQuestions} respondidas</p>
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
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-xs font-medium text-green-600">{conforming}</span></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg"><XCircle className="w-4 h-4 text-red-600" /><span className="text-xs font-medium text-red-600">{nonConforming}</span></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg"><AlertCircle className="w-4 h-4 text-yellow-600" /><span className="text-xs font-medium text-yellow-600">{observations}</span></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg"><AlertCircle className="w-4 h-4 text-blue-600" /><span className="text-xs font-medium text-blue-600">{opportunities}</span></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg"><MinusCircle className="w-4 h-4 text-gray-400" /><span className="text-xs font-medium text-gray-400">{notApplicable}</span></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-lg"><span className="text-xs font-medium text-indigo-600">{totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0}%</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma pergunta cadastrada para este controle.</p>
            <p className="text-xs mt-1">Cadastre perguntas na biblioteca de perguntas para que novos planos possam utilizá-las.</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${
                question.answer === 'NC' ? 'border-red-200 bg-red-50' :
                question.answer === 'C' ? 'border-green-200 bg-green-50' :
                question.answer === 'NA' ? 'border-gray-200 bg-gray-50' :
                question.answer === 'OB' ? 'border-yellow-200 bg-yellow-50' :
                question.answer === 'OM' ? 'border-blue-200 bg-blue-50' :
                'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">{index + 1}. {question.question}</p>
                  {question.observations && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-sm text-gray-600">
                      <span className="font-medium">Observação:</span> {question.observations}
                    </div>
                  )}
                  {question.evidenceIds && question.evidenceIds.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <Upload className="w-3 h-3" />
                      <span>{question.evidenceIds.length} evidência(s) anexada(s)</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  {!isReadOnly ? (
                    <select
                      value={question.answer || '--'}
                      onChange={(e) => handleAnswerChange(index, 'answer', e.target.value as any)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="--">Selecione...</option>
                      {ANSWER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : (
                    <div className="flex justify-end">{getAnswerBadge(question.answer || '--') || <span className="text-xs text-gray-400">Não respondido</span>}</div>
                  )}
                  {!isReadOnly && (
                    <textarea
                      value={question.observations || ''}
                      onChange={(e) => handleAnswerChange(index, 'observations', e.target.value)}
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

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {error && <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}
          <div className="flex flex-wrap gap-2 ml-auto">
            {isDirty && !isReadOnly && (
              <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
            {!isReadOnly && checklist.status !== 'completed' && totalQuestions > 0 && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting || answeredQuestions < totalQuestions || saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                title={answeredQuestions < totalQuestions ? 'Responda todas as perguntas antes de concluir' : ''}
              >
                {isSubmitting ? 'Concluindo...' : 'Concluir Checklist'}
              </button>
            )}
            {checklist.status === 'completed' && (
              <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm"><CheckCircle className="w-4 h-4" />Concluído</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
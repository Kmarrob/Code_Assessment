// frontend/src/pages/UserAnswer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Clock, AlarmClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { userService } from '../services/user.service.js';
import { questionService } from '../services/question.service.js';
import { useAuth } from '../contexts/AuthContext.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog.js';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  controlId: string;
  controlName: string;
  text: string;
  objective: string;
  answerImplemented: string;
  answerPartial: string;
  answerNotImplemented: string;
  guidance: string;
  attachmentUrl: string;
  attachmentName: string;
}

export const UserAnswer: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [controlId, setControlId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedMaturity, setSelectedMaturity] = useState<string>('');
  const [scenarioDescription, setScenarioDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para progresso
  const [isInProgress, setIsInProgress] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🆕 TIMER DE INATIVIDADE
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos
  const INACTIVITY_WARNING_TIMEOUT = 30 * 1000; // 30 segundos para resposta
  
  // 🆕 Estados para modal de inatividade
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(30);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para o modal de confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hasExistingResponse, setHasExistingResponse] = useState(false);
  const [originalData, setOriginalData] = useState<{
    maturityLevel: string;
    scenarioDescription: string;
    notes: string;
  } | null>(null);

  // ============================================
  // FUNÇÃO DE SALVAMENTO DE PROGRESSO
  // ============================================
  const saveProgress = useCallback(async (status: 'in_progress' | 'interrupted' = 'in_progress') => {
    if (!assignmentId || !selectedMaturity) {
      return;
    }

    if (isSaving) return;

    setIsAutoSaving(true);
    try {
      await userService.saveProgress({
        assignmentId: assignmentId,
        partialData: {
          maturityLevel: selectedMaturity,
          scenarioDescription: scenarioDescription,
          notes: notes,
        },
        progressStatus: status,
      });
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      setIsInProgress(true);
      console.log('💾 Progresso salvo automaticamente');
    } catch (err) {
      console.error('❌ Erro ao salvar progresso:', err);
    } finally {
      setIsAutoSaving(false);
    }
  }, [assignmentId, selectedMaturity, scenarioDescription, notes, isSaving]);

  // ============================================
  // 🆕 GERENCIAR TIMER DE INATIVIDADE
  // ============================================
  const resetInactivityTimer = useCallback(() => {
    // Limpar timers existentes
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Fechar modal se estiver aberto
    if (showInactivityModal) {
      setShowInactivityModal(false);
      setInactivityCountdown(30);
    }

    // Se já tiver selecionado um nível, iniciar timer
    if (selectedMaturity && !isSaving) {
      inactivityTimerRef.current = setTimeout(() => {
        // Mostrar modal de aviso
        setShowInactivityModal(true);
        setInactivityCountdown(30);
        
        // Iniciar contagem regressiva
        countdownIntervalRef.current = setInterval(() => {
          setInactivityCountdown(prev => {
            if (prev <= 1) {
              // Tempo esgotado - marcar como interrompido
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
              }
              saveProgress('interrupted');
              setShowInactivityModal(false);
              // 🆕 CORREÇÃO: toast.info → toast com ícone
              toast('⏰ Inatividade detectada. Seu progresso foi salvo.', { icon: '⏰' });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT);
    }
  }, [selectedMaturity, isSaving, saveProgress, showInactivityModal]);

  // ============================================
  // 🆕 CONTINUAR (RESETAR TIMER)
  // ============================================
  const handleContinueActivity = useCallback(() => {
    // Limpar timers
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setShowInactivityModal(false);
    setInactivityCountdown(30);
    resetInactivityTimer();
    // 🆕 CORREÇÃO: toast.info → toast com ícone
    toast('🔄 Timer reiniciado. Continue sua atividade.', { icon: '🔄' });
  }, [resetInactivityTimer]);

  // ============================================
  // 🆕 SAIR (SALVAR COMO INTERROMPIDO)
  // ============================================
  const handleExitActivity = useCallback(async () => {
    // Limpar timers
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setShowInactivityModal(false);
    setInactivityCountdown(30);
    
    await saveProgress('interrupted');
    // 🆕 CORREÇÃO: toast.info → toast com ícone
    toast('📂 Progresso salvo. Você pode continuar depois.', { icon: '📂' });
    navigate('/dashboard');
  }, [saveProgress, navigate]);

  // ============================================
  // AUTOSAVE COM DEBOUNCE
  // ============================================
  useEffect(() => {
    if (!isLoading && assignmentId && selectedMaturity) {
      // Limpar timeout anterior
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Configurar novo timeout (3 segundos)
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress('in_progress');
      }, 3000);
      
      // 🆕 Resetar timer de inatividade
      resetInactivityTimer();
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [selectedMaturity, scenarioDescription, notes, isLoading, assignmentId, saveProgress, resetInactivityTimer]);

  // ============================================
  // SALVAR AO SAIR DA PÁGINA
  // ============================================
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && selectedMaturity) {
        try {
          await saveProgress('interrupted');
          console.log('💾 Progresso salvo ao sair da página');
        } catch (err) {
          console.error('❌ Erro ao salvar ao sair:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 🆕 Limpar timers ao desmontar
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [hasUnsavedChanges, selectedMaturity, saveProgress]);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const controls = await userService.getControls();
        const assignment = controls.find(c => c.assignmentId === assignmentId);
        
        if (!assignment) {
          setError('Atribuição não encontrada');
          setIsLoading(false);
          return;
        }

        setControlId(assignment.control?.id || '');

        const questionsData = await questionService.getUserQuestionsByControl(assignment.control?.id || '');
        setQuestions(questionsData);

        try {
          const savedProgress = await userService.getProgressByAssignment(assignmentId!);
          if (savedProgress && savedProgress.partialData) {
            console.log('📂 Progresso recuperado:', savedProgress);
            const pd = savedProgress.partialData;
            setSelectedMaturity(pd.maturityLevel || '');
            setScenarioDescription(pd.scenarioDescription || '');
            setNotes(pd.notes || '');
            setIsInProgress(true);
            setLastSavedAt(new Date(savedProgress.lastActivityAt));
            // 🆕 CORREÇÃO: toast.success mantido
            toast.success('📂 Progresso recuperado! Continue de onde parou.');
          }
        } catch (progressErr) {
          console.log('ℹ️ Nenhum progresso salvo para esta atribuição');
        }

        if (assignment.response) {
          setHasExistingResponse(true);
          setSelectedMaturity(assignment.response.maturityLevel || '');
          setScenarioDescription(assignment.response.scenarioDescription || '');
          setNotes(assignment.response.observations || '');
          
          setOriginalData({
            maturityLevel: assignment.response.maturityLevel || '',
            scenarioDescription: assignment.response.scenarioDescription || '',
            notes: assignment.response.observations || '',
          });
        }

        if (questionsData.length === 0) {
          setQuestions([{
            _id: 'default',
            controlId: assignment.control?.id || '',
            controlName: assignment.control?.nome || '',
            text: `Descreva o cenário atual para o controle ${assignment.control?.id} - ${assignment.control?.nome}`,
            objective: 'Avaliar a maturidade do controle',
            answerImplemented: 'O controle está totalmente implementado e funcionando conforme esperado.',
            answerPartial: 'O controle está parcialmente implementado ou com algumas deficiências.',
            answerNotImplemented: 'O controle não está implementado ou não funciona.',
            guidance: 'Descreva evidências que comprovem a implementação.',
            attachmentUrl: '',
            attachmentName: '',
          }]);
        }

        // 🆕 CORREÇÃO: Se não houver resposta existente e não houver progresso salvo, marcar como in_progress
        if (!hasExistingResponse && !isInProgress && assignmentId) {
          try {
            await userService.saveProgress({
              assignmentId: assignmentId,
              partialData: {
                maturityLevel: '',
                scenarioDescription: '',
                notes: '',
              },
              progressStatus: 'in_progress',
            });
            setIsInProgress(true);
            console.log('📝 Atividade marcada como em andamento');
          } catch (err) {
            console.error('❌ Erro ao marcar como em andamento:', err);
          }
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleBack = async () => {
    if (hasUnsavedChanges && selectedMaturity) {
      await saveProgress('interrupted');
    }
    navigate('/dashboard');
  };

  const getMaturityLabel = (level: string) => {
    switch(level) {
      case '2': return 'Implementado';
      case '1': return 'Parcial';
      case '0': return 'Não Implementado';
      default: return 'Não selecionado';
    }
  };

  const handleSaveClick = () => {
    if (!selectedMaturity) {
      // 🆕 CORREÇÃO: toast.error mantido
      toast.error('Selecione um nível de maturidade');
      return;
    }

    if (hasExistingResponse && originalData) {
      const hasChanges = 
        selectedMaturity !== originalData.maturityLevel ||
        scenarioDescription !== originalData.scenarioDescription ||
        notes !== originalData.notes;

      if (hasChanges) {
        setIsConfirmModalOpen(true);
        return;
      } else {
        // 🆕 CORREÇÃO: toast.info → toast com ícone
        toast('Nenhuma alteração detectada', { icon: 'ℹ️' });
        return;
      }
    }

    handleSave();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.saveResponse({
        assignmentId: assignmentId!,
        maturityLevel: selectedMaturity,
        scenarioDescription: scenarioDescription || undefined,
        notes: notes || undefined,
      });

      setSuccess('Resposta salva com sucesso!');
      // 🆕 CORREÇÃO: toast.success mantido
      toast.success('Resposta salva com sucesso!');
      
      setOriginalData({
        maturityLevel: selectedMaturity,
        scenarioDescription: scenarioDescription || '',
        notes: notes || '',
      });
      setHasExistingResponse(true);
      setIsInProgress(false);
      setHasUnsavedChanges(false);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao salvar resposta:', err);
      const message = err.response?.data?.message || 'Erro ao salvar resposta. Tente novamente.';
      setError(message);
      // 🆕 CORREÇÃO: toast.error mantido
      toast.error(message);
    } finally {
      setIsSaving(false);
      setIsConfirmModalOpen(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando pergunta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <Button className="mt-4" onClick={handleBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[0];

  return (
    <div 
      className="min-h-screen bg-gray-50 py-8"
      onMouseMove={resetInactivityTimer}
      onKeyDown={resetInactivityTimer}
      onClick={resetInactivityTimer}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </button>

        {(isInProgress || isAutoSaving || hasUnsavedChanges) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            {isAutoSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">Salvando progresso...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Alterações não salvas</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Progresso salvo {lastSavedAt ? `às ${lastSavedAt.toLocaleTimeString()}` : ''}
                </span>
              </>
            )}
            {isInProgress && !hasExistingResponse && (
              <span className="text-xs text-blue-600 ml-auto bg-blue-100 px-2 py-1 rounded-full">
                Em andamento
              </span>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="font-mono text-sm font-bold text-blue-600">
                  {currentQuestion?.controlId || controlId}
                </span>
              </div>
              <div>
                <CardTitle className="text-xl">
                  {currentQuestion?.controlName || 'Controle'}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {hasExistingResponse ? 'Editando sua resposta para este controle' : 'Responda as perguntas para avaliar a maturidade do controle'}
                  {isInProgress && !hasExistingResponse && (
                    <span className="ml-2 text-blue-600">(Progresso salvo)</span>
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pergunta de Avaliação</h3>
                <p className="text-gray-900 text-lg">{currentQuestion?.text}</p>
                {currentQuestion?.objective && (
                  <p className="text-sm text-gray-500 mt-2">
                    🎯 {currentQuestion.objective}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Maturidade *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedMaturity('2')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedMaturity === '2'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-700">Nível 2 - Implementado</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentQuestion?.answerImplemented || 'Controle totalmente implementado'}
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedMaturity('1')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedMaturity === '1'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-700">Nível 1 - Parcial</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentQuestion?.answerPartial || 'Controle parcialmente implementado'}
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedMaturity('0')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedMaturity === '0'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-700">Nível 0 - Não Implementado</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentQuestion?.answerNotImplemented || 'Controle não implementado'}
                    </p>
                  </button>
                </div>
                {selectedMaturity && (
                  <p className="text-sm text-gray-500 mt-2">
                    ✅ Nível selecionado: {getMaturityLabel(selectedMaturity)}
                    {hasExistingResponse && originalData && selectedMaturity !== originalData.maturityLevel && (
                      <span className="text-yellow-600 ml-2">(Anterior: {getMaturityLabel(originalData.maturityLevel)})</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Cenário Atual
                </label>
                <textarea
                  value={scenarioDescription}
                  onChange={(e) => {
                    setScenarioDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descreva como este controle está implementado na sua organização..."
                />
              </div>

              {currentQuestion?.guidance && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 {currentQuestion.guidance}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Observações adicionais sobre este controle..."
                />
              </div>

              {currentQuestion?.attachmentUrl && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">
                    📎 Documento de referência:{' '}
                    <a
                      href={currentQuestion.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {currentQuestion.attachmentName || 'Abrir anexo'}
                    </a>
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveClick}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {hasExistingResponse ? 'Atualizar Resposta' : 'Salvar Resposta'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        title="Confirmar Alteração"
        message={
          <>
            <p className="mb-2">Você está prestes a alterar sua resposta para este controle.</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <p><span className="font-medium">Nível anterior:</span> {getMaturityLabel(originalData?.maturityLevel || '')}</p>
              <p><span className="font-medium">Novo nível:</span> {getMaturityLabel(selectedMaturity)}</p>
              {scenarioDescription !== originalData?.scenarioDescription && (
                <p className="text-yellow-600 text-xs mt-1">⚠️ A descrição do cenário foi alterada</p>
              )}
              {notes !== originalData?.notes && (
                <p className="text-yellow-600 text-xs mt-1">⚠️ As observações foram alteradas</p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">Deseja continuar com esta alteração?</p>
          </>
        }
        confirmLabel="Sim, Alterar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleSave}
        onCancel={() => setIsConfirmModalOpen(false)}
        isLoading={isSaving}
      />

      <Dialog open={showInactivityModal} onOpenChange={setShowInactivityModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlarmClock className="h-6 w-6 text-yellow-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Você está inativo
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              Identificamos que você não interage com a página há 5 minutos.
              <br /><br />
              <span className="font-medium">Deseja continuar de onde parou ou salvar e sair?</span>
              <br /><br />
              <span className="text-sm text-yellow-600">
                ⏳ O progresso será salvo automaticamente em {inactivityCountdown} segundos.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleExitActivity}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Salvar e Sair
            </Button>
            <Button
              onClick={handleContinueActivity}
              className="w-full sm:w-auto bg-[#30736C] hover:bg-[#1E5359] text-white"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAnswer;
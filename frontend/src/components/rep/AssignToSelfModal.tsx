// frontend/src/components/rep/AssignToSelfModal.tsx
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { repService } from '../../services/rep.service.js';
import { controlService } from '../../services/control.service.js';

interface AssignToSelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  repId: string;
  onSuccess?: () => void;
}

interface Control {
  _id: string;
  id: string;
  nome: string;
  dominioDeSI: string[];
  tipoDeControle: string[];
  isAssigned: boolean;
}

export const AssignToSelfModal: React.FC<AssignToSelfModalProps> = ({
  isOpen,
  onClose,
  repId,
  onSuccess,
}) => {
  const [controls, setControls] = useState<Control[]>([]);
  const [filteredControls, setFilteredControls] = useState<Control[]>([]);
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableCount, setAvailableCount] = useState(0);

  // ============================================
  // ORDENAÇÃO NUMÉRICA DOS CONTROLES
  // ============================================
  const sortControlsById = (controlsArray: Control[]): Control[] => {
    return [...controlsArray].sort((a, b) => {
      const aNumbers = a.id.match(/\d+/g)?.map(Number) ?? [];
      const bNumbers = b.id.match(/\d+/g)?.map(Number) ?? [];

      const maxLength = Math.max(aNumbers.length, bNumbers.length);

      for (let i = 0; i < maxLength; i += 1) {
        const aNumber = aNumbers[i] ?? 0;
        const bNumber = bNumbers[i] ?? 0;

        if (aNumber !== bNumber) {
          return aNumber - bNumber;
        }
      }

      return a.id.localeCompare(b.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  };

  // ============================================
  // CARREGAR CONTROLES DISPONÍVEIS
  // ============================================
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadControls = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // 🔴 CORRIGIDO: Usar método específico para preposto
        const allControls = await controlService.getAvailableControls();

        const myAssignments = await repService.getMyAssignments();

        const assignedIds = new Set(
          myAssignments
            .map((assignment: any) => {
              const controlId = assignment?.controlId;

              if (
                controlId &&
                typeof controlId === 'object' &&
                '_id' in controlId
              ) {
                return String(controlId._id);
              }

              return controlId ? String(controlId) : null;
            })
            .filter((id: string | null): id is string => Boolean(id))
        );

        const available = allControls
          .filter((control: any) => {
            const controlId = String(control?._id ?? '');
            return controlId && !assignedIds.has(controlId);
          })
          .map(
            (control: any): Control => ({
              _id: String(control._id),
              id: String(control.id ?? control._id),
              nome: String(control.nome ?? 'Controle sem nome'),
              dominioDeSI: Array.isArray(control.dominioDeSI)
                ? control.dominioDeSI
                : [],
              tipoDeControle: Array.isArray(control.tipoDeControle)
                ? control.tipoDeControle
                : [],
              isAssigned: false,
            })
          );

        const sortedAvailable = sortControlsById(available);

        setControls(sortedAvailable);
        setFilteredControls(sortedAvailable);
        setAvailableCount(sortedAvailable.length);
        setSelectedControls([]);
      } catch (err: any) {
        console.error('Erro ao carregar controles:', err);

        setError(
          err?.response?.data?.message ??
            'Erro ao carregar controles disponíveis'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadControls();
  }, [isOpen, repId]);

  // ============================================
  // FILTRO DE BUSCA
  // ============================================
  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      setFilteredControls(controls);
      return;
    }

    const filtered = controls.filter((control) => {
      const matchesName = control.nome
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesId = control.id
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesDomain = control.dominioDeSI.some((domain) =>
        domain.toLowerCase().includes(normalizedSearch)
      );

      return matchesName || matchesId || matchesDomain;
    });

    setFilteredControls(filtered);
  }, [search, controls]);

  // ============================================
  // SELECIONAR / DESSELECIONAR CONTROLE
  // ============================================
  const handleToggleControl = (controlId: string) => {
    setSelectedControls((previousSelected) => {
      if (previousSelected.includes(controlId)) {
        return previousSelected.filter((id) => id !== controlId);
      }

      return [...previousSelected, controlId];
    });
  };

  // ============================================
  // SELECIONAR / DESSELECIONAR CONTROLES FILTRADOS
  // ============================================
  const handleSelectAll = () => {
    const filteredIds = filteredControls.map((control) => control._id);

    const allFilteredSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedControls.includes(id));

    if (allFilteredSelected) {
      setSelectedControls((previousSelected) =>
        previousSelected.filter((id) => !filteredIds.includes(id))
      );

      return;
    }

    setSelectedControls((previousSelected) => {
      const selectedIds = new Set(previousSelected);

      filteredIds.forEach((id) => {
        selectedIds.add(id);
      });

      return Array.from(selectedIds);
    });
  };

  // ============================================
  // ATRIBUIR CONTROLES
  // ============================================
  const handleSubmit = async () => {
    if (selectedControls.length === 0) {
      setError('Selecione pelo menos um controle para atribuir');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await repService.assignToSelf({
        controlIds: selectedControls,
      });

      const assignedCount = selectedControls.length;

      setSuccess(
        `${assignedCount} controle(s) atribuído(s) com sucesso!`
      );

      const selectedIds = new Set(selectedControls);

      const remaining = controls.filter(
        (control) => !selectedIds.has(control._id)
      );

      setControls(remaining);
      setFilteredControls(remaining);
      setAvailableCount(remaining.length);
      setSelectedControls([]);

      onSuccess?.();

      if (remaining.length === 0) {
        window.setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erro ao atribuir controles:', err);

      setError(
        err?.response?.data?.message ?? 'Erro ao atribuir controles'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // FECHAR MODAL
  // ============================================
  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setSelectedControls([]);
    setSearch('');
    setError(null);
    setSuccess(null);

    onClose();
  };

  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) {
    return null;
  }

  const filteredControlIds = filteredControls.map(
    (control) => control._id
  );

  const allFilteredSelected =
    filteredControlIds.length > 0 &&
    filteredControlIds.every((id) => selectedControls.includes(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Plus className="h-5 w-5 text-purple-600" />
              Atribuir Controles para Mim
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Selecione os controles que você deseja assumir
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            disabled={isSubmitting}
            aria-label="Fechar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />

              <p className="mt-4 text-gray-500">
                Carregando controles disponíveis...
              </p>
            </div>
          ) : availableCount === 0 && !search ? (
            <div className="py-12 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />

              <p className="text-lg font-medium text-gray-600">
                Todos os controles já estão atribuídos a você!
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Não há controles disponíveis para atribuição.
              </p>

              <Button
                className="mt-4"
                variant="outline"
                onClick={handleClose}
              >
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <Input
                    placeholder="Buscar controles..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full pl-9"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {filteredControls.length} controles disponíveis
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                    disabled={
                      isSubmitting || filteredControls.length === 0
                    }
                  >
                    {allFilteredSelected
                      ? 'Desmarcar Todos'
                      : 'Selecionar Todos'}
                  </Button>
                </div>
              </div>

              {filteredControls.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Search className="mx-auto mb-3 h-12 w-12 text-gray-300" />

                  <p>
                    Nenhum controle encontrado para &quot;{search}&quot;
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                  {filteredControls.map((control) => {
                    const isSelected = selectedControls.includes(
                      control._id
                    );

                    return (
                      <div
                        key={control._id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          handleToggleControl(control._id)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            event.preventDefault();
                            handleToggleControl(control._id);
                          }
                        }}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {control.nome}
                            </span>

                            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-400">
                              {control.id}
                            </span>
                          </div>

                          {control.dominioDeSI.length > 0 && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <span className="text-xs text-gray-500">
                                Domínios:
                              </span>

                              {control.dominioDeSI
                                .slice(0, 2)
                                .map((domain, index) => (
                                  <span
                                    key={`${control._id}-domain-${index}`}
                                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                  >
                                    {domain}
                                  </span>
                                ))}

                              {control.dominioDeSI.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{control.dominioDeSI.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <ChevronRight
                          className={`h-5 w-5 flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'text-purple-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="text-sm text-gray-500">
            {selectedControls.length > 0 && (
              <span className="font-medium text-purple-600">
                {selectedControls.length} controle(s) selecionado(s)
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                selectedControls.length === 0 ||
                isLoading
              }
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atribuindo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Atribuir{' '}
                  {selectedControls.length > 0 &&
                    `(${selectedControls.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AssignToSelfModal;
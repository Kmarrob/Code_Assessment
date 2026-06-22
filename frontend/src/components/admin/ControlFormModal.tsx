// frontend/src/components/admin/ControlFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

interface Control {
  _id?: string;
  id: string;
  nome: string;
  controles: string;
  dominioDeSI: string[];
  tipoDeControle: string[];
  propriedadeDeSI: string[];
  conceitoDeSegurancaCibernetica: string[];
  capacidadesOperacionais: string[];
}

interface ControlFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Control>) => Promise<void>;
  control?: Control | null;
  title: string;
  isLoading?: boolean;
}

const DOMINIOS = [
  'Governança e ecossistema',
  'Proteção',
  'Defesa',
  'Resiliência',
  'Garantia de segurança da informação'
];

const TIPOS_CONTROLE = [
  'Preventivo',
  'Detectivo',
  'Corretivo'
];

const PROPRIEDADES_SI = [
  'Confidencialidade',
  'Integridade',
  'Disponibilidade'
];

const CONCEITOS = [
  'Identificar',
  'Proteger',
  'Detectar',
  'Responder',
  'Restaurar'
];

const CAPACIDADES = [
  'Governança',
  'Gestão de ativos',
  'Proteção da informação',
  'Gestão de identidade e acesso',
  'Segurança nas relações com fornecedores',
  'Gestão de evento de segurança da informação'
];

export const ControlFormModal: React.FC<ControlFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  control,
  title,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Control>>({
    id: '',
    nome: '',
    controles: '',
    dominioDeSI: [],
    tipoDeControle: [],
    propriedadeDeSI: [],
    conceitoDeSegurancaCibernetica: [],
    capacidadesOperacionais: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (control) {
      setFormData({
        id: control.id || '',
        nome: control.nome || '',
        controles: control.controles || '',
        dominioDeSI: control.dominioDeSI || [],
        tipoDeControle: control.tipoDeControle || [],
        propriedadeDeSI: control.propriedadeDeSI || [],
        conceitoDeSegurancaCibernetica: control.conceitoDeSegurancaCibernetica || [],
        capacidadesOperacionais: control.capacidadesOperacionais || [],
      });
    } else {
      setFormData({
        id: '',
        nome: '',
        controles: '',
        dominioDeSI: [],
        tipoDeControle: [],
        propriedadeDeSI: [],
        conceitoDeSegurancaCibernetica: [],
        capacidadesOperacionais: [],
      });
    }
    setErrors({});
  }, [control, isOpen]);

  const handleChange = (field: keyof Control, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (field: keyof Control, value: string) => {
    const current = formData[field] as string[] || [];
    const index = current.indexOf(value);
    let newArray: string[];
    if (index >= 0) {
      newArray = current.filter((item) => item !== value);
    } else {
      newArray = [...current, value];
    }
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.id?.trim()) newErrors.id = 'ID é obrigatório';
    if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      // Erro já tratado no pai
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID do Controle *
              </label>
              <Input
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="Ex: 5.1, 6.2, 8.3"
                className={errors.id ? 'border-red-500' : ''}
                disabled={!!control?._id}
              />
              {errors.id && <p className="text-sm text-red-500 mt-1">{errors.id}</p>}
              {control?._id && (
                <p className="text-xs text-gray-400 mt-1">ID não pode ser alterado após a criação</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Controle *
              </label>
              <Input
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Políticas de segurança da informação"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Controle
            </label>
            <textarea
              value={formData.controles || ''}
              onChange={(e) => handleChange('controles', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Descrição detalhada do controle..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domínios de SI
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMINIOS.map((dominio) => (
                <button
                  key={dominio}
                  type="button"
                  onClick={() => handleArrayChange('dominioDeSI', dominio)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (formData.dominioDeSI || []).includes(dominio)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dominio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Controle
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_CONTROLE.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleArrayChange('tipoDeControle', tipo)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (formData.tipoDeControle || []).includes(tipo)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propriedades de SI
            </label>
            <div className="flex flex-wrap gap-2">
              {PROPRIEDADES_SI.map((propriedade) => (
                <button
                  key={propriedade}
                  type="button"
                  onClick={() => handleArrayChange('propriedadeDeSI', propriedade)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (formData.propriedadeDeSI || []).includes(propriedade)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {propriedade}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conceitos de Segurança Cibernética
            </label>
            <div className="flex flex-wrap gap-2">
              {CONCEITOS.map((conceito) => (
                <button
                  key={conceito}
                  type="button"
                  onClick={() => handleArrayChange('conceitoDeSegurancaCibernetica', conceito)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (formData.conceitoDeSegurancaCibernetica || []).includes(conceito)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {conceito}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidades Operacionais
            </label>
            <div className="flex flex-wrap gap-2">
              {CAPACIDADES.map((capacidade) => (
                <button
                  key={capacidade}
                  type="button"
                  onClick={() => handleArrayChange('capacidadesOperacionais', capacidade)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (formData.capacidadesOperacionais || []).includes(capacidade)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {capacidade}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
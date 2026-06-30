// frontend/src/components/admin/ControlFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  'Resiliência'
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
  'Gestão de evento de segurança da informação',
  'Gestão de ameaças e vulnerabilidades',
  'Gestão de continuidade do negócio',
  'Segurança física',
  'Desenvolvimento seguro',
  'Gestão de redes',
  'Monitoramento e análise',
  'Gestão de pessoas',
  'Gestão de criptografia',
  'Garantia de segurança da informação',
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
  
  const isSavingRef = useRef(false);

  // ============================================
  // CARREGAMENTO SIMPLIFICADO E DIRETO
  // ============================================
  useEffect(() => {
    if (isSavingRef.current) {
      console.log('🔄 Salvando em andamento - mantendo dados');
      return;
    }
    
    if (!isOpen) {
      return;
    }
    
    if (control) {
      console.log('🔍 ControlFormModal - control recebido:', control);
      
      // Garantir que dominioDeSI seja um array
      let dominios = control.dominioDeSI || [];
      if (typeof dominios === 'string') {
        dominios = [dominios];
      }
      if (!Array.isArray(dominios)) {
        dominios = [];
      }
      
      // Garantir que tipoDeControle seja um array
      let tipos = control.tipoDeControle || [];
      if (typeof tipos === 'string') {
        tipos = [tipos];
      }
      if (!Array.isArray(tipos)) {
        tipos = [];
      }
      
      // Garantir que propriedadeDeSI seja um array
      let propriedades = control.propriedadeDeSI || [];
      if (typeof propriedades === 'string') {
        propriedades = [propriedades];
      }
      if (!Array.isArray(propriedades)) {
        propriedades = [];
      }
      
      // Garantir que conceitoDeSegurancaCibernetica seja um array
      let conceitos = control.conceitoDeSegurancaCibernetica || [];
      if (typeof conceitos === 'string') {
        conceitos = [conceitos];
      }
      if (!Array.isArray(conceitos)) {
        conceitos = [];
      }
      
      // Garantir que capacidadesOperacionais seja um array
      let capacidades = control.capacidadesOperacionais || [];
      if (typeof capacidades === 'string') {
        capacidades = [capacidades];
      }
      if (!Array.isArray(capacidades)) {
        capacidades = [];
      }
      
      console.log('🔍 Mapeamento inicial dos domínios carregados:', dominios);
      
      setFormData({
        id: control.id || '',
        nome: control.nome || '',
        controles: control.controles || '',
        dominioDeSI: dominios,
        tipoDeControle: tipos,
        propriedadeDeSI: propriedades,
        conceitoDeSegurancaCibernetica: conceitos,
        capacidadesOperacionais: capacidades,
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
    
    console.log(`⚡ Alterando array do campo [${field}]:`, newArray);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  // ============================================
  // CORREÇÃO: HandleSubmit com Logs Detalhados
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log('⏳ Aguardando salvamento anterior...');
      return;
    }
    
    // Logs de auditoria antes da validação
    console.log('💾 [FormModal] Dados em cache (formData):', formData);
    console.log('💾 [FormModal] dominioDeSI capturado:', formData.dominioDeSI);
    console.log('💾 [FormModal] Tipo estrutural do domínio:', typeof formData.dominioDeSI);
    console.log('💾 [FormModal] É uma instância de array?', Array.isArray(formData.dominioDeSI));
    console.log('💾 [FormModal] Total de domínios validados na View:', formData.dominioDeSI?.length || 0);
    
    const newErrors: Record<string, string> = {};
    if (!formData.id?.trim()) newErrors.id = 'ID é obrigatório';
    if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      isSavingRef.current = true;
      
      const payload = {
        ...formData,
        dominioDeSI: Array.isArray(formData.dominioDeSI) ? formData.dominioDeSI : [],
        tipoDeControle: Array.isArray(formData.tipoDeControle) ? formData.tipoDeControle : [],
        propriedadeDeSI: Array.isArray(formData.propriedadeDeSI) ? formData.propriedadeDeSI : [],
        conceitoDeSegurancaCibernetica: Array.isArray(formData.conceitoDeSegurancaCibernetica) ? formData.conceitoDeSegurancaCibernetica : [],
        capacidadesOperacionais: Array.isArray(formData.capacidadesOperacionais) ? formData.capacidadesOperacionais : [],
      };
      
      console.log('🚀 [FormModal] Despachando Payload Final para o Handler:', payload);
      await onSave(payload);
    } catch (error) {
      console.error('❌ Erro crítico na pipeline de salvamento:', error);
    } finally {
      isSavingRef.current = false;
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
            type="button"
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

          {/* Domínios de SI com tratamento para multipla seleção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domínios de SI
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMINIOS.map((dominio) => {
                const isSelected = (formData.dominioDeSI || []).includes(dominio);
                return (
                  <button
                    key={dominio}
                    type="button"
                    onClick={() => handleArrayChange('dominioDeSI', dominio)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dominio}
                    {isSelected && ' ✓'}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formData.dominioDeSI?.length || 0} domínio(s) selecionado(s)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Controle
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_CONTROLE.map((tipo) => {
                const isSelected = (formData.tipoDeControle || []).includes(tipo);
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleArrayChange('tipoDeControle', tipo)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tipo}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propriedades de SI
            </label>
            <div className="flex flex-wrap gap-2">
              {PROPRIEDADES_SI.map((propriedade) => {
                const isSelected = (formData.propriedadeDeSI || []).includes(propriedade);
                return (
                  <button
                    key={propriedade}
                    type="button"
                    onClick={() => handleArrayChange('propriedadeDeSI', propriedade)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {propriedade}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conceitos de Segurança Cibernética
            </label>
            <div className="flex flex-wrap gap-2">
              {CONCEITOS.map((conceito) => {
                const isSelected = (formData.conceitoDeSegurancaCibernetica || []).includes(conceito);
                return (
                  <button
                    key={conceito}
                    type="button"
                    onClick={() => handleArrayChange('conceitoDeSegurancaCibernetica', conceito)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {conceito}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidades Operacionais
            </label>
            <div className="flex flex-wrap gap-2">
              {CAPACIDADES.map((capacidade) => {
                const isSelected = (formData.capacidadesOperacionais || []).includes(capacidade);
                return (
                  <button
                    key={capacidade}
                    type="button"
                    onClick={() => handleArrayChange('capacidadesOperacionais', capacidade)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {capacidade}
                  </button>
                );
              })}
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
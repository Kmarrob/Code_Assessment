// frontend/src/components/admin/CompanyFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Building2 } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

interface Company {
  _id?: string;
  name: string;
  cnpj?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  maxUsers: number;
  maxControls: number;
}

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Company>) => Promise<void>;
  company?: Company | null;
  title: string;
  isLoading?: boolean;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  company,
  title,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    cnpj: '',
    plan: 'basic',
    status: 'active',
    maxUsers: 10,
    maxControls: 93,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        cnpj: company.cnpj || '',
        plan: company.plan || 'basic',
        status: company.status || 'active',
        maxUsers: company.maxUsers || 10,
        maxControls: company.maxControls || 93,
      });
    } else {
      setFormData({
        name: '',
        cnpj: '',
        plan: 'basic',
        status: 'active',
        maxUsers: 10,
        maxControls: 93,
      });
    }
    setErrors({});
  }, [company, isOpen]);

  const handleChange = (field: keyof Company, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (formData.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj) && !/^\d{14}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido (formato: 00.000.000/0000-00)';
    }

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Minha Empresa Ltda"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <Input
              value={formData.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
              className={errors.cnpj ? 'border-red-500' : ''}
            />
            {errors.cnpj && <p className="text-sm text-red-500 mt-1">{errors.cnpj}</p>}
            <p className="text-xs text-gray-400 mt-1">Opcional</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plano
              </label>
              <select
                value={formData.plan}
                onChange={(e) => handleChange('plan', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as any)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!company?._id}
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="suspended">Suspensa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Usuários
              </label>
              <Input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => handleChange('maxUsers', Number(e.target.value))}
                min={1}
                max={1000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Controles
              </label>
              <Input
                type="number"
                value={formData.maxControls}
                onChange={(e) => handleChange('maxControls', Number(e.target.value))}
                min={1}
                max={1000}
              />
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

export default CompanyFormModal;
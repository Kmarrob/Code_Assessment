// frontend/src/components/billing/CreditCardForm.tsx

import React, { useState } from 'react';
import { CreditCard, Calendar, Lock, User, AlertCircle } from 'lucide-react';
import { paymentGatewayService } from '../../services/payment.gateway.service.js';

export interface CreditCardData {
  number: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

interface CreditCardFormProps {
  value: CreditCardData;
  onChange: (data: CreditCardData) => void;
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  value,
  onChange,
  onValidationChange,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreditCardData, val: string | number) => {
    const newValue = { ...value, [field]: val };
    onChange(newValue);
    validateField(field, val);
  };

  const validateField = (field: keyof CreditCardData, val: string | number) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'number': {
        const num = val as string;
        if (!num || num.replace(/\D/g, '').length < 13) {
          newErrors.number = 'Número de cartão inválido';
        } else if (!paymentGatewayService.validateCardNumber(num)) {
          newErrors.number = 'Número de cartão inválido (verifique os dígitos)';
        } else {
          delete newErrors.number;
        }
        break;
      }
      case 'holderName': {
        const name = val as string;
        if (!name || name.length < 3) {
          newErrors.holderName = 'Nome do titular é obrigatório';
        } else {
          delete newErrors.holderName;
        }
        break;
      }
      case 'expiryMonth':
      case 'expiryYear': {
        const month = field === 'expiryMonth' ? Number(val) : value.expiryMonth;
        const year = field === 'expiryYear' ? Number(val) : value.expiryYear;
        if (!paymentGatewayService.validateCardExpiry(month, year)) {
          newErrors.expiry = 'Data de expiração inválida ou vencida';
        } else {
          delete newErrors.expiry;
        }
        break;
      }
      case 'cvv': {
        const cvv = val as string;
        if (!paymentGatewayService.validateCardCvv(cvv)) {
          newErrors.cvv = 'CVV inválido (3 ou 4 dígitos)';
        } else {
          delete newErrors.cvv;
        }
        break;
      }
    }

    setErrors(newErrors);

    if (onValidationChange) {
      const isValid = Object.keys(newErrors).length === 0;
      onValidationChange(isValid);
    }
  };

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const getCardBrand = (number: string): string => {
    const clean = number.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    if (/^35(2[89]|[3-8])/.test(clean)) return 'JCB';
    if (/^30[0-5]/.test(clean)) return 'Diners';
    return 'Cartão';
  };

  const getMaxCardLength = (): number => {
    const clean = value.number.replace(/\D/g, '');
    if (clean.startsWith('3')) return 15;
    return 16;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Lock className="h-4 w-4" />
        <span>Dados do cartão são criptografados e seguros</span>
      </div>

      {/* Número do Cartão */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número do Cartão
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={formatCardNumber(value.number)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              if (raw.length <= getMaxCardLength()) {
                handleChange('number', raw);
              }
            }}
            placeholder="1234 5678 9012 3456"
            disabled={disabled}
            className={`
              w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent
              ${errors.number ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            `}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
            {getCardBrand(value.number)}
          </span>
        </div>
        {errors.number && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.number}
          </p>
        )}
      </div>

      {/* Nome do Titular */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Titular
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <User className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={value.holderName}
            onChange={(e) => handleChange('holderName', e.target.value.toUpperCase())}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            disabled={disabled}
            className={`
              w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent
              ${errors.holderName ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            `}
          />
        </div>
        {errors.holderName && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.holderName}
          </p>
        )}
      </div>

      {/* Validade e CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validade (MM/AA)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex gap-1 pl-10">
              <input
                type="text"
                value={value.expiryMonth || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''));
                  if (val >= 1 && val <= 12) {
                    handleChange('expiryMonth', val);
                  } else if (!e.target.value) {
                    handleChange('expiryMonth', 0);
                  }
                }}
                placeholder="MM"
                maxLength={2}
                disabled={disabled}
                className={`
                  w-1/2 py-3 border rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-center
                  ${errors.expiry ? 'border-red-500' : 'border-gray-300'}
                  ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                `}
              />
              <span className="text-gray-400 text-lg flex items-center">/</span>
              <input
                type="text"
                value={value.expiryYear || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''));
                  if (val >= 0 && val <= 99) {
                    handleChange('expiryYear', val);
                  } else if (!e.target.value) {
                    handleChange('expiryYear', 0);
                  }
                }}
                placeholder="AA"
                maxLength={2}
                disabled={disabled}
                className={`
                  w-1/2 py-3 border rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-center
                  ${errors.expiry ? 'border-red-500' : 'border-gray-300'}
                  ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                `}
              />
            </div>
          </div>
          {errors.expiry && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.expiry}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              value={value.cvv}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 4) {
                  handleChange('cvv', val);
                }
              }}
              placeholder="XXX"
              maxLength={4}
              disabled={disabled}
              className={`
                w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent
                ${errors.cvv ? 'border-red-500' : 'border-gray-300'}
                ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
              `}
            />
          </div>
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Badges de segurança */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" /> Dados seguros
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> PCI Compliant
        </span>
      </div>
    </div>
  );
};
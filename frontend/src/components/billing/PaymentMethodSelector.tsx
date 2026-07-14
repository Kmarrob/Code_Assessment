// frontend/src/components/billing/PaymentMethodSelector.tsx

import React from 'react';
import { CreditCard, FileText, QrCode, Banknote, CheckCircle } from 'lucide-react';

export type PaymentMethod = 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const methods: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'credit_card',
    label: 'Cartão de Crédito',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Pagamento seguro com cartão',
  },
  {
    value: 'boleto',
    label: 'Boleto Bancário',
    icon: <FileText className="h-5 w-5" />,
    description: 'Vencimento em até 3 dias úteis',
  },
  {
    value: 'pix',
    label: 'Pix',
    icon: <QrCode className="h-5 w-5" />,
    description: 'Pagamento instantâneo',
  },
  {
    value: 'bank_transfer',
    label: 'Transferência Bancária',
    icon: <Banknote className="h-5 w-5" />,
    description: 'Ted ou DOC',
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Método de Pagamento
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {methods.map((method) => {
          const isSelected = selected === method.value;
          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onChange(method.value)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${
                  isSelected
                    ? 'border-[#30736C] bg-[#30736C]/5 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-[#30736C]/10 text-[#30736C]' : 'bg-gray-100 text-gray-500'}
                  `}
                >
                  {method.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-4 w-4 text-[#30736C]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
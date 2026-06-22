// frontend/src/components/ui/EmailInput.tsx
import React from 'react';
import { Input, InputProps } from './Input.js';
import { Mail } from 'lucide-react';

interface EmailInputProps extends Omit<InputProps, 'type' | 'icon'> {}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ onValidate, ...props }, ref) => {
    const validateEmail = (value: string): string | undefined => {
      if (!value) return undefined;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return 'Digite um email válido';
      }
      
      const domain = value.split('@')[1];
      if (domain && !domain.includes('.')) {
        return 'Domínio de email inválido';
      }
      
      return undefined;
    };

    return (
      <Input
        ref={ref}
        type="email"
        icon={<Mail className="h-4 w-4" />}
        onValidate={onValidate || validateEmail}
        validateOnChange
        placeholder="seu@email.com"
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';

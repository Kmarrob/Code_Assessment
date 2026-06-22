// frontend/src/components/ui/PasswordInput.tsx
import React from 'react';
import { Input, InputProps } from './Input.js';
import { PasswordStrength } from './PasswordStrength.js';
import { Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputProps, 'type' | 'icon'> {
  showStrength?: boolean;
  minLength?: number;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = true, minLength = 12, onValidate, ...props }, ref) => {
    const [password, setPassword] = React.useState('');

    const validatePassword = (value: string): string | undefined => {
      if (!value) return undefined;
      
      if (value.length < minLength) {
        return `Senha deve ter pelo menos ${minLength} caracteres`;
      }
      if (!/[A-Z]/.test(value)) {
        return 'Senha deve conter pelo menos 1 letra maiúscula';
      }
      if (!/[a-z]/.test(value)) {
        return 'Senha deve conter pelo menos 1 letra minúscula';
      }
      if (!/[0-9]/.test(value)) {
        return 'Senha deve conter pelo menos 1 número';
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Senha deve conter pelo menos 1 caractere especial';
      }
      
      return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    return (
      <div className="space-y-2">
        <Input
          ref={ref}
          type="password"
          icon={<Lock className="h-4 w-4" />}
          onValidate={onValidate || validatePassword}
          validateOnChange
          onChange={handleChange}
          showPasswordToggle
          placeholder="••••••••"
          {...props}
        />
        {showStrength && password && (
          <PasswordStrength password={password} />
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

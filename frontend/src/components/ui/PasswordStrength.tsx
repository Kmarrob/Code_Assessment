// frontend/src/components/ui/PasswordStrength.tsx
import React, { useMemo } from 'react';
import { cn } from '../../utils/helpers.js';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  bgColor: string;
  score: number;
}

const levels: StrengthLevel[] = [
  { label: 'Muito fraca', color: 'text-red-600', bgColor: 'bg-red-600', score: 0 },
  { label: 'Fraca', color: 'text-orange-500', bgColor: 'bg-orange-500', score: 1 },
  { label: 'Média', color: 'text-yellow-600', bgColor: 'bg-yellow-600', score: 2 },
  { label: 'Forte', color: 'text-green-500', bgColor: 'bg-green-500', score: 3 },
  { label: 'Muito forte', color: 'text-emerald-600', bgColor: 'bg-emerald-600', score: 4 },
];

const requirements = [
  { id: 'length', label: 'Pelo menos 12 caracteres', test: (p: string) => p.length >= 12 },
  { id: 'uppercase', label: 'Pelo menos 1 letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Pelo menos 1 letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Pelo menos 1 número', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Pelo menos 1 caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className,
}) => {
  const { score, level, passedRequirements } = useMemo(() => {
    const passed = requirements.filter((req) => req.test(password));
    const score = passed.length;
    const level = levels[Math.min(score, levels.length - 1)] || levels[0];
    return { score, level, passedRequirements: passed };
  }, [password]);

  const percentage = (score / requirements.length) * 100;

  if (!password) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', level.bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className={cn('text-xs font-medium', level.color)}>
          {level.label}
        </span>
        <span className="text-xs text-gray-400">
          {score}/{requirements.length}
        </span>
      </div>

      <ul className="space-y-1 mt-2">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li
              key={req.id}
              className={cn(
                'text-xs flex items-center gap-2 transition-colors',
                passed ? 'text-green-600' : 'text-gray-400'
              )}
            >
              <span className="text-lg leading-none">
                {passed ? '✓' : '○'}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

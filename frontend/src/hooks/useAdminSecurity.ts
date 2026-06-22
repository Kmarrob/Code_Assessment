// frontend/src/hooks/useAdminSecurity.ts
import { useState, useCallback } from 'react';
import { useSanitize } from './useSanitize.js';

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export function useAdminSecurity() {
  const { sanitizeApiData } = useSanitize();
  const [isValidating, setIsValidating] = useState(false);

  const validatePassword = useCallback((password: string): ValidationResult => {
    const errors: Record<string, string[]> = {};
    const issues: string[] = [];

    if (password.length < 12) {
      issues.push('Senha deve ter pelo menos 12 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 número');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      issues.push('Senha deve conter pelo menos 1 caractere especial');
    }

    if (issues.length > 0) {
      errors.password = issues;
      return { valid: false, errors };
    }

    return { valid: true, errors: {} };
  }, []);

  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: Record<string, string[]> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      errors.email = ['Email é obrigatório'];
      return { valid: false, errors };
    }

    if (!emailRegex.test(email)) {
      errors.email = ['Email inválido'];
      return { valid: false, errors };
    }

    return { valid: true, errors: {} };
  }, []);

  const validateAndSanitize = useCallback((
    data: Record<string, any>,
    rules: Record<string, (value: any) => ValidationResult>
  ): { valid: boolean; sanitized: Record<string, any>; errors: Record<string, string[]> } => {
    const sanitized = sanitizeApiData(data);
    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const [field, validator] of Object.entries(rules)) {
      if (field in sanitized) {
        const result = validator(sanitized[field]);
        if (!result.valid) {
          valid = false;
          Object.assign(errors, result.errors);
        }
      }
    }

    return { valid, sanitized, errors };
  }, [sanitizeApiData]);

  const checkPermission = useCallback((userRole: string, requiredRole: string): boolean => {
    const roleHierarchy: Record<string, number> = {
      admin: 4,
      rep: 3,
      consultant: 2,
      user: 1,
    };

    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
  }, []);

  const logSuspiciousActivity = useCallback((action: string, details?: Record<string, any>) => {
    console.warn(`[SECURITY] Ação suspeita: ${action}`, details);
  }, []);

  return {
    validatePassword,
    validateEmail,
    validateAndSanitize,
    checkPermission,
    logSuspiciousActivity,
    isValidating,
    setIsValidating,
  };
}

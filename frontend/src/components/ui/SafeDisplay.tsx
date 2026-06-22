// frontend/src/components/ui/SafeDisplay.tsx
import React from 'react';
import { useSanitize } from '../../hooks/useSanitize.js';

interface SafeDisplayProps {
  data: any;
  format?: 'text' | 'json' | 'html';
  className?: string;
}

export const SafeDisplay: React.FC<SafeDisplayProps> = ({
  data,
  format = 'text',
  className = '',
}) => {
  const { sanitizeApiData } = useSanitize();

  if (!data) return null;

  const sanitized = sanitizeApiData(data);

  if (format === 'json') {
    return (
      <pre className={className}>
        {JSON.stringify(sanitized, null, 2)}
      </pre>
    );
  }

  if (format === 'html') {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <span className={className}>{String(sanitized)}</span>;
};

export const SafeUserInfo: React.FC<{ user: any; className?: string }> = ({
  user,
  className = '',
}) => {
  const { sanitizeApiData } = useSanitize();

  if (!user) return null;

  const safeUser = sanitizeApiData(user);

  return (
    <div className={className}>
      <span className="font-medium">{safeUser.name}</span>
      <span className="text-gray-500 text-sm ml-2">{safeUser.email}</span>
    </div>
  );
};

// frontend/src/components/ui/SafeText.tsx
import React, { useMemo } from 'react';
import { useSanitize } from '../../hooks/useSanitize.js';

interface SafeTextProps {
  html: string;
  as?: 'span' | 'div' | 'p';
  className?: string;
  allowTags?: boolean;
}

export const SafeText: React.FC<SafeTextProps> = ({
  html,
  as: Component = 'span',
  className = '',
  allowTags = true,
}) => {
  const { sanitizeHtml } = useSanitize();

  const sanitized = useMemo(() => {
    if (!html) return '';
    if (allowTags) {
      return sanitizeHtml(html);
    }
    return sanitizeHtml(html).replace(/<[^>]*>/g, '');
  }, [html, allowTags, sanitizeHtml]);

  if (!sanitized) return null;

  if (allowTags) {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <Component className={className}>{sanitized}</Component>;
};

export const SafeString: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const { sanitizeApiData } = useSanitize();
  const sanitized = useMemo(() => sanitizeApiData(text), [text, sanitizeApiData]);
  return <span className={className}>{sanitized}</span>;
};

export const SafeArray: React.FC<{
  items: string[];
  className?: string;
  renderItem?: (item: string, index: number) => React.ReactNode;
}> = ({ items, className = '', renderItem }) => {
  const { sanitizeApiData } = useSanitize();

  const sanitizedItems = useMemo(
    () => sanitizeApiData(items),
    [items, sanitizeApiData]
  );

  if (!sanitizedItems || sanitizedItems.length === 0) {
    return null;
  }

  if (renderItem) {
    return <>{sanitizedItems.map((item, index) => renderItem(item, index))}</>;
  }

  return (
    <span className={className}>
      {sanitizedItems.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </span>
  );
};

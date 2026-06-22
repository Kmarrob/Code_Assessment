// frontend/src/hooks/useSanitize.ts
import { useCallback } from 'react';
import DOMPurify from 'dompurify';

const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'code', 'pre', 'blockquote', 'table', 'thead',
    'tbody', 'tr', 'td', 'th'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
  USE_PROFILES: { html: true },
};

export function useSanitize() {
  const sanitizeHtml = useCallback((html: string): string => {
    if (!html) return '';
    return DOMPurify.sanitize(html, purifyConfig);
  }, []);

  const sanitizeObject = useCallback(<T extends Record<string, any>>(obj: T): T => {
    if (!obj || typeof obj !== 'object') return obj;

    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key as keyof T] = DOMPurify.sanitize(value, {
          ...purifyConfig,
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        }) as any;
      } else if (Array.isArray(value)) {
        result[key as keyof T] = value.map((item) =>
          typeof item === 'string'
            ? DOMPurify.sanitize(item, {
                ...purifyConfig,
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: [],
              })
            : typeof item === 'object' && item !== null
            ? sanitizeObject(item)
            : item
        ) as any;
      } else if (typeof value === 'object' && value !== null) {
        result[key as keyof T] = sanitizeObject(value);
      } else {
        result[key as keyof T] = value;
      }
    }
    return result;
  }, []);

  const sanitizeApiData = useCallback(<T>(data: T): T => {
    if (!data) return data;
    if (typeof data === 'string') {
      return DOMPurify.sanitize(data, {
        ...purifyConfig,
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      }) as any;
    }
    if (typeof data === 'object') {
      return sanitizeObject(data as any);
    }
    return data;
  }, [sanitizeObject]);

  return {
    sanitizeHtml,
    sanitizeObject,
    sanitizeApiData,
  };
}

// frontend/src/components/admin/AdminSchemaMarkup.tsx
import React from 'react';
import { SchemaMarkup } from '../SchemaMarkup.js';

export const AdminSchemaMarkup: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Painel Administrativo - Code_Assessment',
    description: 'Painel administrativo do sistema Code_Assessment para gestão de usuários e controles.',
    url: 'https://code-assessment.com/admin',
    isPartOf: {
      '@type': 'WebApplication',
      name: 'Code_Assessment',
      description: 'Sistema de avaliação de maturidade ISO 27001',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: 'https://code-assessment.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Administração',
          item: 'https://code-assessment.com/admin',
        },
      ],
    },
  };

  return <SchemaMarkup schema={schema} />;
};

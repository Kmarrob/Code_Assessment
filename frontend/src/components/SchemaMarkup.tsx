// frontend/src/components/SchemaMarkup.tsx
import React from 'react';

interface SchemaMarkupProps {
  schema: Record<string, any>;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schema }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const OrganizationSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Code_Assessment',
    description: 'Sistema de avaliação de maturidade em Segurança da Informação baseado na ISO 27001',
    url: 'https://code-assessment.com',
    logo: 'https://code-assessment.com/logo.png',
    sameAs: [
      'https://linkedin.com/company/code-assessment',
      'https://twitter.com/code_assessment',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-9999-9999',
      contactType: 'sales',
      availableLanguage: ['Portuguese'],
    },
  };

  return <SchemaMarkup schema={schema} />;
};

export const WebApplicationSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Code_Assessment',
    description: 'Sistema de avaliação de maturidade em Segurança da Informação baseado na ISO 27001',
    url: 'https://code-assessment.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    featureList: [
      '93 Controles ISO 27002',
      'Dashboards Avançados',
      'Matriz de Priorização',
      'NIST Framework',
      'Benchmarking',
      'Multi-tenant Seguro',
    ],
  };

  return <SchemaMarkup schema={schema} />;
};

export const BreadcrumbSchema: React.FC<{
  items: { name: string; item: string }[];
}> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return <SchemaMarkup schema={schema} />;
};

export const FAQSchema: React.FC<{
  questions: { question: string; answer: string }[];
}> = ({ questions }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return <SchemaMarkup schema={schema} />;
};

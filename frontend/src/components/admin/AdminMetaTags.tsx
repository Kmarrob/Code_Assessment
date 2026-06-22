// frontend/src/components/admin/AdminMetaTags.tsx
import React from 'react';
import { MetaTags } from '../MetaTags.js';
import { useLocation } from 'react-router-dom';

interface AdminMetaTagsProps {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export const AdminMetaTags: React.FC<AdminMetaTagsProps> = ({
  title,
  description,
  noIndex = true,
}) => {
  const location = useLocation();
  
  const getMetaData = () => {
    const path = location.pathname;
    
    if (title) {
      return { title, description };
    }
    
    switch (path) {
      case '/admin':
        return {
          title: 'Dashboard Administrativo - Code_Assessment',
          description: 'Painel administrativo do Code_Assessment com métricas e indicadores do sistema de avaliação de maturidade ISO 27001.'
        };
      case '/admin/users':
        return {
          title: 'Gerenciar Usuários - Code_Assessment',
          description: 'Gerencie usuários do sistema Code_Assessment, incluindo administradores, prepostos, consultores e usuários finais.'
        };
      case '/admin/controls':
        return {
          title: 'Gerenciar Controles - Code_Assessment',
          description: 'Gerencie os 93 controles da ISO 27001 no sistema Code_Assessment.'
        };
      case '/admin/settings':
        return {
          title: 'Configurações - Code_Assessment',
          description: 'Configurações do sistema Code_Assessment.'
        };
      default:
        return {
          title: 'Administração - Code_Assessment',
          description: 'Painel administrativo do Code_Assessment.'
        };
    }
  };

  const meta = getMetaData();

  return (
    <MetaTags
      title={meta.title}
      description={meta.description}
      noIndex={noIndex}
      canonical={`https://code-assessment.com${location.pathname}`}
      ogTitle={meta.title}
      ogDescription={meta.description}
      ogImage="https://code-assessment.com/admin-og-image.jpg"
      twitterCard="summary"
      twitterTitle={meta.title}
      twitterDescription={meta.description}
    />
  );
};

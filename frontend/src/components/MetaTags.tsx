// frontend/src/components/MetaTags.tsx
import React from 'react';
import { useSEO, SEOProps } from '../hooks/useSEO.js';

export interface MetaTagsProps extends SEOProps {
  children?: React.ReactNode;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  children,
  ...seoProps
}) => {
  useSEO(seoProps);
  return <>{children}</>;
};

export const HomeMetaTags: React.FC = () => (
  <MetaTags
    title="Code_Assessment - Avaliação de Maturidade ISO 27001"
    description="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001. Gerencie controles, usuários e relatórios em um só lugar."
    keywords={['ISO 27001', 'Segurança da Informação', 'Assessment', 'Maturidade', 'Controles']}
    ogTitle="Code_Assessment - Avaliação de Maturidade ISO 27001"
    ogDescription="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001."
  />
);

export const LoginMetaTags: React.FC = () => (
  <MetaTags
    title="Login - Code_Assessment"
    description="Faça login no Code_Assessment para acessar o sistema de avaliação de maturidade ISO 27001."
    keywords={['login', 'acesso', 'autenticação']}
    ogTitle="Login - Code_Assessment"
    ogDescription="Faça login no Code_Assessment para acessar o sistema de avaliação de maturidade ISO 27001."
    noIndex
  />
);

export const RegisterMetaTags: React.FC = () => (
  <MetaTags
    title="Cadastro - Code_Assessment"
    description="Cadastre-se no Code_Assessment e comece a avaliar a maturidade em Segurança da Informação da sua organização."
    keywords={['cadastro', 'registro', 'criar conta']}
    ogTitle="Cadastro - Code_Assessment"
    ogDescription="Cadastre-se no Code_Assessment e comece a avaliar a maturidade em Segurança da Informação."
    noIndex
  />
);

export const DashboardMetaTags: React.FC<{ role?: string }> = ({ role }) => (
  <MetaTags
    title={`Dashboard ${role ? `- ${role.charAt(0).toUpperCase() + role.slice(1)}` : ''} - Code_Assessment`}
    description="Dashboard do Code_Assessment com métricas e indicadores de maturidade em Segurança da Informação."
    keywords={['dashboard', 'métricas', 'indicadores', 'maturidade']}
    ogTitle="Dashboard - Code_Assessment"
    ogDescription="Dashboard com métricas e indicadores de maturidade em Segurança da Informação."
    noIndex
  />
);

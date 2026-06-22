// frontend/src/hooks/useSEO.ts
import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const defaultSEO: SEOProps = {
  title: 'Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001',
  description: 'Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001.',
  keywords: ['ISO 27001', 'Segurança da Informação', 'Assessment', 'Maturidade'],
  ogTitle: 'Code_Assessment - Avaliação de Maturidade ISO 27001',
  ogDescription: 'Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001.',
  twitterCard: 'summary_large_image',
};

export function useSEO(props: Partial<SEOProps> = {}) {
  const seo = { ...defaultSEO, ...props };

  useEffect(() => {
    document.title = seo.title;
    updateMetaTag('description', seo.description);

    if (seo.keywords) {
      updateMetaTag('keywords', seo.keywords.join(', '));
    }

    updateLinkTag('canonical', seo.canonical || window.location.href);

    if (seo.noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    updateMetaTag('og:title', seo.ogTitle || seo.title);
    updateMetaTag('og:description', seo.ogDescription || seo.description);
    updateMetaTag('og:image', seo.ogImage || 'https://code-assessment.com/og-image.jpg');
    updateMetaTag('og:url', seo.ogUrl || window.location.href);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'Code_Assessment');

    updateMetaTag('twitter:card', seo.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seo.twitterTitle || seo.ogTitle || seo.title);
    updateMetaTag('twitter:description', seo.twitterDescription || seo.ogDescription || seo.description);
    updateMetaTag('twitter:image', seo.twitterImage || seo.ogImage || 'https://code-assessment.com/og-image.jpg');
  }, [seo]);
}

function updateMetaTag(name: string, content: string | undefined) {
  if (!content) return;

  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string | undefined) {
  if (!href) return;

  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

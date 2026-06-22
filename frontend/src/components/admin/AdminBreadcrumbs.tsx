// frontend/src/components/admin/AdminBreadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', path: '/admin' },
  ],
  '/admin/usuarios': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Usuários', path: '/admin/usuarios' },
  ],
  '/admin/controles': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Controles', path: '/admin/controles' },
  ],
  '/admin/empresas': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Empresas', path: '/admin/empresas' },
  ],
  '/admin/perguntas': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Perguntas', path: '/admin/perguntas' },
  ],
  '/admin/consultores': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Consultores', path: '/admin/consultores' },
  ],
  '/admin/configuracoes': [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Configurações', path: '/admin/configuracoes' },
  ],
};

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();

  // Normalizar path para suportar URLs antigas
  let path = location.pathname;
  path = path.replace('/users', '/usuarios');
  path = path.replace('/controls', '/controles');
  path = path.replace('/settings', '/configuracoes');

  const items = breadcrumbMap[path] || [
    { label: 'Dashboard', path: '/admin' },
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index === 0 ? (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ) : (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { NotificationBell } from './NotificationBell.js';
import { brandingService, PublicBrandingData } from '../services/branding.service.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

// Logo da MRS Consultoria (caminho fixo - imagem local - FALLBACK)
const MRS_LOGO_FALLBACK = '/images/brand/logo-mrs.png';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [branding, setBranding] = useState<PublicBrandingData | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // 🔴 CORREÇÃO: Buscar companyId sem bloquear a renderização
  // ============================================
  useEffect(() => {
    const getCompanyId = async () => {
      // ✅ CORREÇÃO: Se não tem usuário, não faz nada
      if (!user) {
        setCompanyId(null);
        return;
      }

      // ✅ CORREÇÃO: Verificar se o token existe no localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setCompanyId(null);
        return;
      }

      // REP ou USER: usar companyId do usuário
      if (user.companyId) {
        setCompanyId(user.companyId as string);
        return;
      }

      // REP: tentar extrair company de outras formas
      if (user.role === 'rep') {
        const userAny = user as any;
        if (userAny.company && typeof userAny.company === 'object' && userAny.company._id) {
          setCompanyId(userAny.company._id);
          return;
        }
        if (typeof userAny.company === 'string' && /^[0-9a-fA-F]{24}$/.test(userAny.company)) {
          setCompanyId(userAny.company);
          return;
        }
      }

      // ADMIN: buscar empresas (só se tiver token)
      if (user.role === 'admin') {
        try {
          const response = await fetch('/api/admin/companies', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.companies?.length > 0) {
              setCompanyId(data.data.companies[0]._id);
              return;
            }
          } else if (response.status === 401) {
            // Token inválido ou expirado
            console.warn('Sessão expirada, redirecionando para login');
            await logout();
            navigate('/login');
            return;
          }
          setCompanyId(null);
        } catch (error) {
          console.error('Erro ao buscar companyId:', error);
          setCompanyId(null);
        }
        return;
      }

      setCompanyId(null);
    };

    getCompanyId();
  }, [user, logout, navigate]);

  // ============================================
  // Buscar branding (não bloqueia a renderização)
  // ============================================
  useEffect(() => {
    const loadBranding = async () => {
      // Só buscar branding se tiver companyId válido E usuário autenticado E token existe
      if (!companyId || !user) {
        setBranding(null);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setBranding(null);
        return;
      }

      // Verificar se o companyId é um ObjectId válido (24 caracteres hex)
      const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);
      if (!isValidObjectId(companyId)) {
        setBranding(null);
        return;
      }
      
      try {
        const data = await brandingService.getPublicBranding(companyId);
        setBranding(data);
      } catch (error) {
        // Não logar erro como erro grave, apenas debug
        console.debug('Erro ao carregar branding:', error);
        setBranding(null);
      }
    };

    loadBranding();
  }, [companyId, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const colors = branding?.colors || MRS_COLORS;
  const showLogo = branding?.settings?.showLogoInHeader !== false;
  const logoUrl = branding?.logo?.url;
  const finalLogoUrl = (showLogo && logoUrl) ? logoUrl : MRS_LOGO_FALLBACK;

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: colors.background || '#F2F2F2' }}>
      {/* Navbar */}
      <header 
        className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden"
        style={{ 
          backgroundColor: colors.background || '#FFFFFF',
          borderBottomColor: colors.accent || '#30736C',
        }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between" style={{ minHeight: '80px' }}>
          <div className="flex items-center gap-2">
            {/* 🔴 CORRIGIDO: Redirecionar para o dashboard correto com base no perfil */}
            <Link to={user ? (user.role === 'user' ? '/dashboard' : `/${user.role}`) : "/"} className="flex items-center gap-2">
              {showLogo ? (
                <img
                  src={finalLogoUrl}
                  alt="MRS Consultoria"
                  className="h-32 w-auto object-contain"
                  style={{ 
                    maxHeight: '128px',
                    background: 'transparent',
                    backgroundColor: 'transparent',
                  }}
                  onError={(e) => {
                    if (e.currentTarget.src !== MRS_LOGO_FALLBACK) {
                      e.currentTarget.src = MRS_LOGO_FALLBACK;
                    } else {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('span');
                      fallback.className = 'text-lg font-semibold';
                      fallback.style.color = colors.primary || '#122A40';
                      fallback.textContent = 'MRS Consultoria';
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <span className="text-lg font-semibold" style={{ color: colors.primary || '#122A40' }}>
                  MRS Consultoria
                </span>
              )}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <NotificationBell />
                <span className="text-sm font-medium" style={{ color: colors.text || '#122A40' }}>
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm transition-colors hover:opacity-70"
                  style={{ color: colors.accent || '#30736C' }}
                  aria-label="Sair"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
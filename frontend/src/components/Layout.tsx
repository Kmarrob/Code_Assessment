// frontend/src/components/Layout.tsx
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

  // ============================================
  // 🔴 CORREÇÃO: Buscar companyId sem bloquear a renderização
  // ============================================
  useEffect(() => {
    const getCompanyId = async () => {
      if (!user) {
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

      // ADMIN: buscar empresas
      if (user.role === 'admin') {
        try {
          const response = await fetch('/api/admin/companies', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.companies?.length > 0) {
              setCompanyId(data.data.companies[0]._id);
              return;
            }
          }
          setCompanyId('67f8a1b2c3d4e5f6g7h8i9j0');
        } catch {
          setCompanyId('67f8a1b2c3d4e5f6g7h8i9j0');
        }
        return;
      }

      setCompanyId(null);
    };

    getCompanyId();
  }, [user]);

  // ============================================
  // Buscar branding (não bloqueia a renderização)
  // ============================================
  useEffect(() => {
    const loadBranding = async () => {
      if (!companyId) return;
      
      try {
        const data = await brandingService.getPublicBranding(companyId);
        setBranding(data);
      } catch (error) {
        console.error('Erro ao carregar branding:', error);
        setBranding(null);
      }
    };

    loadBranding();
  }, [companyId]);

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
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        style={{ 
          backgroundColor: colors.background || '#FFFFFF',
          borderBottomColor: colors.accent || '#30736C',
        }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between" style={{ minHeight: '80px' }}>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              {showLogo ? (
                <img
                  src={finalLogoUrl}
                  alt="MRS Consultoria"
                  className="h-32 w-auto object-contain"
                  style={{ maxHeight: '128px' }}
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
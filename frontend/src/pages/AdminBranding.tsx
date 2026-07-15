// 🔴 [FORCE COMMIT] v31 - Correção do loop infinito - 15/07/2026
// frontend/src/pages/AdminBranding.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { brandingService, BrandingData } from '../services/branding.service.js';
import { companyService } from '../services/company.service.js';
import { FeatureGuard } from '../components/common/FeatureGuard.js';
import {
  Upload,
  Trash2,
  Image,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Palette,
  FileImage,
  Monitor,
  Printer,
  LayoutDashboard,
  LogOut,
  Save,
  X,
  Plus,
  Lock,
  Building2,
  Search,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';

// Interface para empresa
interface Company {
  _id: string;
  name: string;
  cnpj?: string;
}

export const AdminBranding: React.FC = () => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    showLogoInHeader: true,
    showLogoInReport: true,
    useCustomColors: false,
  });
  const [companyId, setCompanyId] = useState<string>('');

  // ============================================
  // 🔴 NOVO: ESTADOS PARA O SELETOR DE EMPRESAS
  // ============================================
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔴 NOVO: Ref para controlar se o carregamento inicial já foi feito
  const hasLoadedRef = useRef(false);

  // Cores da logo MRS
  const defaultColors = {
    primary: '#122A40',
    secondary: '#1E5359',
    accent: '#30736C',
    background: '#F2F2F2',
    text: '#122A40',
  };

  // ============================================
  // 🔴 NOVO: CARREGAR EMPRESAS (APENAS ADMIN)
  // ============================================
  useEffect(() => {
    // 🔴 CORRIGIDO: Evita múltiplas execuções do useEffect
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    if (user?.role === 'admin') {
      loadCompanies();
    } else {
      // Se não for admin, usar o companyId do usuário
      const userCompanyId = user?.companyId;
      if (userCompanyId) {
        setSelectedCompanyId(userCompanyId);
        setCompanyId(userCompanyId);
        setIsLoadingCompanies(false);
        loadBranding(userCompanyId);
      }
    }
  }, [user]);

  // ============================================
  // 🔴 NOVO: CARREGAR BRANDING DA EMPRESA SELECIONADA
  // ============================================
  useEffect(() => {
    if (selectedCompanyId && user?.role === 'admin') {
      setCompanyId(selectedCompanyId);
      loadBranding(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // 🔴 NOVO: FUNÇÃO PARA CARREGAR EMPRESAS (CORRIGIDA)
  // ============================================
  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    setError(null);
    try {
      const response = await companyService.listCompanies({ limit: 100 });
      // 🔴 CORRIGIDO: Usar response.items (o array) em vez de response.companies
      const companiesList = response.items || [];
      setCompanies(companiesList);
      
      if (companiesList.length > 0) {
        // Tentar encontrar a empresa do admin
        const userCompany = companiesList.find(c => c._id === user?.companyId);
        const defaultCompany = userCompany || companiesList[0];
        setSelectedCompanyId(defaultCompany._id);
        setSelectedCompanyName(defaultCompany.name);
        setCompanyId(defaultCompany._id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar lista de empresas');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  // ============================================
  // FUNÇÃO PRINCIPAL DE CARREGAR BRANDING
  // ============================================
  const loadBranding = async (companyIdToLoad: string) => {
    if (!companyIdToLoad) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await brandingService.getBranding(companyIdToLoad);
      setBranding(data);
      
      if (data.branding?.settings) {
        setSettings({
          showLogoInHeader: data.branding.settings.showLogoInHeader ?? true,
          showLogoInReport: data.branding.settings.showLogoInReport ?? true,
          useCustomColors: data.branding.settings.useCustomColors ?? false,
        });
      }
    } catch (err: any) {
      console.error('Erro ao carregar branding:', err);
      setError(err.response?.data?.message || 'Erro ao carregar branding');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 🔴 NOVO: HANDLER PARA SELECIONAR EMPRESA
  // ============================================
  const handleSelectCompany = (company: Company) => {
    setSelectedCompanyId(company._id);
    setSelectedCompanyName(company.name);
    setIsDropdownOpen(false);
    setSearchTerm('');
    // Resetar previews
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedFavicon(null);
    setFaviconPreviewUrl(null);
    setError(null);
    setSuccess(null);
  };

  // ============================================
  // 🔴 NOVO: FILTRAR EMPRESAS POR BUSCA
  // ============================================
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const term = searchTerm.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.cnpj && c.cnpj.includes(term))
    );
  }, [companies, searchTerm]);

  // ============================================
  // HANDLERS EXISTENTES (MANTIDOS)
  // ============================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato não suportado. Use PNG, JPG, SVG ou WEBP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleFaviconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato não suportado. Use PNG, JPG, SVG, ICO ou WEBP.');
      return;
    }

    if (file.size > 512 * 1024) {
      setError('Arquivo muito grande. Máximo 512KB.');
      return;
    }

    setSelectedFavicon(file);
    setFaviconPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleUploadLogo = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo para upload');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await brandingService.uploadLogo(companyId, selectedFile);
      setBranding(result);
      setSuccess('Logo enviada com sucesso!');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadBranding(companyId);
    } catch (err: any) {
      console.error('Erro ao fazer upload da logo:', err);
      setError(err.response?.data?.message || 'Erro ao fazer upload da logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadFavicon = async () => {
    if (!selectedFavicon) {
      setError('Selecione um arquivo para upload');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await brandingService.uploadFavicon(companyId, selectedFavicon);
      setBranding(result);
      setSuccess('Favicon enviado com sucesso!');
      setSelectedFavicon(null);
      setFaviconPreviewUrl(null);
      if (faviconInputRef.current) {
        faviconInputRef.current.value = '';
      }
      await loadBranding(companyId);
    } catch (err: any) {
      console.error('Erro ao fazer upload do favicon:', err);
      setError(err.response?.data?.message || 'Erro ao fazer upload do favicon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Tem certeza que deseja remover a logo?')) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await brandingService.removeLogo(companyId);
      setSuccess('Logo removida com sucesso!');
      await loadBranding(companyId);
    } catch (err: any) {
      console.error('Erro ao remover logo:', err);
      setError(err.response?.data?.message || 'Erro ao remover logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFavicon = async () => {
    if (!confirm('Tem certeza que deseja remover o favicon?')) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await brandingService.removeFavicon(companyId);
      setSuccess('Favicon removido com sucesso!');
      await loadBranding(companyId);
    } catch (err: any) {
      console.error('Erro ao remover favicon:', err);
      setError(err.response?.data?.message || 'Erro ao remover favicon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await brandingService.updateSettings(companyId, settings);
      setSuccess('Configurações salvas com sucesso!');
      await loadBranding(companyId);
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.response?.data?.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  // Carregando empresas (admin)
  if (user?.role === 'admin' && isLoadingCompanies) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  // Nenhuma empresa (admin)
  if (user?.role === 'admin' && companies.length === 0 && !isLoadingCompanies) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-3">Nenhuma empresa encontrada</h2>
          <p className="text-gray-500">Cadastre uma empresa para gerenciar o branding.</p>
        </div>
      </div>
    );
  }

  // Carregando branding
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando branding...</p>
        </div>
      </div>
    );
  }

  const hasLogo = branding?.branding?.logo?.url && branding.branding.logo.url !== '';
  const hasFavicon = branding?.branding?.favicon?.url && branding.branding.favicon.url !== '';

  return (
    <FeatureGuard
      feature="canCustomizeBranding"
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Lock className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              Branding não disponível
            </h2>
            <p className="text-gray-500 mb-6">
              A personalização de branding está disponível apenas no plano Enterprise. 
              Faça um upgrade para personalizar a identidade visual da sua empresa.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/plans'}
              >
                Ver Planos
              </Button>
              <Button
                style={{ backgroundColor: '#30736C', color: '#FFFFFF' }}
                onClick={() => window.location.href = '/billing'}
              >
                Gerenciar Assinatura
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Branding</h1>
          <p className="text-gray-500 mt-2">
            Gerencie a identidade visual das empresas
          </p>
        </div>

        {/* ============================================
            🔴 NOVO: SELETOR DE EMPRESAS (APENAS ADMIN)
            ============================================ */}
        {user?.role === 'admin' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <label className="text-sm font-medium text-gray-700 min-w-[100px]">
                  Empresa:
                </label>
                <div className="relative w-full md:w-80" ref={dropdownRef}>
                  <div
                    className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {selectedCompanyName || 'Selecione uma empresa'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      {filteredCompanies.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Nenhuma empresa encontrada</div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <div
                            key={company._id}
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                              company._id === selectedCompanyId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => handleSelectCompany(company)}
                          >
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{company.name}</p>
                              {company.cnpj && <p className="text-xs text-gray-400">CNPJ: {company.cnpj}</p>}
                            </div>
                            {company._id === selectedCompanyId && (
                              <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {companies.length} {companies.length === 1 ? 'empresa' : 'empresas'} cadastradas
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================
            ALERTAS (MANTIDOS)
            ============================================ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============================================
            CONTEÚDO EXISTENTE (TOTALMENTE MANTIDO)
            ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-blue-600" />
                Logo da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview atual */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {hasLogo ? (
                    <div className="space-y-2">
                      <img
                        src={branding.branding.logo.url}
                        alt="Logo da empresa"
                        className="max-h-32 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-500">
                        {branding.branding.logo.filename} ({Math.round(branding.branding.logo.size / 1024)}KB)
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover logo
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma logo cadastrada</p>
                      <p className="text-sm text-gray-400 mt-1">PNG, JPG, SVG ou WEBP (máx. 2MB)</p>
                    </div>
                  )}
                </div>

                {/* Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar arquivo
                    </Button>
                  </div>

                  {selectedFile && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileImage className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {Math.round(selectedFile.size / 1024)}KB · {selectedFile.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {previewUrl && (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="h-12 w-auto object-contain border border-gray-200 rounded"
                            />
                          )}
                          <Button
                            size="sm"
                            onClick={handleUploadLogo}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Enviar'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favicon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Favicon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview atual */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {hasFavicon ? (
                    <div className="space-y-2">
                      <img
                        src={branding.branding.favicon.url}
                        alt="Favicon da empresa"
                        className="h-16 w-16 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-500">
                        {branding.branding.favicon.filename} ({Math.round(branding.branding.favicon.size / 1024)}KB)
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFavicon}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover favicon
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum favicon cadastrado</p>
                      <p className="text-sm text-gray-400 mt-1">PNG, JPG, SVG, ICO ou WEBP (máx. 512KB)</p>
                    </div>
                  )}
                </div>

                {/* Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
                      onChange={handleFaviconSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => faviconInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar arquivo
                    </Button>
                  </div>

                  {selectedFavicon && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{selectedFavicon.name}</p>
                            <p className="text-xs text-gray-500">
                              {Math.round(selectedFavicon.size / 1024)}KB · {selectedFavicon.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {faviconPreviewUrl && (
                            <img
                              src={faviconPreviewUrl}
                              alt="Preview favicon"
                              className="h-8 w-8 object-contain border border-gray-200 rounded"
                            />
                          )}
                          <Button
                            size="sm"
                            onClick={handleUploadFavicon}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Enviar'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configurações de Exibição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.showLogoInHeader}
                    onChange={(e) => setSettings({ ...settings, showLogoInHeader: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Exibir no Header</p>
                    <p className="text-xs text-gray-500">Mostrar logo na barra superior</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.showLogoInReport}
                    onChange={(e) => setSettings({ ...settings, showLogoInReport: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Exibir no Relatório</p>
                    <p className="text-xs text-gray-500">Mostrar logo na capa do relatório</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.useCustomColors}
                    onChange={(e) => setSettings({ ...settings, useCustomColors: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cores Personalizadas</p>
                    <p className="text-xs text-gray-500">Usar cores da logo no sistema</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cores da Marca */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              Cores da Marca MRS Consultoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div
                  className="h-16 w-full rounded-lg border border-gray-200"
                  style={{ backgroundColor: defaultColors.primary }}
                />
                <p className="text-sm font-medium text-gray-700 mt-2">Primária</p>
                <p className="text-xs text-gray-500">{defaultColors.primary}</p>
              </div>
              <div className="text-center">
                <div
                  className="h-16 w-full rounded-lg border border-gray-200"
                  style={{ backgroundColor: defaultColors.secondary }}
                />
                <p className="text-sm font-medium text-gray-700 mt-2">Secundária</p>
                <p className="text-xs text-gray-500">{defaultColors.secondary}</p>
              </div>
              <div className="text-center">
                <div
                  className="h-16 w-full rounded-lg border border-gray-200"
                  style={{ backgroundColor: defaultColors.accent }}
                />
                <p className="text-sm font-medium text-gray-700 mt-2">Destaque</p>
                <p className="text-xs text-gray-500">{defaultColors.accent}</p>
              </div>
              <div className="text-center">
                <div
                  className="h-16 w-full rounded-lg border border-gray-200"
                  style={{ backgroundColor: defaultColors.background }}
                />
                <p className="text-sm font-medium text-gray-700 mt-2">Fundo</p>
                <p className="text-xs text-gray-500">{defaultColors.background}</p>
              </div>
              <div className="text-center">
                <div
                  className="h-16 w-full rounded-lg border border-gray-200"
                  style={{ backgroundColor: defaultColors.text }}
                />
                <p className="text-sm font-medium text-gray-700 mt-2">Texto</p>
                <p className="text-xs text-gray-500">{defaultColors.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview de onde a logo aparece */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Preview da Logo no Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="h-12 flex items-center justify-center">
                  {hasLogo ? (
                    <img
                      src={branding.branding.logo.url}
                      alt="Logo preview"
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Sem logo</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Header</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="h-12 flex items-center justify-center">
                  {hasLogo ? (
                    <img
                      src={branding.branding.logo.url}
                      alt="Logo preview"
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Sem logo</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Dashboard</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="h-12 flex items-center justify-center">
                  {hasFavicon ? (
                    <img
                      src={branding.branding.favicon.url}
                      alt="Favicon preview"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Sem favicon</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Favicon (aba)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGuard>
  );
};

export default AdminBranding;
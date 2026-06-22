// frontend/src/pages/dashboard/AdminCompanySelector.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Loader2, AlertCircle, TrendingUp, Users, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { dashboardService, CompanySummary } from '../../services/dashboard.service.js';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout.js';
import toast from 'react-hot-toast';

export const AdminCompanySelector: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dashboardService.listCompaniesSummary();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (err: any) {
        console.error('Erro ao carregar empresas:', err);
        setError('Erro ao carregar lista de empresas');
        toast.error('Erro ao carregar empresas');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [search, companies]);

  const handleSelectCompany = (companyId: string) => {
    navigate(`/admin/dashboard/empresas/${companyId}`);
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-500">Carregando empresas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showBack={false}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Maturidade</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecione uma empresa para visualizar o dashboard de maturidade
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {search ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
                onClick={() => handleSelectCompany(company.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-xs text-gray-500">
                          {company.totalControls} controles · {company.totalUsers} usuários
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(company.completionRate)}`}>
                      {company.completionRate}%
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        company.completionRate >= 70 ? 'bg-emerald-500' :
                        company.completionRate >= 40 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${company.completionRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>{company.totalUsers}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>{company.totalControls}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(company.completionRate)}`}>
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{company.completionRate}% concluído</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats summary */}
        {companies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              <p className="text-xs text-gray-500">Empresas</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((acc, c) => acc + c.totalControls, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Controles</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((acc, c) => acc + c.totalUsers, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Usuários</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
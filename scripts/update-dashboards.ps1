# scripts/update-dashboards.ps1
# Script para atualizar as páginas de dashboard do frontend

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores para output
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

function Write-StepDetail {
    param($Message)
    Write-Host "  → $Message" -ForegroundColor $Colors.Step
}

# ============================================
# PARTE 3/4: ATUALIZAR DASHBOARDS
# ============================================
Write-Step "PARTE 3/4: ATUALIZANDO PÁGINAS DE DASHBOARD"

# 1. UserDashboard
Write-Info "Atualizando UserDashboard.tsx..."
@'
// frontend/src/pages/UserDashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { LayoutDashboard, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  // Dados mockados para demonstração
  const stats = {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, {user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus controles atribuídos e acompanhe seu progresso
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Controles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Em Andamento</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls List */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Controles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum controle atribuído ainda.</p>
              <p className="text-sm">Aguarde a atribuição do seu preposto.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\UserDashboard.tsx" -Encoding UTF8
Write-Success "UserDashboard.tsx atualizado"

# 2. RepDashboard
Write-Info "Atualizando RepDashboard.tsx..."
@'
// frontend/src/pages/RepDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  LayoutDashboard, Users, ClipboardList, Plus, Search, 
  Mail, UserPlus, Trash2, Edit, CheckCircle, Clock, AlertCircle,
  BarChart3, Download, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';

export const RepDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'controls' | 'reports'>('users');

  // Dados mockados para demonstração
  const users = [
    { id: '1', name: 'João Silva', email: 'joao@empresa.com', role: 'user', status: 'active' },
    { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: 'user', status: 'active' },
  ];

  const stats = {
    totalUsers: 12,
    activeUsers: 10,
    assignedControls: 45,
    completedControls: 28,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Preposto: {user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0) || 'R'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Preposto</h1>
            <p className="text-gray-600 mt-1">
              Gerencie usuários e atribua controles da ISO 27001
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setActiveTab('users')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('controls')}>
              <Plus className="h-4 w-4 mr-2" />
              Atribuir Controles
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Controles Atribuídos</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.assignedControls}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Controles Concluídos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedControls}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Usuários
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'controls'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('controls')}
          >
            <ClipboardList className="h-4 w-4 inline mr-2" />
            Controles
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Relatórios
          </button>
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Usuários Cadastrados</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Novo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Usuário
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ativo
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                              <ClipboardList className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'controls' && (
          <Card>
            <CardHeader>
              <CardTitle>Atribuição de Controles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Selecione um usuário para atribuir controles.</p>
                <p className="text-sm">Os 93 controles da ISO 27001 serão distribuídos de forma inteligente.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Relatórios de Maturidade</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Relatórios serão gerados aqui.</p>
                <p className="text-sm">Acompanhe o progresso da sua equipe.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\RepDashboard.tsx" -Encoding UTF8
Write-Success "RepDashboard.tsx atualizado"

# 3. AdminDashboard
Write-Info "Atualizando AdminDashboard.tsx..."
@'
// frontend/src/pages/AdminDashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  LayoutDashboard, Users, Settings, Shield, 
  BarChart3, Database, Activity, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = {
    totalUsers: 25,
    activeUsers: 22,
    totalControls: 93,
    completedAssessments: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
            <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-1">
            Gerencie toda a plataforma Code_Assessment
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Controles ISO 27001</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalControls}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avaliações Concluídas</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.completedAssessments}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gerenciar Usuários</h3>
                  <p className="text-sm text-gray-500">Cadastrar, editar e remover usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Controles</h3>
                  <p className="text-sm text-gray-500">Gerenciar os 93 controles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Configurações</h3>
                  <p className="text-sm text-gray-500">Configurações do sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Backend</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-sm text-green-600">Operacional</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Frontend</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-sm text-green-600">Operacional</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">MongoDB Atlas</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-sm text-green-600">Conectado</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Última atualização</span>
                <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminDashboard.tsx" -Encoding UTF8
Write-Success "AdminDashboard.tsx atualizado"

# 4. ConsultantDashboard
Write-Info "Atualizando ConsultantDashboard.tsx..."
@'
// frontend/src/pages/ConsultantDashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  LayoutDashboard, BarChart3, FileText, Users,
  TrendingUp, TrendingDown, PieChart, Download, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';

export const ConsultantDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Consultor: {user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0) || 'C'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Consultor</h1>
            <p className="text-gray-600 mt-1">
              Análise e relatórios de maturidade em Segurança da Informação
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Maturidade Geral</p>
                  <p className="text-3xl font-bold text-primary-600">65%</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <PieChart className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Controles Implementados</p>
                  <p className="text-3xl font-bold text-green-600">32/93</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">↑ 12% vs último mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ações Recomendadas</p>
                  <p className="text-3xl font-bold text-yellow-600">18</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Prioridade: 8 críticas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Domínio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Organizacional</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Pessoas</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Físico</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tecnológico</span>
                    <span className="font-medium">55%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="p-1 bg-red-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Política de Segurança</p>
                    <p className="text-xs text-gray-600">PSI não aprovada pela alta direção</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="p-1 bg-yellow-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Gestão de Incidentes</p>
                    <p className="text-xs text-gray-600">Plano de resposta não documentado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="p-1 bg-yellow-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Controle de Acesso</p>
                    <p className="text-xs text-gray-600">Revisão de acessos não realizada</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\ConsultantDashboard.tsx" -Encoding UTF8
Write-Success "ConsultantDashboard.tsx atualizado"

# 5. ProfilePage
Write-Info "Atualizando ProfilePage.tsx..."
@'
// frontend/src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { User, Mail, Building, Shield, Lock } from 'lucide-react';
import { getRoleLabel, getRoleColor } from '../utils/helpers.js';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  company: z.string().optional(),
  department: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      company: user?.company || '',
      department: user?.department || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      const updateData: any = {
        name: data.name,
        company: data.company,
        department: data.department,
      };
      if (data.currentPassword && data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      await updateProfile(updateData);
      setShowPasswordFields(false);
      reset({ ...data, currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || 'user')}`}>
                    {getRoleLabel(user?.role || 'user')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nome completo"
                  icon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  value={user?.email}
                  disabled
                  icon={<Mail className="h-4 w-4" />}
                  className="bg-gray-50"
                />
                <Input
                  label="Empresa"
                  icon={<Building className="h-4 w-4" />}
                  error={errors.company?.message}
                  {...register('company')}
                />
                <Input
                  label="Departamento"
                  icon={<Building className="h-4 w-4" />}
                  error={errors.department?.message}
                  {...register('department')}
                />

                {/* Password Change Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {showPasswordFields ? 'Cancelar alteração de senha' : 'Alterar senha'}
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
                    <Input
                      label="Senha atual"
                      type="password"
                      placeholder="••••••••"
                      error={errors.currentPassword?.message}
                      {...register('currentPassword')}
                    />
                    <Input
                      label="Nova senha"
                      type="password"
                      placeholder="••••••••"
                      error={errors.newPassword?.message}
                      {...register('newPassword')}
                    />
                    <Input
                      label="Confirmar nova senha"
                      type="password"
                      placeholder="••••••••"
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" loading={isLoading}>
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\ProfilePage.tsx" -Encoding UTF8
Write-Success "ProfilePage.tsx atualizado"

# ============================================
# RESUMO FINAL
# ============================================
Write-Step "✅ DASHBOARDS ATUALIZADOS COM SUCESSO!"

Write-Success "Todas as páginas de dashboard foram atualizadas!"
Write-Info "Páginas atualizadas:"
Write-Info "  • UserDashboard.tsx - Painel do usuário"
Write-Info "  • RepDashboard.tsx - Painel do preposto"
Write-Info "  • AdminDashboard.tsx - Painel administrativo"
Write-Info "  • ConsultantDashboard.tsx - Painel do consultor"
Write-Info "  • ProfilePage.tsx - Página de perfil"

Write-Info "Para ver as mudanças:"
Write-Info "  O servidor frontend deve recarregar automaticamente"
Write-Info "  Acesse: http://localhost:5173"

Write-Success "🎉 Parte 3/4 concluída com sucesso!"
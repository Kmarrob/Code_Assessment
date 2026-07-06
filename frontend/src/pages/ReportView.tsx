// frontend/src/pages/ReportView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { reportService } from '../services/report.service.js';
import { Report, ReportStats } from '../types/report.js';
import {
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Building2,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Printer,
  UserCircle,
  Mail,
  Briefcase,
  RefreshCw,
  ChevronRight,
  Shield,
  Award,
  Target,
  ListChecks,
  BarChart3,
  TrendingUp,
  Layers,
  Rocket,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GitBranch,
  Cpu,
  Zap,
  Lock,
  Eye as EyeIcon,
  Database,
  Server,
  Globe,
  Smartphone,
  Network,
  Cloud,
  Users as UsersIcon,
  ShieldCheck,
  Fingerprint,
  Key,
  AlertOctagon,
  RefreshCw as RefreshIcon,
  Activity,
  Link,
  CheckSquare,
  XCircle,
  HelpCircle,
  Check,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';

export const ReportView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cover: true,
    quemSomos: true,
    apresentacao: true,
    indice: true,
    objetivo: true,
    beneficios: true,
    equipe: true,
    metodologia: true,
    atributos: true,
    recomendacoes: true,
  });
  const [formData, setFormData] = useState({
    projectNumber: '',
    scope: '',
  });

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getDashboard();
      setReport(data.report);
      setStats(data.stats);
      setFormData({
        projectNumber: data.report.projectNumber || '',
        scope: data.report.scope || '',
      });
    } catch (err: any) {
      console.error('Erro ao carregar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao carregar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleGenerate = async () => {
    if (!report) return;
    setIsGenerating(true);
    try {
      const updated = await reportService.generateReport(report.companyId);
      setReport(updated);
      setFormData({
        projectNumber: updated.projectNumber || '',
        scope: updated.scope || '',
      });
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao gerar dados do relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    try {
      const updated = await reportService.updateReport(report.companyId, {
        projectNumber: formData.projectNumber,
        scope: formData.scope,
      });
      setReport(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erro ao salvar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao salvar relatório');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateFull = (date?: Date | string) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      draft: { label: 'Rascunho', color: 'text-gray-500' },
      in_review: { label: 'Em Revisão', color: 'text-yellow-600' },
      finalized: { label: 'Finalizado', color: 'text-green-600' },
      archived: { label: 'Arquivado', color: 'text-gray-400' },
    };
    return labels[status] || { label: status, color: 'text-gray-500' };
  };

  const getCompanyName = () => {
    const company = (report as any)?.companyId as any;
    return company?.name || 'NOME DO CLIENTE';
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum relatório encontrado</p>
          <Button onClick={handleGenerate} className="mt-4">
            Gerar relatório
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(report.status);
  const companyName = getCompanyName();

  // ============================================
  // RENDER PRINT MODE / VIEW MODE
  // ============================================
  if (isPrintMode) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto print:p-0">
        {/* Capa */}
        <div className="text-center py-16 border-b border-gray-200">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
              <Building2 className="h-12 w-12" />
              <span className="sr-only">Logo do cliente</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Inserir Logo do cliente</p>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Consultoria para avaliação de maturidade ABNT NBR ISO 27001:2022
          </h1>
          <p className="text-gray-600 mt-4">Recomendações</p>
          <p className="text-gray-500 text-sm mt-2">{formatDateFull(new Date())}</p>
          <p className="text-gray-500 text-sm mt-1">
            {report.projectNumber || 'Nº do projeto não definido'} - {companyName} - {report.scope || 'Escopo não definido'}
          </p>
        </div>

        {/* Quem Somos */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quem Somos</h2>
          <p className="text-gray-700 text-justify">
            "O nosso negócio é segurança da informação, infraestrutura de TI, GRC e computação na nuvem"
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
            Clique para adicionar texto
          </div>
        </div>

        {/* Apresentação */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Apresentação</h2>
          <p className="text-gray-700 text-justify">
            A MRS Consultoria, empresa especializada em soluções de segurança, e tecnologia da informação, 
            apresenta relatório de maturidade referente à ABNT NBR ISO 27001:2022.
          </p>
          <p className="text-gray-700 text-justify mt-4">
            Agradecemos esta oportunidade e nos colocamos a disposição para contribuir de forma plena com 
            os objetivos e metas da <strong>{companyName}</strong>. Da mesma maneira, estamos à disposição 
            para sanar quaisquer dúvidas decorrentes desta, ou em relação aos demais serviços oferecidos 
            em nossas áreas de atuação que também podem ser obtidas por meio de nosso endereço virtual 
            <a href="http://www.cisatool.com.br" className="text-blue-600 hover:underline ml-1">
              http://www.cisatool.com.br
            </a>
          </p>
          <p className="text-gray-600 italic text-justify mt-4">
            "O nosso negócio é segurança da informação, infraestrutura de TI, GRC e computação na nuvem"
          </p>
        </div>

        {/* Índice */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Índice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">1. Objetivo</span>
              <span className="text-gray-400 text-sm">2</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">2. Benefícios da ISO 27001</span>
              <span className="text-gray-400 text-sm">3</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">3. Equipe</span>
              <span className="text-gray-400 text-sm">4</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">4. Metodologia de Avaliação</span>
              <span className="text-gray-400 text-sm">5</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">5. Atributos</span>
              <span className="text-gray-400 text-sm">6</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">6. Recomendações</span>
              <span className="text-gray-400 text-sm">7</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">7. Resultados da Avaliação</span>
              <span className="text-gray-400 text-sm">8</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">8. Cenário atual e Recomendações</span>
              <span className="text-gray-400 text-sm">9</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">9. Matriz de Priorização</span>
              <span className="text-gray-400 text-sm">10</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">10. Roadmap de Implementação</span>
              <span className="text-gray-400 text-sm">11</span>
            </div>
          </div>
        </div>

        {/* Objetivo */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Objetivo</h2>
          <p className="text-gray-700 text-justify">
            Apresentar análises e resultados oriundos da avaliação de maturidade do ambiente da{' '}
            <strong>{companyName}</strong>, identificando lacunas que impactam na sua maturidade, 
            propondo recomendações de melhorias técnicas e processuais que precisam ser implementadas 
            para elevação do nível de segurança. Através deste documento, a empresa terá um material 
            que auxiliará na melhoria contínua do SGSI – Sistema de Gestão de Segurança da Informação, 
            visando otimizar a segurança da informação em seus processos, recursos e pessoas.
          </p>
          <p className="text-gray-700 text-justify mt-4">
            Os trabalhos foram baseados nas entrevistas realizadas no período de{' '}
            <strong>{formatDateFull(report.assessmentStartDate)}</strong> a{' '}
            <strong>{formatDateFull(report.assessmentEndDate)}</strong>, bem como informações 
            complementares recebidas por e-mail no dia <strong>{formatDateFull(report.assessmentEndDate)}</strong>. 
            Após avaliação do ambiente, foram elaboradas recomendações do nível desejado para a organização, 
            que poderão ser aplicadas aos diversos tipos de ameaças identificadas.
          </p>
          <p className="text-gray-600 italic text-justify mt-4 text-sm">
            Ressaltamos que não foram realizadas análises de evidências e que todos os insumos gerados 
            neste documento são oriundos do questionário baseado nos controles da ABNT NBR ISO/IEC 27001:2022, 
            Anexo A, respondido pela <strong>{companyName}</strong>.
          </p>
        </div>

        {/* Benefícios da ISO 27001 */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. Benefícios da ISO 27001</h2>
          <p className="text-gray-700 text-justify">
            A ABNT NBR ISO 27001 é uma norma internacional de padrão e referência para a gestão de 
            segurança da informação na empresa. Por meio dela será desenvolvido um Sistema de Gestão 
            de Segurança da Informação (SGSI) que permitirá à empresa ter um melhor conhecimento dos 
            seus processos, atividades, sistemas, ambientes e pessoas que possam impactar na segurança 
            da informação, assim como os aprimoramentos sobre os processos de gestão permitindo uma 
            melhoria contínua.
          </p>
          <p className="text-gray-700 text-justify mt-4">
            Será possível identificar por meio da matriz de priorização, anexo deste documento, quais 
            são as ameaças e vulnerabilidades identificadas relacionadas aos controles da ISO, 
            classificando os controles de crítico até o mais baixo, relacionando as medidas tecnológicas 
            e processuais para uma mitigação efetiva.
          </p>
          <p className="text-gray-700 text-justify mt-4">
            Caso a <strong>{companyName}</strong> busque futuramente uma certificação nessa norma, 
            a empresa terá uma maior credibilidade e confiabilidade na entrega dos serviços prestados, 
            por utilizar a segurança da informação em todas as etapas do negócio, aumentando a satisfação 
            dos seus clientes e parceiros comerciais, além de também ter uma expansão dos seus clientes 
            e uma maior vantagem competitiva sobre as empresas concorrentes. Pela ISO 27001 ser uma 
            norma internacionalmente reconhecida e adotada por vários países como uma garantia do uso 
            da segurança da informação, é possível assegurar que a empresa estará em conformidade com 
            as obrigações legais e contratuais relacionadas à segurança da informação.
          </p>
        </div>

        {/* Equipe */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. Equipe</h2>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">{companyName}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-4 font-medium text-gray-500 border border-gray-200">Nome</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500 border border-gray-200">Designação</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500 border border-gray-200">Contato</th>
                </tr>
              </thead>
              <tbody>
                {report.clientTeam.length === 0 ? (
                  <tr>
                    <td className="py-2 px-4 border border-gray-200 text-gray-500 text-center" colSpan={3}>
                      Nenhum membro cadastrado
                    </td>
                  </tr>
                ) : (
                  report.clientTeam.map((member, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 border border-gray-200">{member.name}</td>
                      <td className="py-2 px-4 border border-gray-200">{member.role}</td>
                      <td className="py-2 px-4 border border-gray-200">{member.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">ISH</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-4 font-medium text-gray-500 border border-gray-200">Nome</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500 border border-gray-200">Designação</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500 border border-gray-200">Contato</th>
                </tr>
              </thead>
              <tbody>
                {report.consultantTeam.length === 0 ? (
                  <tr>
                    <td className="py-2 px-4 border border-gray-200 text-gray-500 text-center" colSpan={3}>
                      Nenhum consultor vinculado
                    </td>
                  </tr>
                ) : (
                  report.consultantTeam.map((member, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 border border-gray-200">{member.name}</td>
                      <td className="py-2 px-4 border border-gray-200">{member.role}</td>
                      <td className="py-2 px-4 border border-gray-200">{member.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Metodologia de Avaliação */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. Metodologia de Avaliação</h2>
          
          <p className="text-gray-700 text-justify mb-6">
            Com estrutura mais simples e controles contemporâneos, a ABNT NBR ISO/IEC 27001:2022, tem uma visão holística e coordenada dos riscos de segurança da informação das organizações (SGSI), a fim de determinar e implementar um conjunto abrangente de controles na estrutura geral de um sistema de gestão coerente. Deste modo, é possível direcionar a análise/avaliação de riscos, gerenciamento, especificação, reavaliação e implementação de segurança na <strong>{companyName}</strong>.
          </p>
          
          <p className="text-gray-700 text-justify mb-6">
            É composta por 93 controles agrupados em 4 temas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Controles Organizacionais</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Referentes a forma com qual organização estrutura ações estratégicas, relacionadas à Gestão da Segurança da Informação, com abrangência institucional ou perante partes externas. Aqui também se incluem todos os controles que não se encaixam nas demais categorias.</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Controles de Pessoas</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Referentes a pessoas individuais, como a organização aborda aspectos de Segurança da Informação, aliada à segurança jurídica, durante o ciclo de vida do colaborador na empresa.</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Controles Físicos</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Aspectos de segurança física, predial e ambiental da organização que impactam direta ou indiretamente na Segurança da Informação.</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Controles Tecnológicos</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Referentes diretamente a tecnologia, ações e mecanismos de Segurança da Informação aplicados a recursos computacionais, sistemas e redes, repositório de dados, etc.</p>
            </div>
          </div>

          {/* Tabela de Níveis de Maturidade */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Níveis de Maturidade</h3>
          <p className="text-gray-700 text-justify mb-4">
            A avaliação de maturidade é baseada nos níveis mostrados abaixo. Eles fornecem a descrição sobre as práticas que a empresa possui no que tange a existência de processos de Segurança da Informação.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 border border-gray-300 w-16">NÍVEL</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 border border-gray-300 w-32">MATURIDADE</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 border border-gray-300">DESCRIÇÃO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 border border-gray-300 text-center font-mono">N/A</td>
                  <td className="py-3 px-4 border border-gray-300">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-700">NÃO SE APLICA</span>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 text-gray-600">CONTROLE NÃO APLICÁVEL À ORGANIZAÇÃO</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="py-3 px-4 border border-gray-300 text-center font-mono font-bold text-red-600">0</td>
                  <td className="py-3 px-4 border border-gray-300">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">NÃO IMPLEMENTADO</span>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 text-gray-600">FALTA DE UM PROCESSO RECONHECIDO.</td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-3 px-4 border border-gray-300 text-center font-mono font-bold text-yellow-600">1</td>
                  <td className="py-3 px-4 border border-gray-300">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">PARCIAL</span>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 text-gray-600">JÁ ESTÁ EM APLICAÇÃO PARTES DOS CONTROLES NA INSTITUIÇÃO, MAS HÁ QUESTÕES QUE PRECISAM SER TRABALHADAS.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="py-3 px-4 border border-gray-300 text-center font-mono font-bold text-green-600">2</td>
                  <td className="py-3 px-4 border border-gray-300">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">IMPLEMENTADO</span>
                  </td>
                  <td className="py-3 px-4 border border-gray-300 text-gray-600">OS PROCESSOS FORAM REFINADOS A UM NÍVEL DE BOAS PRÁTICAS, RESULTADO DE UM CONTÍNUO APRIMORAMENTO E MODELAGEM DA MATURIDADE EM SEGURANÇA DA INFORMAÇÃO.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Atributos */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. Atributos</h2>
          
          <p className="text-gray-700 text-justify mb-6">
            De forma complementar, a ABNT NBR ISO/IEC 27002:2022 possibilitou a análise dos controles à luz de 05 (cinco) atributos: 1) tipo de controle; 2) propriedades de segurança da informação; 3) conceitos de segurança cibernética; 4) capacidades operacionais; 5) domínios de segurança.
          </p>

          {/* 5.1 Tipo de Controle */}
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 Tipo de Controle</h3>
          <p className="text-gray-700 text-justify mb-3">
            Atributo utilizado para fornecer uma visão dos controles na perspectiva de quando e como uma medida altera o risco relacionado com a ocorrência de um incidente de segurança da informação. Assim, o controle poderá variar entre:
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" /> Preventivo
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              <EyeIcon className="h-4 w-4" /> Detectivo
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <RefreshIcon className="h-4 w-4" /> Corretivo
            </span>
          </div>

          {/* 5.2 Propriedades de SI */}
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 Propriedades de Segurança da Informação</h3>
          <p className="text-gray-700 text-justify mb-3">
            Atributo para visualizar controles na perspectiva de qual característica das informações o controle contribuirá para a preservação. Os valores dos atributos consistem em:
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <Lock className="h-4 w-4" /> Confidencialidade
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <CheckSquare className="h-4 w-4" /> Integridade
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Activity className="h-4 w-4" /> Disponibilidade
            </span>
          </div>

          {/* 5.3 Conceitos de Segurança Cibernética */}
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.3 Conceitos de Segurança Cibernética</h3>
          <p className="text-gray-700 text-justify mb-3">
            Atributo para visualizar os controles sob a perspectiva da associação de controles aos conceitos de segurança cibernética definidos no quadro de segurança cibernética descrito no ISO/IEC TS 27110. Os valores dos atributos consistem em:
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              <Target className="h-4 w-4" /> Identificar
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <ShieldCheck className="h-4 w-4" /> Proteger
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              <EyeIcon className="h-4 w-4" /> Detectar
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <AlertOctagon className="h-4 w-4" /> Responder
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <RefreshIcon className="h-4 w-4" /> Recuperar
            </span>
          </div>

          {/* 5.4 Capacidades Operacionais */}
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.4 Capacidades Operacionais</h3>
          <p className="text-gray-700 text-justify mb-3">
            As capacidades operacionais são atributos para visualizar controles da perspectiva do praticante sobre os recursos de segurança da informação. Os valores de atributos consistem em:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Governança, Gestão de identidade e acesso</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Gestão de ameaças e vulnerabilidades</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Garantia de segurança da informação</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Gestão de eventos de segurança da informação</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Gestão de ativos</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Proteção da informação</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Legal e compliance</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Segurança física</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Configuração segura</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Segurança em recursos humanos</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Segurança de sistemas e redes</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Segurança de aplicações</span>
            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Segurança do relacionamento na cadeia de suprimentos</span>
          </div>

          {/* 5.5 Domínios de Segurança */}
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.5 Domínios de Segurança</h3>
          <p className="text-gray-700 text-justify mb-3">
            Os domínios de segurança são um atributo para visualizar controles na perspectiva de 4 domínios de SI:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-indigo-800">Governança e Ecossistema</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Inclui "Governança do Sistema de Segurança da Informação e Gestão de Riscos" e "Gestão de segurança cibernética do ecossistema" (partes interessadas internas e externas).</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Proteção</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Inclui "Arquitetura de Segurança de TI", "Administração de Segurança de TI", "Gestão de identidade e acesso", "Manutenção de Segurança de TI" e "Segurança física e ambiental".</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Defesa</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Inclui "Detectar" e "Gestão de Incidente de segurança computacional".</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshIcon className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Resiliência</span>
              </div>
              <p className="text-sm text-gray-600 text-justify">Inclui "Operações de continuidade" e "Gestão de crises".</p>
            </div>
          </div>
        </div>

        {/* 6. Recomendações */}
        <div className="py-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">6. Recomendações</h2>
          
          <p className="text-gray-700 text-justify mb-4">
            As recomendações propostas neste relatório são oriundas da norma <strong>ISO/IEC 27002:2022</strong> que fornecem um conjunto abrangente de controles de segurança da informação comumente utilizados, incluindo orientação para implementação desses controles em uma organização.
          </p>
          
          <p className="text-gray-700 text-justify mb-4">
            A norma <strong>ISO/IEC 27002:2022</strong> é complementar à norma <strong>ISO/IEC 27001</strong> e totalmente indispensável à sua aplicação. Enquanto a norma ISO/IEC 27001 estabelece os requisitos para implementação de um Sistema de Gestão da Segurança da Informação (SGSI), a norma fornece um conjunto de controles genéricos de segurança da informação, além da ISO/IEC 27002:2022 fornecer orientação para implementação de controles de segurança da informação.
          </p>
          
          <p className="text-gray-700 text-justify">
            A norma <strong>ISO/IEC 27002:2022</strong> foi concebida para ser usada pelas organizações:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 text-justify">
            <li>no contexto de um sistema de gestão de segurança da informação (SGSI) baseado na ISO/IEC 27001;</li>
            <li>para a implementação de controles de segurança da informação com base em melhores práticas reconhecidas internacionalmente;</li>
            <li>para o desenvolvimento de diretrizes específicas de gestão de segurança da informação da organização.</li>
          </ul>
        </div>

        {/* Botão para sair do modo de impressão */}
        <div className="text-center py-8 print:hidden">
          <Button onClick={() => setIsPrintMode(false)}>
            Voltar para visualização
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER VISUALIZAÇÃO NORMAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho da página */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Relatório de Recomendações</h1>
                <p className="text-sm text-gray-500">
                  {report.projectNumber || 'Nº do projeto não definido'} · {report.scope || 'Escopo não definido'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm font-medium ${status.color}`}>
                Status: {status.label}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Gerando...' : 'Atualizar Dados'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsPrintMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Relatório
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
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
                  <p className="text-sm text-gray-500">Controles Avaliados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalResponses || 0}</p>
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
                  <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Período do Assessment</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(report.assessmentStartDate)} - {formatDate(report.assessmentEndDate)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de edição do relatório */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações do Projeto</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.projectNumber}
                    onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: P-2026-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escopo do Projeto
                  </label>
                  <textarea
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva o escopo do projeto..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Número do Projeto</p>
                  <p className="font-medium">{report.projectNumber || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-gray-100`}>
                    {status.label}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Escopo do Projeto</p>
                  <p className="font-medium">{report.scope || 'Não definido'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visualização rápida das seções do relatório */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Relatório</CardTitle>
            <p className="text-sm text-gray-500">
              Clique em "Visualizar Relatório" para ver o documento completo no formato do template
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { id: 'cover', label: 'Capa', icon: FileText },
                { id: 'quemSomos', label: 'Quem Somos', icon: Users },
                { id: 'apresentacao', label: 'Apresentação', icon: FileText },
                { id: 'indice', label: 'Índice', icon: ListChecks },
                { id: 'objetivo', label: '1. Objetivo', icon: Target },
                { id: 'beneficios', label: '2. Benefícios da ISO 27001', icon: Award },
                { id: 'equipe', label: '3. Equipe', icon: Users },
                { id: 'metodologia', label: '4. Metodologia de Avaliação', icon: BookOpen },
                { id: 'atributos', label: '5. Atributos', icon: Layers },
                { id: 'recomendacoes', label: '6. Recomendações', icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => toggleSection(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    {expandedSections[item.id] ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
              <Button
                className="w-full mt-4"
                onClick={() => setIsPrintMode(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Relatório Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportView;
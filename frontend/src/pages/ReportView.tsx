// frontend/src/pages/ReportView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { reportService } from '../services/report.service.js';
import { recommendationService } from '../services/recommendation.service.js';
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
  Lightbulb,
  Wrench,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { RadarChart } from '../components/dashboard/RadarChart.js';

export const ReportView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams<{ companyId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [resultados, setResultados] = useState<any>(null);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [matrizPriorizacao, setMatrizPriorizacao] = useState<any[]>([]);
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
    resultados: true,
    cenarioAtual: true,
  });
  const [formData, setFormData] = useState({
    projectNumber: '',
    scope: '',
  });

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrintMode(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const companyIdFromUrl = params.companyId;
      
      let data;
      
      if (companyIdFromUrl) {
        data = await reportService.getAdminDashboard(companyIdFromUrl);
      } else {
        data = await reportService.getDashboard();
      }
      
      setReport(data.report);
      setStats(data.stats);
      setResultados(data.resultados || null);
      setFormData({
        projectNumber: data.report.projectNumber || '',
        scope: data.report.scope || '',
      });

      const companyId = data.report.companyId?._id || data.report.companyId;
      if (companyId && typeof companyId === 'string') {
        try {
          const recs = await recommendationService.getRecommendationsForReport(companyId);
          setRecomendacoes(recs || []);
        } catch (recErr) {
          console.error('Erro ao carregar recomendações:', recErr);
          setRecomendacoes([]);
        }

        try {
          const matrixData = await reportService.getPriorizationMatrix(companyId);
          setMatrizPriorizacao(matrixData || []);
        } catch (matrixErr) {
          console.error('Erro ao carregar matriz de priorização:', matrixErr);
          setMatrizPriorizacao([]);
        }
      }
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
      await loadData();
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.response?.data?.message || 'Erro ao gerar dados do relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    // Mantido por compatibilidade contratual e histórico da v22
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

  const isAdmin = user?.role === 'admin';

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

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

  if (isPrintMode) {
    return (
      <>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 20mm 15mm 20mm 15mm;
            }
            html, body {
              background: #ffffff !important;
              color: #1e293b !important;
              width: 100%;
              margin: 0 !important;
              padding: 0 !important;
            }
            body, p, li, td, th, span, div {
              font-family: Arial, sans-serif !important;
              font-size: 10.5pt !important;
            }
            .print-container {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .print-content {
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            h1 { font-size: 20pt !important; line-height: 1.3 !important; font-weight: bold !important; margin-bottom: 12pt !important; color: #0f172a !important; }
            h2 { font-size: 14pt !important; font-weight: bold !important; margin-top: 14pt !important; margin-bottom: 8pt !important; color: #1e3a8a !important; page-break-after: avoid; break-after: avoid; }
            h3 { font-size: 12pt !important; font-weight: bold !important; margin-top: 12pt !important; margin-bottom: 6pt !important; color: #0f172a !important; page-break-after: avoid; break-after: avoid; }
            h4 { font-size: 10.5pt !important; font-weight: bold !important; margin-top: 10pt !important; margin-bottom: 4pt !important; color: #1e293b !important; page-break-after: avoid; break-after: avoid; }
            
            .grid-cols-1.md\\:grid-cols-2 {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 12px !important;
            }
            .grid-cols-2.md\\:grid-cols-4 {
              display: grid !important;
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              gap: 12px !important;
            }

            svg, svg.h-4, svg.h-3.5, svg.h-10 {
              width: 18px !important;
              height: 18px !important;
              max-width: 18px !important;
              max-height: 18px !important;
              display: inline-block !important;
              vertical-align: middle !important;
            }
            
            .w-28 svg {
              width: 40px !important;
              height: 40px !important;
              max-width: 40px !important;
              max-height: 40px !important;
            }

            .page-break {
              page-break-before: always !important;
              break-before: always !important;
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
            table, tr, img, .mb-6 {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .py-6, .py-8 {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            .mb-8 { margin-bottom: 0.6rem !important; }
            .mb-4, .mb-6 { margin-bottom: 0.4rem !important; }
            
            .recharts-responsive-container, .recharts-wrapper {
              width: 100% !important;
              max-width: 520px !important;
              height: 320px !important;
              margin: 0 auto !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .recharts-responsive-container svg {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
            }
            .recharts-polygon, .recharts-radar-polygon, .recharts-layer path {
              fill-opacity: 0.2 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .recharts-text, .recharts-label {
              fill: #334155 !important;
              font-size: 7.5pt !important;
              font-weight: 500 !important;
            }
            
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-top: 4pt !important;
              margin-bottom: 8pt !important;
            }
            th, td {
              border: 1px solid #cbd5e1 !important;
              padding: 5pt 7pt !important;
              text-align: left !important;
            }
            th {
              font-weight: bold !important;
              background-color: #f1f5f9 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .status-nao-implementado {
              color: #dc2626 !important;
              font-weight: bold !important;
            }
            .status-parcial {
              color: #d97706 !important;
              font-weight: bold !important;
            }
            .status-implementado {
              color: #16a34a !important;
              font-weight: bold !important;
            }

            .no-print { display: none !important; }
            a { text-decoration: none !important; color: #1e3a8a !important; }

            .custom-print-header {
              position: fixed !important;
              top: -15mm !important;
              left: 0 !important;
              right: 0 !important;
              height: 15mm !important;
              border-bottom: 1px solid #e2e8f0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              padding-bottom: 4px !important;
            }
            .custom-print-header .logo-text-blue {
              color: #2563eb !important;
              font-weight: bold !important;
              font-size: 11pt !important;
            }
            .custom-print-header .logo-text-gray {
              color: #475569 !important;
              font-weight: bold !important;
              font-size: 11pt !important;
            }
            .custom-print-header .user-info {
              font-size: 8.5pt !important;
              color: #64748b !important;
              text-align: right !important;
              line-height: 1.3 !important;
            }

            .custom-print-footer {
              position: fixed !important;
              bottom: -15mm !important;
              left: 0 !important;
              right: 0 !important;
              height: 12mm !important;
              border-top: 1px solid #e2e8f0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              padding-top: 4px !important;
              font-size: 8.5pt !important;
              color: #64748b !important;
            }
          }

          @media screen {
            .custom-print-header, .custom-print-footer {
              display: none !important;
            }
          }
        `}</style>
        
        <div className="custom-print-header">
          <div>
            <span className="logo-text-blue">Code</span>
            <span className="logo-text-gray">_Assessment</span>
          </div>
          <div className="user-info">
            Emitido por: {user?.name || 'Consultor Técnico'}<br />
            {user?.email || ''}
          </div>
        </div>

        <div className="custom-print-footer">
          <div>Sistema de Gestão de Conformidade e Segurança · code_assessment</div>
          <div>MRS Consultoria</div>
        </div>

        <div className="bg-white p-8 max-w-4xl mx-auto print:p-0 print-container">
          <div className="print-content">
            <div className="print:hidden mb-4 flex items-center justify-between no-print">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                onClick={() => setIsPrintMode(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir / PDF
              </Button>
            </div>

            {/* Capa */}
            <div className="text-center py-12 min-h-[75vh] flex flex-col justify-center items-center">
              <div className="mb-6">
                <div className="w-28 h-28 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                  <Building2 className="h-10 w-10" />
                  <span className="sr-only">Logo do cliente</span>
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center print:hidden">Inserir Logo do cliente</p>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Consultoria para avaliação de maturidade ABNT NBR ISO 27001:2022
              </h1>
              <p className="text-gray-600 mt-3 text-center font-medium">Recomendações</p>
              <p className="text-gray-500 text-sm mt-1 text-center">{formatDateFull(new Date())}</p>
              <p className="text-gray-500 text-sm mt-3 text-center max-w-xl">
                {report.projectNumber || 'Nº do projeto não definido'} - {companyName} - {report.scope || 'Escopo não definido'}
              </p>
            </div>

            {/* Quem Somos */}
            <div className="py-6 border-b border-gray-200 page-break">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Quem Somos</h2>
              <p className="text-gray-700 text-justify italic">
                "O nosso negócio é segurança da informação, infraestrutura de TI, GRC e computação na nuvem"
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-400 no-print">
                Clique para adicionar texto
              </div>
            </div>

            {/* Apresentação */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Apresentação</h2>
              <p className="text-gray-700 text-justify">
                A MRS Consultoria, empresa especializada em soluções de segurança, e tecnologia da informação, 
                apresenta relatório de maturidade referente à ABNT NBR ISO 27001:2022.
              </p>
              <p className="text-gray-700 text-justify mt-3">
                Agradecemos esta oportunidade e nos colocamos a disposição para contribuir de forma plena com 
                os objetivos e metas da <strong>{companyName}</strong>. Da mesma maneira, estamos à disposição 
                para sanar quaisquer dúvidas decorrentes desta, ou em relação aos demais serviços oferecidos 
                em nossas áreas de atuação que também podem ser obtidas por meio de nosso endereço virtual{' '}
                <a href="http://www.cisatool.com.br" className="text-blue-600 hover:underline ml-1">
                  http://www.cisatool.com.br
                </a>
              </p>
              <p className="text-gray-600 italic text-justify mt-3 text-sm">
                "O nosso negócio é segurança da informação, infraestrutura de TI, GRC e computação na nuvem"
              </p>
            </div>

            {/* Índice */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Índice</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">1. Objetivo</span>
                  <span className="text-gray-400 text-sm">2</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">2. Benefícios da ISO 27001</span>
                  <span className="text-gray-400 text-sm">3</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">3. Equipe</span>
                  <span className="text-gray-400 text-sm">4</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">4. Metodologia de Avaliação</span>
                  <span className="text-gray-400 text-sm">5</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">5. Atributos</span>
                  <span className="text-gray-400 text-sm">6</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">6. Recomendações</span>
                  <span className="text-gray-400 text-sm">7</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">7. Resultados da Avaliação</span>
                  <span className="text-gray-400 text-sm">8</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">8. Cenário atual e Recomendações</span>
                  <span className="text-gray-400 text-sm">9</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">9. Matriz de Priorização</span>
                  <span className="text-gray-400 text-sm">10</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-700">10. Roadmap de Implementação</span>
                  <span className="text-gray-400 text-sm">11</span>
                </div>
              </div>
            </div>

            {/* Objetivo */}
            <div className="py-6 border-b border-gray-200 page-break">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">1. Objetivo</h2>
              <p className="text-gray-700 text-justify">
                Apresentar análises e resultados oriundos da avaliação de maturidade do ambiente da{' '}
                <strong>{companyName}</strong>, identificando lacunas que impactam na sua maturidade, 
                propondo recomendações de melhorias técnicas e processuais que precisam ser implementadas 
                para elevação do nível de segurança. Através deste documento, a empresa terá um material 
                que auxiliará na melhoria contínua do SGSI – Sistema de Gestão de Segurança da Informação, 
                visando otimizar a segurança da informação em seus processos, recursos e pessoas.
              </p>
              <p className="text-gray-700 text-justify mt-3">
                Os trabalhos foram baseados nas entrevistas realizadas no período de{' '}
                <strong>{formatDateFull(report.assessmentStartDate)}</strong> a{' '}
                <strong>{formatDateFull(report.assessmentEndDate)}</strong>, bem como informações 
                complementares recebidas por e-mail no dia <strong>{formatDateFull(report.assessmentEndDate)}</strong>. 
                Após avaliação do ambiente, foram elaboradas recomendações do nível desejado para a organização, 
                que poderão ser aplicadas aos diversos types de ameaças identificadas.
              </p>
              <p className="text-gray-500 italic text-justify mt-3 text-sm">
                Ressaltamos que não foram realizadas análises de evidências e que todos os insumos gerados 
                neste documento são oriundos do questionário baseado nos controles da ABNT NBR ISO/IEC 27001:2022, 
                Anexo A, respondido pela <strong>{companyName}</strong>.
              </p>
            </div>

            {/* Benefícios da ISO 27001 */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">2. Benefícios da ISO 27001</h2>
              <p className="text-gray-700 text-justify">
                A ABNT NBR ISO 27001 é uma norma internacional de padrão e referência para a gestão de 
                segurança da informação na empresa. Por meio dela será desenvolvido um Sistema de Gestão 
                de Segurança da Informação (SGSI) que permitirá à empresa ter um melhor conhecimento dos 
                seus processos, activities, sistemas, ambientes e pessoas que possam impactar na segurança 
                da informação, assim como os aprimoramentos sobre os processos de gestão permitindo uma 
                melhoria contínua.
              </p>
              <p className="text-gray-700 text-justify mt-3">
                Será possível identificar por meio da matriz de priorização, anexo deste documento, quais 
                são as ameaças e vulnerabilidades identificadas relacionadas aos controles da ISO, 
                classificando os controles de crítico até o mais baixo, relacionando as medidas tecnológicas 
                e processuais para uma mitigação efetiva.
              </p>
              <p className="text-gray-700 text-justify mt-3">
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
            <div className="py-6 border-b border-gray-200 page-break">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">3. Equipe</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 text-left">{companyName}</h3>
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

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">MRS Consultoria</h3>
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

              {report.consultantTeam.length === 0 && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700 text-justify">
                    <strong>Nota sobre o processo de avaliação:</strong> Para esta avaliação, <strong>não foram contratadas horas de consultoria</strong>. 
                    O processo de preenchimento e validação das respostas foi realizado integralmente pela organização, 
                    por meio da solução <strong>Code_Assessment</strong>. 
                    A <strong>MRS Consultoria</strong> não atuou como consultora durante esta etapa, 
                    sendo as informações apresentadas de <strong>inteira responsabilidade do cliente</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Metodologia de Avaliação */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">4. Metodologia de Avaliação</h2>
              
              <p className="text-gray-700 text-justify mb-4">
                Com estrutura mais simples e controles contemporâneos, a ABNT NBR ISO/IEC 27002:2022, tem uma visão holística e coordenada dos riscos de segurança da informação das organizações (SGSI), a fim de determinar e implementar um conjunto abrangente de controles na estrutura geral de um sistema de gestão coerente. Deste modo, é possível direcionar a análise/avaliação de riscos, gerenciamento, especificação, reavaliação e implementação de segurança na <strong>{companyName}</strong>.
              </p>
              
              <p className="text-gray-700 text-justify mb-4">
                É composta por 93 controles agrupados em 4 temas:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Controles Organizacionais</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Referentes a forma com qual organização estrutura ações estratégicas, relacionadas à Gestão da Segurança da Informação, com abrangência institucional ou perante partes externas. Aqui também se incluem todos os controles que não se encaixam nas demais categorias.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <UsersIcon className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">Controles de Pessoas</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Referentes a pessoas individuais, como a organização aborda aspectos de Segurança da Informação, aliada à segurança jurídica, durante o ciclo de vida do colaborador na empresa.</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Controles Físicos</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Aspectos de segurança física, predial e ambiental da organização que impactam direta ou indiretamente na Segurança da Informação.</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-800">Controles Tecnológicos</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Referentes diretamente a tecnologia, ações e mechanisms de Segurança da Informação aplicados a recursos computacionais, sistemas e redes, repositório de dados, etc.</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-left">Níveis de Maturidade</h3>
              <p className="text-gray-700 text-justify mb-3">
                A avaliação de maturidade é baseada nos níveis mostrados abaixo. Eles fornecem a descrição sobre as práticas que a empresa possui no que tange a existência de processos de Segurança da Informação.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-300 w-16">NÍVEL</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-300 w-32">MATURIDADE</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-300">DESCRIÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 border border-gray-300 text-center font-mono">N/A</td>
                      <td className="py-2 px-3 border border-gray-300">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">NÃO SE APLICA</span>
                      </td>
                      <td className="py-2 px-3 border border-gray-300 text-gray-600">CONTROLE NÃO APLICÁVEL À ORGANIZAÇÃO</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="py-2 px-3 border border-gray-300 text-center font-mono font-bold text-red-600">0</td>
                      <td className="py-2 px-3 border border-gray-300">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white font-bold">NÃO IMPLEMENTADO</span>
                      </td>
                      <td className="py-2 px-3 border border-gray-300 text-gray-600">FALTA DE UM PROCESSO RECONHECIDO.</td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="py-2 px-3 border border-gray-300 text-center font-mono font-bold text-yellow-600">1</td>
                      <td className="py-2 px-3 border border-gray-300">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white font-bold">PARCIAL</span>
                      </td>
                      <td className="py-2 px-3 border border-gray-300 text-gray-600">JÃ ESTÃ EM APLICAÇÃO PARTES DOS CONTROLES NA INSTITUIÇÃO, MAS HÃ QUESTÕES QUE PRECISAM SER TRABALHADAS.</td>
                    </tr>
                    <tr className="bg-green-50">
                      <td className="py-2 px-3 border border-gray-300 text-center font-mono font-bold text-green-600">2</td>
                      <td className="py-2 px-3 border border-gray-300">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">IMPLEMENTADO</span>
                      </td>
                      <td className="py-2 px-3 border border-gray-300 text-gray-600">OS PROCESSOS FORAM REFINADOS A UM NÍVEL DE BOAS PRÁTICAS, RESULTADO DE UM CONTÍNUO APRIMORAMENTO E MODELAGEM DA MATURIDADE EM SEGURANÇA DA INFORMAÇÃO.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Atributos */}
            <div className="py-6 border-b border-gray-200 page-break">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">5. Atributos</h2>
              
              <p className="text-gray-700 text-justify mb-4">
                De forma complementar, a ABNT NBR ISO/IEC 27002:2022 possibilitou a análise dos controles à luz de 05 (cinco) atributos: 1) tipo de controle; 2) propriedades de segurança da informação; 3) conceitos de segurança cibernética; 4) capacidades operacionais; 5) domínios de segurança.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">5.1 Tipo de Controle</h3>
              <p className="text-gray-700 text-justify mb-2">
                Atributo utilizado para fornecer uma visão dos controles na perspectiva de quando e como uma medida altera o risco relacionado com a ocorrência de um incidente de segurança da informação. Assim, o controle poderá variar entre:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Shield className="h-3.5 w-3.5" /> Preventivo
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  <EyeIcon className="h-3.5 w-3.5" /> Detectivo
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <RefreshIcon className="h-3.5 w-3.5" /> Corretivo
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">5.2 Propriedades de Segurança da Informação</h3>
              <p className="text-gray-700 text-justify mb-2">
                Atributo para visualizar controles na perspectiva de qual característica das informações o controle contribuirá para a preservação. Os valores dos atributos consistem em:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <Lock className="h-3.5 w-3.5" /> Confidencialidade
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <CheckSquare className="h-3.5 w-3.5" /> Integridade
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <Activity className="h-3.5 w-3.5" /> Disponibilidade
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">5.3 Conceitos de Segurança Cibernética</h3>
              <p className="text-gray-700 text-justify mb-2">
                Atributo para visualizar os controles sob a perspectiva da associação de controles aos conceitos de segurança cibernética definidos no quadro de segurança cibernética descrito no ISO/IEC TS 27110. Os valores dos atributos consistem em:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  <Target className="h-3.5 w-3.5" /> Identificar
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Proteger
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  <EyeIcon className="h-3.5 w-3.5" /> Detectar
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <AlertOctagon className="h-3.5 w-3.5" /> Responder
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <RefreshIcon className="h-3.5 w-3.5" /> Recuperar
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">5.4 Capacidades Operacionais</h3>
              <p className="text-gray-700 text-justify mb-2">
                As capacidades operacionais são atributos para visualizar controles da perspectiva do praticante sobre os recursos de segurança da informação. Os valores de atributos consistem em:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Governança, Gestão de identidade e acesso</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Gestão de ameaças e vulnerabilidades</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Garantia de segurança da informação</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Gestão de eventos de segurança da informação</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Gestão de ativos</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Proteção da informação</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Legal e compliance</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Segurança física</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Configuração segura</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Segurança em recursos humanos</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Segurança de sistemas e redes</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Segurança de aplicações</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">Segurança do relacionamento na cadeia de suprimentos</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">5.5 Domínios de Segurança</h3>
              <p className="text-gray-700 text-justify mb-2">
                Os domínios de segurança são um atributo para visualizar controles na perspectiva de 4 domínios de SI:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-indigo-800">Governança e Ecossistema</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Inclui "Governança do System de Segurança da Informação e Gestão de Riscos" e "Gestão de segurança cibernética do ecossistema" (partes interessadas internas e externas).</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Proteção</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Inclui "Arquitetura de Segurança de TI", "Administração de Segurança de TI", "Gestão de identidade e acesso", "Manutenção de Segurança de TI" e "Segurança física e ambiental".</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertOctagon className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Defesa</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Inclui "Detectar" e "Gestão de Incidente de segurança computacional".</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshIcon className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">Resiliência</span>
                  </div>
                  <p className="text-xs text-gray-600 text-justify">Inclui "Operações de continuidade" e "Gestão de crises".</p>
                </div>
              </div>
            </div>

            {/* 6. Recomendações */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">6. Recomendações</h2>
              
              <p className="text-gray-700 text-justify mb-3">
                As recomendações propostas neste relatório são oriundas da norma <strong>ISO/IEC 27002:2022</strong> que fornecem um conjunto abrangente de controles de segurança da informação comumente utilizados, incluindo orientação para implementação desses controles em uma organização.
              </p>
              
              <p className="text-gray-700 text-justify mb-3">
                A norma <strong>ISO/IEC 27002:2022</strong> é complementar à norma <strong>ISO/IEC 27001</strong> e totalmente indispensável à sua aplicação. Enquanto a norma ISO/IEC 27001 estabelece os requisitos para implementação de um Sistema de Gestão da Segurança da Informação (SGSI), a norma fornece um conjunto de controles genéricos de segurança da informação, além da ISO/IEC 27002:2022 fornecer orientação para implementação de controles de segurança da informação.
              </p>
              
              <p className="text-gray-700 text-justify">
                A norma <strong>ISO/IEC 27002:2022</strong> foi concebida para ser usada pelas organizações:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 text-justify">
                <li>no contexto de um sistema de gestão de segurança da informação (SGSI) baseado na ISO/IEC 27001;</li>
                <li>para a implementação de controles de segurança da informação com base em melhores práticas reconhecidas internacionalmente;</li>
                <li>para o desenvolvimento de diretrizes específicas de gestão de segurança da informação da organização.</li>
              </ul>
            </div>

            {/* 7. Resultados da Avaliação */}
            <div className="py-6 border-b border-gray-200 page-break">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">7. Resultados da Avaliação</h2>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 text-left">7.1 Categorização dos controles</h3>
              <p className="text-gray-700 text-justify mb-3">
                A análise dos controles e processos utilizados pela <strong>{companyName}</strong>, no que se refere a ISO 27001, permitiu identificar a média geral do Nível de Maturidade dos 93 controles, que estão claramente subdivididos e resumidos em 4 áreas temáticas: controles organizacionais, controle de pessoas, controles físicos e controles tecnológicos. O resultado exibido abaixo diz respeito ao <strong>percentual de controles efetivamente implementados</strong>.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {resultados?.categorizacao?.categories?.map((cat: any, index: number) => {
                  const colors = [
                    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                    { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
                    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div key={index} className={`${color.bg} border ${color.border} rounded-xl p-3 text-center`}>
                      <div className={`text-2xl font-bold ${color.text}`}>{cat.pImpl}%</div>
                      <p className={`text-xs font-medium ${color.text} mt-1`}>{cat.name}</p>
                    </div>
                  );
                })}
              </div>

              <p className="text-gray-700 text-justify mt-4 mb-3">
                O quadro abaixo mostra o quantitativo de controles identificados em cada uma das 04 (quatro) categorizações da ISO 27001:2022, bem como a quantidade de controles que se encontram implementados, parcialmente implementados, não implementados e os que não se aplicam, mostrando uma visão geral das lacunas que foram encontradas na <strong>{companyName}</strong>.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-300">Categorização</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Total</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Não Aplicáveis</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Implementados</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Parciais</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Não Implementados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados?.categorizacao?.categories?.map((cat: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-3 border border-gray-300 text-gray-700">{cat.name}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center font-bold">{cat.total}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center">{cat.na}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center text-emerald-600 font-bold">{cat.implemented}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center text-amber-600 font-bold status-parcial">{cat.partial}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center text-red-600 font-bold status-nao-implementado">{cat.notImpl}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200 font-bold">
                      <td className="py-2 px-3 border border-gray-300 text-gray-900">Total  niveis</td>
                      <td className="py-2 px-3 border border-gray-300 text-center">{resultados?.categorizacao?.totals?.total || 0}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center">{resultados?.categorizacao?.totals?.na || 0}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center text-emerald-700">{resultados?.categorizacao?.totals?.implemented || 0}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center text-amber-700 status-parcial">{resultados?.categorizacao?.totals?.partial || 0}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center text-red-700 status-nao-implementado">{resultados?.categorizacao?.totals?.notImpl || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2 text-left page-break">7.2 Capacidades Operacionais</h3>
              <p className="text-gray-700 text-justify mb-3">
                A capacidade operacional analisa os controles da perspectiva de seus recursos operacionais de segurança da informação e oferece suporte a uma visão prática dos controles pelo usuário.
              </p>

              {resultados?.capacidades?.radarData && resultados.capacidades.radarData.length > 0 && (
                <div className="mt-4 mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2 text-left">Radar de Capacidades Operacionais</h4>
                  <p className="text-xs text-gray-500 mb-3 text-justify">
                    Comparação entre o nível implementado e o recomendado (100%) por capacidade
                  </p>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-center items-center">
                    <RadarChart
                      data={resultados.capacidades.radarData}
                      title="Radar de Capacidades Operacionais"
                      subtitle="Comparação entre o nível implementado e o recomendado (100%) por capacidade"
                      height={320}
                      colors={{ Implementado: '#10b981', Recomendado: '#94a3b8' }}
                    />
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-300">Capacidades Operacionais</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Não se aplica</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Não Implementado</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Parcial</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-300">Implementados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados?.capacidades?.capabilities?.map((cap: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-3 border border-gray-300 text-gray-700">{cap.name}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center">0</td>
                        <td className="py-2 px-3 border border-gray-300 text-center text-red-600 font-bold status-nao-implementado">{cap.notImpl}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center text-amber-600 font-bold status-parcial">{cap.partial}</td>
                        <td className="py-2 px-3 border border-gray-300 text-center text-emerald-600 font-bold">{cap.implemented}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200 font-bold">
                      <td className="py-2 px-3 border border-gray-300 text-gray-900">Total de Controles</td>
                      <td className="py-2 px-3 border border-gray-300 text-center">0</td>
                      <td className="py-2 px-3 border border-gray-300 text-center text-red-700 status-nao-implementado">{resultados?.capacidades?.totals?.notImpl || 0}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center text-amber-700 status-parcial">{resultados?.capacidades?.totals?.partial || 0}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center text-emerald-700 font-bold">{resultados?.capacidades?.totals?.implemented || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-gray-700 text-justify">
                  <strong>Legenda:</strong> O "Total de Controles" na linha de rodapé corresponde ao quantitativo total de <strong>capacidades operacionais</strong> aplicadas (ou não aplicáveis) para o total das 93 Categorias da ISO 27001:2022, considerando-se que um mesmo controle pode ter mais de uma capacidade operacional a ele atribuída.
                </p>
              </div>
            </div>

            {/* 8. Cenário atual e Recomendações */}
            <div className="py-6 border-b border-gray-200 page-break">
              <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">8. Cenário atual e Recomendações</h2>

              {recomendacoes.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  Nenhum controle com necessidade de atenção identificado.
                </p>
              ) : (
                <>
                  {['Controles organizacionais', 'Controles de pessoas', 'Controles físicos', 'Controles tecnológicos'].map(dominio => {
                    const items = recomendacoes.filter(r => r.dominio === dominio);
                    if (items.length === 0) return null;

                    const dominioNumero = {
                      'Controles organizacionais': '5',
                      'Controles de pessoas': '6',
                      'Controles físicos': '7',
                      'Controles tecnológicos': '8',
                    }[dominio] || '5';

                    return (
                      <div key={dominio} className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-left">
                          {dominioNumero} – {dominio}
                        </h3>

                        {items.map((item, idx) => {
                          const isNaoImpl = item.status?.toLowerCase().includes('não') || item.status?.toLowerCase().includes('nao');
                          const isParcial = item.status?.toLowerCase().includes('parcial');
                          const statusClass = isNaoImpl ? 'status-nao-implementado' : isParcial ? 'status-parcial' : '';

                          return (
                            <div key={idx} id={`recomendacao-${item.controlId}`} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg scroll-mt-20">
                              <h4 className="text-md font-bold text-gray-900 mb-1 text-left">
                                {item.controlId} {item.titulo}
                              </h4>

                              <div className="mb-2">
                                <span className={`text-xs font-bold ${statusClass}`}>
                                  {item.status}
                                </span>
                              </div>

                              <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-700 text-left">Cenário identificado</p>
                                <p className="text-xs text-gray-600 text-justify mt-0.5">
                                  {item.cenarioIdentificado || 'Cenário não descrito para este controle.'}
                                </p>
                              </div>

                              <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-700 text-left">Recomendações</p>
                                <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
                                  {item.recomendacoes && item.recomendacoes.length > 0 ? (
                                    item.recomendacoes.map((rec: string, recIdx: number) => (
                                      <li key={recIdx} className="text-xs text-gray-600 text-justify">{rec}</li>
                                    ))
                                  ) : (
                                    <li className="text-xs text-gray-400">Recomendação não cadastrada para este controle.</li>
                                  )}
                                </ul>
                              </div>

                              {item.solucoesTecnicas && item.solucoesTecnicas.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 text-left">Soluções técnicas de apoio</p>
                                  <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
                                    {item.solucoesTecnicas.map((sol: string, solIdx: number) => (
                                      <li key={solIdx} className="text-xs text-gray-600 text-justify">{sol}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-700 text-justify">
                      <strong>Legenda:</strong> Os controles listados acima são aqueles que foram avaliados como <strong>Parcialmente implementados</strong> ou <strong>Não implementados</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

   {/* 9. Matriz de Priorização */}
<div className="py-6 border-b border-gray-200 page-break">
  <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">9. Matriz de Priorização</h2>
  
  <p className="text-gray-700 text-justify mb-3 text-sm">
    Eventual plano de ação para adequação, em razão do resultado deste assessment, deve considerar estratégias de SI e esforços. Para subsidiar as decisões inerentes, elaboramos a <strong>{companyName}</strong> - Matriz de Priorização 27001:2022, documento anexo que contém sugestão de priorização, analisando-se probabilidade e impacto de riscos se materializarem perante das vulnerabilidades identificadas no ambiente da organização.
  </p>

  <div className="overflow-x-auto mt-4">
    <table className="w-full text-sm border-collapse" style={{ fontSize: '8.5pt' }}>
      <thead>
        <tr className="bg-blue-50">
          <th className="text-left py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>METODOLOGIA</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>ID REF.</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>ID Controle</th>
          <th className="text-left py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Controle</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Maturidade</th>
          <th className="text-left py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Cenário identificado</th>
          <th className="text-left py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Vulnerabilidades e Ameaças</th>
          <th className="text-left py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Soluções técnicas</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Probabilidade</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Impacto</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Classificação</th>
          <th className="text-center py-1 px-2 font-semibold text-blue-700 border border-blue-300" style={{ fontSize: '8pt' }}>Priorização</th>
        </tr>
      </thead>
      <tbody>
        {matrizPriorizacao.length === 0 ? (
          <tr>
            <td className="py-2 px-2 border border-gray-300 text-center text-gray-500" colSpan={12}>
              Nenhum dado disponível para a matriz de priorização.
            </td>
          </tr>
        ) : (
          matrizPriorizacao.map((item, index) => {
            const priorityStyles = {
              'Crítico': { bg: 'bg-red-100' },
              'Muito Alto': { bg: 'bg-orange-100' },
              'Alto': { bg: 'bg-yellow-100' },
              'Médio': { bg: 'bg-blue-100' },
              'Baixo': { bg: 'bg-green-100' },
              'Muito Baixo': { bg: 'bg-gray-100' },
            };
            const priorityStyle = priorityStyles[item.priority as keyof typeof priorityStyles] || { bg: 'bg-gray-100' };
            
            const hasRecommendation = recomendacoes.some(r => r.controlId === item.controlId);
            
            return (
              <tr key={index} className={priorityStyle.bg}>
                <td className="py-1 px-2 border border-gray-300 text-black" style={{ fontSize: '8pt' }}>ISO 27001</td>
                <td className="py-1 px-2 border border-gray-300 text-center text-black" style={{ fontSize: '8pt' }}>{item.refId || (index + 1)}</td>
                <td className="py-1 px-2 border border-gray-300 text-center text-black" style={{ fontSize: '8pt' }}>{item.controlId}</td>
                <td className="py-1 px-2 border border-gray-300 text-black" style={{ fontSize: '8pt' }}>{item.controlName}</td>
                <td className="py-1 px-2 border border-gray-300 text-center text-black" style={{ fontSize: '8pt' }}>{item.maturity}</td>
                <td className="py-1 px-2 border border-gray-300 text-black" style={{ fontSize: '7.5pt' }}>{item.scenario}</td>
                <td className="py-1 px-2 border border-gray-300 whitespace-pre-wrap text-black" style={{ fontSize: '7.5pt' }}>{item.vulnerabilities}</td>
                <td className="py-1 px-2 border border-gray-300 text-black" style={{ fontSize: '7.5pt' }}>
                  {hasRecommendation ? (
                    <a 
                      href={`#recomendacao-${item.controlId}`}
                      className="text-blue-600 underline hover:text-blue-800 font-medium"
                    >
                      Ver soluções técnicas
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-1 px-2 border border-gray-300 text-center font-bold text-black" style={{ fontSize: '8pt' }}>{item.probability}</td>
                <td className="py-1 px-2 border border-gray-300 text-center font-bold text-black" style={{ fontSize: '8pt' }}>{item.impact}</td>
                <td className="py-1 px-2 border border-gray-300 text-center font-bold text-black" style={{ fontSize: '8pt' }}>{item.riskScore}</td>
                <td className="py-1 px-2 border border-gray-300 text-center text-xs font-bold text-black" style={{ fontSize: '7pt' }}>
                  {item.priority}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>

  {/* Legenda da Matriz de Priorização */}
  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
    <p className="text-xs font-semibold text-gray-700 mb-1">Nível de Priorização</p>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 bg-red-500 rounded"></span>
        <span className="text-xs text-gray-600">Crítico (9)</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 bg-orange-400 rounded"></span>
        <span className="text-xs text-gray-600">Muito Alto (8)</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 bg-yellow-400 rounded"></span>
        <span className="text-xs text-gray-600">Alto (7)</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 bg-blue-400 rounded"></span>
        <span className="text-xs text-gray-600">Médio (6,5,4)</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 bg-green-400 rounded"></span>
        <span className="text-xs text-gray-600">Baixo (3,2,1)</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-3 h-3 bg-gray-400 rounded"></span>
        <span className="text-xs text-gray-600">Muito Baixo (0)</span>
      </div>
    </div>
  </div>
</div>

            {/* Botão para sair do modo de impressão */}
            <div className="text-center py-6 print:hidden no-print">
              <Button onClick={() => setIsPrintMode(false)}>
                Voltar para visualização
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Gerando...' : 'Atualizar Dados'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsPrintMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Relatório
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações do Projeto</CardTitle>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              )}
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conteúdo do Relatório</CardTitle>
              <p className="text-sm text-gray-500">
                Clique em "Visualizar Relatório" para ver o documento completo no formato do template
              </p>
            </div>
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
                { id: 'resultados', label: '7. Resultados da Avaliação', icon: BarChart3 },
                { id: 'cenarioAtual', label: '8. Cenário atual e Recomendações', icon: Lightbulb },
                { id: 'matrizPriorizacao', label: '9. Matriz de Priorização', icon: Target },
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